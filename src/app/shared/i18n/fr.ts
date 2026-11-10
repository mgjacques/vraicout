import { assurance } from './fr/assurance';
import { common } from './fr/common';
import { fees } from './fr/fees';
import { home } from './fr/home';
import { hours } from './fr/hours';
import { marginal } from './fr/marginal';
import { mortgage } from './fr/mortgage';
import { privacy } from './fr/privacy';
import { resources } from './fr/resources';
import { savings } from './fr/savings';
import { spending } from './fr/spending';
import { split } from './fr/split';
import { transfer } from './fr/transfer';

/** One catalog per tool, merged: a key used anywhere must exist here, or the code does not compile. */
export const fr = {
  ...common,
  ...home,
  ...assurance,
  ...fees,
  ...mortgage,
  ...split,
  ...hours,
  ...spending,
  ...savings,
  ...marginal,
  ...privacy,
  ...resources,
  ...transfer,
};

export type MessageKey = keyof typeof fr;
