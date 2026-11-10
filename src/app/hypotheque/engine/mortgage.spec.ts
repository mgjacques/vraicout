import { describe, expect, it } from 'vitest';
import { explainMoney } from '../../shared/engine/formulas';
import { Money } from '../../shared/engine/money';
import { fr } from '../../shared/i18n/fr';
import { defaultMortgageForm, missingMortgageFields, toMortgageInput } from './blank';
import { deathAt, monthlyPayment, monthlyRate, projectMortgage } from './mortgage';
import { MortgageInput, TermPolicy } from './types';

type Overrides = Partial<Pick<MortgageInput, 'couple' | 'bankPremium'>> & {
  loan?: Partial<MortgageInput['loan']>;
  p1?: Partial<TermPolicy>;
  p2?: Partial<TermPolicy>;
};

function quote(overrides: Overrides = {}): MortgageInput {
  const base = toMortgageInput(defaultMortgageForm());
  const { loan, p1, p2, ...rest } = overrides;
  return {
    ...base,
    ...rest,
    loan: { ...base.loan, ...loan },
    people: { p1: { ...base.people.p1, ...p1 }, p2: { ...base.people.p2, ...p2 } },
  };
}

const lookup = (key: string) => fr[key as keyof typeof fr];

describe('projectMortgage', () => {
  it('amortizes the Canadian way: interest compounded twice a year', () => {
    // The usual published figure for 100 000 $ at 6 % over 25 years.
    expect(monthlyPayment(100_000, monthlyRate(0.06), 300)).toBeCloseTo(639.81, 2);
    expect(monthlyPayment(12_000, 0, 120)).toBe(100);
    const result = projectMortgage(quote({ loan: { amount: 100_000, rate: 0.06, years: 25 } }));
    expect(result.payment.value).toBeCloseTo(639.81, 2);
  });

  it('starts the bank coverage at the loan and brings it down to zero', () => {
    const result = projectMortgage(quote());
    const balances = result.rows.map((row) => row.balance);
    expect(balances[0]).toBe(350_000);
    expect(result.rows).toHaveLength(25);
    for (let i = 1; i < balances.length; i++) expect(balances[i]).toBeLessThan(balances[i - 1]);
    // What is left at the start of the last year is about one year of payments.
    expect(balances[24]).toBeLessThan(result.payment.value * 12);
    expect(balances[24]).toBeGreaterThan(result.payment.value * 11);
  });

  it('keeps the term coverage level until the term ends', () => {
    const result = projectMortgage(quote({ p1: { years: 20 } }));
    expect(result.rows[19].term.p1).toBe(350_000);
    expect(result.rows[20].term.p1).toBe(0);
    expect(result.term.premiumsPaid.value).toBe(25 * 12 * 20);
    expect(result.bank.premiumsPaid.value).toBe(40 * 12 * 25);
    const fit = result.fits[0];
    expect(fit.endsEarly?.year).toBe(21);
    expect(fit.endsEarly?.balance.value).toBeCloseTo(result.rows[20].balance, 6);
  });

  it('counts only the term years that fall during the loan', () => {
    const result = projectMortgage(quote({ p1: { years: 30 } }));
    expect(result.term.premiumsPaid.value).toBe(25 * 12 * 25);
    expect(result.fits[0]).toEqual({ person: 'p1', endsEarly: null, yearsAfter: 5 });
  });

  it('measures how far the bank coverage has melted in the chosen year', () => {
    const result = projectMortgage(quote());
    expect(deathAt(result, 1, 'p1').balanceShare).toBe(1);
    const middle = deathAt(result, 13, 'p1');
    expect(middle.balanceShare).toBeCloseTo(result.rows[12].balance / 350_000, 10);
    expect(middle.balanceShare).toBeLessThan(deathAt(result, 12, 'p1').balanceShare);
    expect(deathAt(result, 25, 'p1').balanceShare).toBeLessThan(0.1);
  });

  it('names the cheaper option and the gap in premiums', () => {
    const result = projectMortgage(quote());
    expect(result.premiumGap?.cheaper).toBe('term');
    expect(result.premiumGap?.amount.value).toBe((40 - 25) * 12 * 25);
    expect(projectMortgage(quote({ bankPremium: 25 })).premiumGap).toBeNull();
  });

  it('leaves the family what the term pays beyond the balance, and names any shortfall', () => {
    const result = projectMortgage(quote());
    const death = deathAt(result, 10, 'p1');
    const balance = result.rows[9].balance;
    expect(death.balance.value).toBe(balance);
    expect(death.bank.payout.value).toBe(balance);
    expect(death.term.payout.value).toBe(350_000);
    expect(death.term.free?.value).toBeCloseTo(350_000 - balance, 6);
    expect(death.term.shortfall).toBeNull();
    expect(death.term.survivorCoverage).toBeNull();

    const small = deathAt(projectMortgage(quote({ p1: { amount: 200_000 } })), 1, 'p1');
    expect(small.term.free).toBeNull();
    expect(small.term.shortfall?.value).toBe(150_000);

    const ended = deathAt(projectMortgage(quote({ p1: { years: 10 } })), 15, 'p1');
    expect(ended.term.payout.value).toBe(0);
    expect(ended.term.payout.formulaId).toBe('formula.mortgage.death.term.ended');
  });

  it('pays the bank once for a couple, while the survivor keeps a term policy', () => {
    const result = projectMortgage(quote({ couple: true, bankPremium: 70, p2: { years: 20 } }));
    expect(result.people).toEqual(['p1', 'p2']);
    expect(result.term.premium.value).toBe(47);
    expect(result.term.premiumsPaid.value).toBe(25 * 12 * 25 + 22 * 12 * 20);

    const early = deathAt(result, 5, 'p1');
    expect(early.term.survivorCoverage?.value).toBe(350_000);
    const late = deathAt(result, 22, 'p1');
    expect(late.term.survivorCoverage?.value).toBe(0);
    expect(deathAt(result, 22, 'p2').term.payout.value).toBe(0);
  });

  it('ignores the second person alone on the loan', () => {
    const result = projectMortgage(quote({ p2: { premium: 999 } }));
    expect(result.people).toEqual(['p1']);
    expect(result.term.premium.value).toBe(25);
    expect(result.rows.every((row) => row.term.p2 === 0)).toBe(true);
    expect(deathAt(result, 3, 'p2').person).toBe('p1');
  });

  it('clamps values out of range', () => {
    const result = projectMortgage(quote({ loan: { years: 90, rate: 2 }, p1: { years: 0 } }));
    expect(result.input.loan.years).toBe(40);
    expect(result.input.loan.rate).toBe(0.15);
    expect(result.input.people.p1.years).toBe(1);
  });

  it('explains every amount with the catalog operands', () => {
    for (const couple of [false, true]) {
      for (const p1 of [{}, { years: 10 }, { amount: 100_000 }]) {
        const result = projectMortgage(quote({ couple, p1, p2: { years: 10 } }));
        const amounts: Money[] = [result.payment, result.premiumGap!.amount];
        for (const option of [result.term, result.bank]) {
          amounts.push(option.premium, option.premiumsPaid);
        }
        for (const fit of result.fits) if (fit.endsEarly) amounts.push(fit.endsEarly.balance);
        for (const year of [1, 15]) {
          const death = deathAt(result, year, 'p1');
          amounts.push(death.balance, death.term.payout, death.bank.payout);
          for (const extra of [
            death.term.free,
            death.term.shortfall,
            death.term.survivorCoverage,
          ]) {
            if (extra) amounts.push(extra);
          }
        }
        for (const amount of amounts) {
          for (const id of [amount.formulaId, ...(amount.steps ?? []).map((s) => s.formulaId)]) {
            expect(fr).toHaveProperty(id);
          }
          expect(explainMoney(amount, lookup)).not.toMatch(/\{\w+\}/);
          const tokens = [...lookup(amount.formulaId)!.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
          for (const token of tokens) expect(amount.params).toHaveProperty(token);
        }
      }
    }
  });
});

describe('mortgage form', () => {
  it('starts complete and asks for the second person only in couple mode', () => {
    const form = defaultMortgageForm();
    expect(missingMortgageFields(form)).toEqual([]);
    form.people.p2.premium = null;
    expect(missingMortgageFields(form)).toEqual([]);
    form.couple = true;
    form.loan.rate = null;
    expect(missingMortgageFields(form)).toEqual(['loanRate', 'termPremium2']);
  });

  it('accepts a rate of 0 and a premium of 0', () => {
    const form = defaultMortgageForm();
    form.loan.rate = 0;
    form.bankPremium = 0;
    expect(missingMortgageFields(form)).toEqual([]);
  });
});
