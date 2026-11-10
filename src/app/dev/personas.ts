/**
 * The fictional people of docs/personas.md, as each tool's form would hold them.
 * Development only: loaded with `?persona=<id>` (see persona-loader.ts), never shipped.
 * Keep in step with docs/personas.md.
 */
import { ScenarioForm, toForm } from '../assurance/engine/blank';
import { ScenarioInput, ValueAnchor } from '../assurance/engine/types';
import { SpendingForm } from '../depenses/engine/blank';
import { SavingsForm } from '../epargne/engine/blank';
import { FeesForm } from '../frais/engine/blank';
import { WorkForm } from '../heures/engine/blank';
import { MortgageForm } from '../hypotheque/engine/blank';
import { MarginalForm } from '../impot/engine/blank';
import { SplitForm } from '../partage/engine/blank';

export interface Persona {
  name: string;
  insurance?: ScenarioForm;
  fees?: FeesForm;
  mortgage?: MortgageForm;
  split?: SplitForm;
  hours?: WorkForm;
  spending?: SpendingForm;
  savings?: SavingsForm;
  marginal?: MarginalForm;
}

const row = (age: number, guaranteed: number | null, projected: number | null): ValueAnchor => ({
  age,
  guaranteed,
  projected,
});

type InsuranceParts = {
  age: number;
  horizon?: number;
  permanent: Partial<ScenarioInput['permanent']>;
  term: Partial<ScenarioInput['term']>;
  params?: Partial<ScenarioInput['params']>;
};

/** The insurance form, from the figures the persona would type. */
function insurance(parts: InsuranceParts): ScenarioForm {
  return toForm({
    profile: { currentAge: parts.age, horizonAge: parts.horizon ?? 0 },
    permanent: {
      premium: 0,
      periodicity: 'month',
      deathBenefit: 0,
      inForce: false,
      cashValueNow: 0,
      premiumYearsRemaining: 0,
      projectedGrowth: 0,
      anchors: [],
      ...parts.permanent,
    },
    term: { premium: 0, periodicity: 'month', deathBenefit: 0, durationYears: 20, ...parts.term },
    params: {
      annualReturn: 0.032,
      reinvestShare: 1,
      extraSavingsMonthly: 0,
      account: 'tfsa',
      taxRate: 0.36,
      taxRateLater: 0.36,
      realDollars: false,
      inflation: 0.02,
      ...parts.params,
    },
  });
}

function fees(form: Partial<FeesForm> & Pick<FeesForm, 'portfolios'>): FeesForm {
  return {
    initialAmount: 0,
    monthlyContribution: 0,
    years: 30,
    grossReturn: 0.06,
    account: 'tfsa',
    taxRate: 0.3,
    taxRateLater: 0.3,
    realDollars: false,
    inflation: 0.02,
    drawdown: { enabled: false, years: 25 },
    ...form,
  };
}

function spending(form: Partial<SpendingForm> & Pick<SpendingForm, 'amount'>): SpendingForm {
  return {
    count: 1,
    cadence: 'perWeek',
    years: 10,
    annualReturn: 0.07,
    priceGrowth: false,
    inflation: 0.02,
    ...form,
  };
}

function savings(form: Partial<SavingsForm>): SavingsForm {
  return {
    initial: null,
    monthly: null,
    depositYears: null,
    growthYears: null,
    annualReturn: 0.06,
    delayYears: null,
    realDollars: false,
    inflation: 0.02,
    ...form,
  };
}

const alex = insurance({
  age: 36,
  permanent: { premium: 140, deathBenefit: 150_000 },
  term: { premium: 30, deathBenefit: 400_000, durationYears: 20 },
});
// Alex leaves the years of premiums empty, as someone in a hurry would.
alex.permanent.premiumYearsRemaining = null;

export const PERSONAS: Record<string, Persona> = {
  camille: {
    name: 'Camille, 28 ans',
    insurance: insurance({
      age: 28,
      permanent: {
        premium: 95,
        deathBenefit: 100_000,
        premiumYearsRemaining: 20,
        projectedGrowth: 0.02,
        anchors: [row(48, 14_000, 24_000), row(65, 38_000, 72_000)],
      },
      term: { premium: 22, deathBenefit: 250_000, durationYears: 20 },
      params: { annualReturn: 0.065 },
    }),
    fees: fees({
      monthlyContribution: 200,
      years: 37,
      portfolios: {
        a: { label: 'Fonds de banque', mer: 0.021, advisorFee: 0 },
        b: { label: 'FNB', mer: 0.0025, advisorFee: 0 },
      },
    }),
    hours: {
      frequency: 'biweekly',
      salary: 1_900,
      hoursPerWeek: 37.5,
      workCosts: 120,
      price: 450,
      recurrence: 'month',
      addTax: false,
    },
    spending: spending({ amount: 4.75, count: 5, cadence: 'perWeek' }),
    marginal: { income: 72_000, extra: 3_000 },
  },
  'karim-sophie': {
    name: 'Karim et Sophie, 34 et 33 ans',
    insurance: insurance({
      age: 34,
      permanent: { premium: 210, deathBenefit: 250_000, premiumYearsRemaining: 20 },
      term: { premium: 35, deathBenefit: 500_000, durationYears: 30 },
      params: { account: 'rrsp', taxRate: 0.36, taxRateLater: 0.26 },
    }),
    mortgage: {
      loan: { amount: 420_000, years: 25, rate: 0.0449 },
      couple: true,
      people: {
        p1: { label: 'Karim', amount: 450_000, years: 25, premium: 32 },
        p2: { label: 'Sophie', amount: 450_000, years: 25, premium: 28 },
      },
      bankPremium: 78,
    },
    split: {
      people: {
        p1: { label: 'Karim', frequency: 'year', salary: 88_000 },
        p2: { label: 'Sophie', frequency: 'year', salary: 61_000 },
      },
      bill: 2_350,
    },
  },
  'marie-eve': {
    name: 'Marie-Ève, 41 ans',
    insurance: insurance({
      age: 41,
      horizon: 85,
      permanent: {
        premium: 65,
        deathBenefit: 50_000,
        inForce: true,
        cashValueNow: 6_200,
        premiumYearsRemaining: 10,
        projectedGrowth: 0.015,
        anchors: [row(41, 6_200, 6_800), row(51, 14_500, 18_000), row(65, 21_000, 31_000)],
      },
      term: { premium: 38, deathBenefit: 300_000, durationYears: 20 },
      params: { annualReturn: 0.05, reinvestShare: 0.5 },
    }),
    mortgage: {
      loan: { amount: 185_000, years: 17, rate: 0.051 },
      couple: false,
      people: {
        p1: { label: 'Marie-Ève', amount: 200_000, years: 20, premium: 24 },
        p2: { label: '', amount: 200_000, years: 20, premium: 24 },
      },
      bankPremium: 41,
    },
    hours: {
      frequency: 'semimonth',
      salary: 1_650,
      hoursPerWeek: 35,
      workCosts: 450,
      price: 389,
      recurrence: 'once',
      addTax: true,
    },
    spending: spending({ amount: 65, count: 6, cadence: 'everyWeeks', years: 15 }),
    savings: savings({ monthly: 100, depositYears: 17, annualReturn: 0.05 }),
  },
  'jean-francois': {
    name: 'Jean-François, 52 ans',
    insurance: insurance({
      age: 52,
      horizon: 95,
      permanent: {
        premium: 17_000,
        periodicity: 'year',
        deathBenefit: 1_000_000,
        inForce: true,
        cashValueNow: 140_000,
        premiumYearsRemaining: 8,
        projectedGrowth: 0.025,
        anchors: [
          row(60, 260_000, 330_000),
          row(75, 480_000, 690_000),
          row(90, 720_000, 1_200_000),
        ],
      },
      term: { premium: 2_600, periodicity: 'year', deathBenefit: 1_000_000, durationYears: 20 },
      params: {
        annualReturn: 0.065,
        account: 'rrsp',
        taxRate: 0.47,
        taxRateLater: 0.36,
        realDollars: true,
        inflation: 0.025,
      },
    }),
    fees: fees({
      initialAmount: 450_000,
      monthlyContribution: 2_500,
      years: 13,
      account: 'taxable',
      taxRate: 0.47,
      taxRateLater: 0.36,
      drawdown: { enabled: true, years: 25 },
      portfolios: {
        a: { label: 'Avec conseiller', mer: 0.008, advisorFee: 0.01 },
        b: { label: 'FNB', mer: 0.002, advisorFee: 0 },
      },
    }),
    marginal: { income: 160_000, extra: 40_000 },
  },
  lucie: {
    name: 'Lucie, 63 ans',
    insurance: insurance({
      age: 63,
      horizon: 95,
      permanent: {
        premium: 0,
        deathBenefit: 75_000,
        inForce: true,
        cashValueNow: 48_000,
        premiumYearsRemaining: 0,
        projectedGrowth: 0.01,
        anchors: [row(63, 48_000, 51_000), row(80, 59_000, 66_000), row(95, 72_000, 78_000)],
      },
      term: { premium: 190, deathBenefit: 100_000, durationYears: 10 },
      params: { annualReturn: 0.04 },
    }),
    fees: fees({
      initialAmount: 320_000,
      years: 1,
      grossReturn: 0.045,
      drawdown: { enabled: true, years: 30 },
      portfolios: {
        a: { label: 'Fonds actuel', mer: 0.019, advisorFee: 0 },
        b: { label: 'Portefeuille à bas frais', mer: 0.004, advisorFee: 0 },
      },
    }),
  },
  thomas: {
    name: 'Thomas, 23 ans',
    insurance: insurance({
      age: 23,
      permanent: { premium: 45, deathBenefit: 50_000, premiumYearsRemaining: 77 },
      term: { premium: 19, deathBenefit: 250_000, durationYears: 30 },
      params: { annualReturn: 0.065 },
    }),
    split: {
      people: {
        p1: { label: 'Thomas', frequency: 'week', salary: 690 },
        p2: { label: 'Léa', frequency: 'year', salary: 24_000 },
      },
      bill: 900,
    },
    hours: {
      frequency: 'week',
      salary: 690,
      hoursPerWeek: 40,
      workCosts: null,
      price: 1_449,
      recurrence: 'once',
      addTax: true,
    },
    spending: spending({ amount: 32, count: 2, cadence: 'perWeek', priceGrowth: true }),
    savings: savings({
      monthly: 50,
      depositYears: 10,
      growthYears: 32,
      delayYears: 5,
      realDollars: true,
    }),
  },
  'nadia-elise': {
    name: 'Nadia et Élise, 45 et 47 ans',
    insurance: insurance({
      age: 45,
      permanent: {
        premium: 900,
        deathBenefit: 500_000,
        premiumYearsRemaining: 15,
        projectedGrowth: 0.03,
      },
      term: { premium: 70, deathBenefit: 750_000, durationYears: 20 },
      params: { account: 'taxable', taxRate: 0.5, taxRateLater: 0.5, realDollars: true },
    }),
    mortgage: {
      loan: { amount: 650_000, years: 22, rate: 0.042 },
      couple: true,
      people: {
        p1: { label: 'Nadia', amount: 700_000, years: 20, premium: 85 },
        p2: { label: 'Élise', amount: 300_000, years: 15, premium: 48 },
      },
      bankPremium: 165,
    },
    split: {
      people: {
        p1: { label: 'Nadia', frequency: 'year', salary: 210_000 },
        p2: { label: 'Élise', frequency: 'year', salary: 35_000 },
      },
      bill: 4_800,
    },
    marginal: { income: 210_000, extra: null },
  },
  robert: {
    name: 'Robert, 71 ans',
    insurance: insurance({
      age: 71,
      horizon: 110,
      permanent: {
        premium: 310,
        deathBenefit: 200_000,
        inForce: true,
        cashValueNow: 92_000,
        premiumYearsRemaining: 29,
        anchors: [row(71, 92_000, 105_000), row(85, 140_000, 165_000), row(100, 200_000, 200_000)],
      },
      term: { premium: 420, deathBenefit: 100_000, durationYears: 10 },
    }),
    marginal: { income: 38_000, extra: 20_000 },
    savings: savings({ initial: 92_000, depositYears: 1, growthYears: 14, annualReturn: 0.032 }),
  },
  alex: {
    name: 'Alex, 36 ans',
    insurance: alex,
    hours: {
      frequency: 'year',
      salary: 58_000,
      hoursPerWeek: null,
      workCosts: null,
      price: 0,
      recurrence: 'once',
      addTax: false,
    },
    marginal: { income: 58_000, extra: null },
  },
};

/** Personas whose forms are left incomplete on purpose. */
export const INCOMPLETE: readonly string[] = ['alex'];
