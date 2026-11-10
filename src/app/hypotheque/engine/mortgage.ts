import { money } from '../../shared/engine/formulas';
import { clamp, finite } from '../../shared/engine/limits';
import {
  DeathOutcome,
  MortgageInput,
  MortgageProjection,
  MortgageYearRow,
  OptionResult,
  PersonId,
  TermFit,
  TermPolicy,
} from './types';

/**
 * Compare one's own term policy with the bank's mortgage life insurance over the years of
 * the loan. The loan is amortized the Canadian way: interest compounds twice a year, paid
 * monthly. The bank's coverage is the balance owed and pays the bank once, at the first
 * death; a term policy pays its fixed amount to whoever the person chose, until its term ends.
 * Each premium is fixed, as quoted, and counted for every year it is paid during the loan.
 */
export function projectMortgage(raw: MortgageInput): MortgageProjection {
  const input = sanitize(raw);
  const { loan } = input;
  const months = loan.years * 12;
  const rate = monthlyRate(loan.rate);
  const payment = monthlyPayment(loan.amount, rate, months);
  const balances = balancesByYear(loan.amount, rate, payment, loan.years);
  const people: PersonId[] = input.couple ? ['p1', 'p2'] : ['p1'];

  const covers = (policy: TermPolicy, year: number) => (year <= policy.years ? policy.amount : 0);
  const rows: MortgageYearRow[] = [];
  let termPaid = 0;
  let bankPaid = 0;
  for (let year = 1; year <= loan.years; year++) {
    for (const id of people) {
      if (year <= input.people[id].years) termPaid += input.people[id].premium * 12;
    }
    bankPaid += input.bankPremium * 12;
    rows.push({
      year,
      balance: balances[year - 1],
      term: {
        p1: covers(input.people.p1, year),
        p2: input.couple ? covers(input.people.p2, year) : 0,
      },
      premiums: { term: termPaid, bank: bankPaid },
    });
  }

  const suffix = input.couple ? '.couple' : '';
  const p1 = input.people.p1;
  const p2 = input.people.p2;
  const paidYears = (policy: TermPolicy) => Math.min(policy.years, loan.years);

  const term: OptionResult = {
    premium: money(
      p1.premium + (input.couple ? p2.premium : 0),
      `formula.mortgage.premium.term${suffix}`,
      { premium1: p1.premium, premium2: p2.premium },
    ),
    premiumsPaid: money(termPaid, `formula.mortgage.paid.term${suffix}`, {
      premium1: p1.premium,
      years1: paidYears(p1),
      premium2: p2.premium,
      years2: paidYears(p2),
    }),
  };

  const bank: OptionResult = {
    premium: money(input.bankPremium, `formula.mortgage.premium.bank${suffix}`, {}),
    premiumsPaid: money(bankPaid, 'formula.mortgage.paid.bank', {
      premium: input.bankPremium,
      years: loan.years,
    }),
  };

  const fits = people.map((id): TermFit => {
    const policy = input.people[id];
    const endsEarly =
      policy.years < loan.years
        ? {
            year: policy.years + 1,
            balance: money(balances[policy.years], 'formula.mortgage.balance', {
              loan: loan.amount,
              year: policy.years + 1,
            }),
          }
        : null;
    return { person: id, endsEarly, yearsAfter: Math.max(0, policy.years - loan.years) };
  });

  return {
    input,
    people,
    months,
    payment: money(payment, 'formula.mortgage.payment', {
      loan: loan.amount,
      years: loan.years,
      ratePercent: loan.rate * 100,
    }),
    term,
    bank,
    premiumGap:
      termPaid === bankPaid
        ? null
        : {
            cheaper: termPaid < bankPaid ? 'term' : 'bank',
            amount: money(Math.abs(termPaid - bankPaid), 'formula.mortgage.gap.premiums', {
              leftValue: Math.max(termPaid, bankPaid),
              rightValue: Math.min(termPaid, bankPaid),
            }),
          },
    fits,
    rows,
  };
}

/**
 * What each option pays if `person` dies during loan `year`. The balance is the one owed
 * at the start of that year, as for the bank's coverage: a slight overstatement, within a year.
 */
export function deathAt(
  projection: MortgageProjection,
  year: number,
  person: PersonId,
): DeathOutcome {
  const { input, rows } = projection;
  const row = rows[Math.min(Math.max(1, Math.round(year)), rows.length) - 1];
  const who = projection.people.includes(person) ? person : 'p1';
  const survivor: PersonId = who === 'p1' ? 'p2' : 'p1';
  const payout = row.term[who];
  const left = payout - row.balance;
  const policy = input.people[who];
  const termPayout = money(
    payout,
    payout > 0 ? 'formula.mortgage.death.term' : 'formula.mortgage.death.term.ended',
    { amount: policy.amount, termYears: policy.years, year: row.year },
  );
  return {
    year: row.year,
    person: who,
    balance: money(row.balance, 'formula.mortgage.balance', {
      loan: input.loan.amount,
      year: row.year,
    }),
    balanceShare: input.loan.amount > 0 ? row.balance / input.loan.amount : 0,
    term: {
      payout: termPayout,
      free:
        left >= 0
          ? money(left, 'formula.mortgage.death.free', { payout, balance: row.balance })
          : null,
      shortfall:
        left < 0
          ? money(-left, 'formula.mortgage.death.shortfall', { payout, balance: row.balance })
          : null,
      survivorCoverage: input.couple
        ? money(
            row.term[survivor],
            row.term[survivor] > 0
              ? 'formula.mortgage.death.survivor'
              : 'formula.mortgage.death.survivor.ended',
            {
              amount: input.people[survivor].amount,
              termYears: input.people[survivor].years,
              year: row.year,
            },
          )
        : null,
    },
    bank: {
      payout: money(row.balance, 'formula.mortgage.death.bank', { year: row.year }),
    },
  };
}

/** The Canadian monthly rate: a yearly rate compounded twice a year, (1 + rate / 2)^(1/6) − 1. */
export function monthlyRate(yearly: number): number {
  return Math.pow(1 + yearly / 2, 1 / 6) - 1;
}

/** The level payment that clears `amount` in `months`: amount × r / (1 − (1 + r)^−months). */
export function monthlyPayment(amount: number, rate: number, months: number): number {
  if (months <= 0) return 0;
  if (rate === 0) return amount / months;
  return (amount * rate) / (1 - Math.pow(1 + rate, -months));
}

/** Balance owed at the start of each loan year, then 0 once the last payment is made. */
function balancesByYear(amount: number, rate: number, payment: number, years: number): number[] {
  const out = [amount];
  let balance = amount;
  for (let month = 1; month <= years * 12; month++) {
    balance = balance * (1 + rate) - payment;
    if (month % 12 === 0) out.push(Math.max(0, balance));
  }
  out[years] = 0;
  return out;
}

function sanitize(input: MortgageInput): MortgageInput {
  const policy = (p: TermPolicy): TermPolicy => ({
    label: p.label,
    amount: Math.max(0, finite(p.amount, 0)),
    years: Math.round(clamp(finite(p.years, 25), 1, 40)),
    premium: Math.max(0, finite(p.premium, 0)),
  });
  return {
    loan: {
      amount: Math.max(0, finite(input.loan.amount, 0)),
      years: Math.round(clamp(finite(input.loan.years, 25), 1, 40)),
      rate: clamp(finite(input.loan.rate, 0), 0, 0.15),
    },
    couple: Boolean(input.couple),
    people: { p1: policy(input.people.p1), p2: policy(input.people.p2) },
    bankPremium: Math.max(0, finite(input.bankPremium, 0)),
  };
}
