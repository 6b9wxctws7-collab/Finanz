import { Budget, BudgetGroup } from "./types";

/** Summe aller Positionen einer Budgetgruppe. */
export function sumGroup(group: BudgetGroup): number {
  return group.items.reduce((acc, item) => acc + (Number.isFinite(item.amount) ? item.amount : 0), 0);
}

/** Gesamte monatliche Ausgaben aus allen Budgetgruppen. */
export function totalBudgetExpenses(budget: Budget): number {
  return sumGroup(budget.fixed) + sumGroup(budget.variable) + sumGroup(budget.reserves);
}

/**
 * Budgetbasierte Sparrate: Nettoeinkommen abzüglich aller Ausgaben.
 * Kann negativ sein (Warnsignal) – dies wird bewusst nicht abgeschnitten.
 */
export function budgetSavings(netIncome: number, budget: Budget): number {
  return netIncome - totalBudgetExpenses(budget);
}
