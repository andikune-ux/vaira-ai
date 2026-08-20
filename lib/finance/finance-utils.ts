import type { Budget, FinanceState, Transaction, Wallet } from "./types";

export const formatCurrency = (amount: number, locale = "id-ID") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

export const formatCompactCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.round(amount));

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export const formatShortDate = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));

export const startOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1).getTime();

export const getConfirmedTransactions = (state: FinanceState) =>
  state.transactions.filter((transaction) => transaction.status === "confirmed");

export const getWalletBalance = (wallet: Wallet, transactions: Transaction[]) =>
  transactions.reduce((balance, transaction) => {
    if (transaction.status !== "confirmed") return balance;
    if (transaction.kind === "transfer") {
      if (transaction.walletId === wallet.id) return balance - transaction.amount - (transaction.feeAmount ?? 0);
      if (transaction.toWalletId === wallet.id) return balance + transaction.amount;
      return balance;
    }
    if (transaction.walletId !== wallet.id) return balance;
    if (transaction.kind === "income") return balance + transaction.amount;
    if (transaction.kind === "expense") return balance - transaction.amount;
    return balance;
  }, wallet.openingBalance);

export const getTotalBalance = (state: FinanceState) => {
  const confirmed = getConfirmedTransactions(state);
  return state.wallets.reduce((total, wallet) => total + getWalletBalance(wallet, confirmed), 0);
};

export const getMonthlyIncome = (state: FinanceState, date = new Date()) =>
  getConfirmedTransactions(state)
    .filter((transaction) => transaction.occurredAt && new Date(transaction.occurredAt).getTime() >= startOfMonth(date))
    .filter((transaction) => transaction.kind === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

export const getMonthlyExpense = (state: FinanceState, date = new Date()) =>
  getConfirmedTransactions(state)
    .filter((transaction) => transaction.occurredAt && new Date(transaction.occurredAt).getTime() >= startOfMonth(date))
    .reduce((total, transaction) => total + (transaction.kind === "expense" ? transaction.amount : transaction.kind === "transfer" ? (transaction.feeAmount ?? 0) : 0), 0);

export const getSpendByCategory = (state: FinanceState, date = new Date()) => {
  const totals = new Map<string, number>();
  getConfirmedTransactions(state)
    .filter((transaction) => transaction.kind === "expense")
    .filter((transaction) => new Date(transaction.occurredAt).getTime() >= startOfMonth(date))
    .forEach((transaction) => {
      totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
    });
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((left, right) => right.amount - left.amount);
};

export const getBudgetUsage = (budget: Budget, state: FinanceState) => {
  const spending = getSpendByCategory(state).find((item) => item.category === budget.category)?.amount ?? 0;
  return {
    spending,
    ratio: budget.limit > 0 ? spending / budget.limit : 0,
    remaining: Math.max(budget.limit - spending, 0),
  };
};

export const getWalletRunningBalance = (wallet: Wallet, transactions: Transaction[], untilIndex: number) => {
  const sorted = [...transactions]
    .filter((transaction) => transaction.status === "confirmed" && (transaction.walletId === wallet.id || transaction.toWalletId === wallet.id))
    .sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime());

  return sorted.slice(0, untilIndex + 1).reduce((total, transaction) => {
    if (transaction.kind === "income" && transaction.walletId === wallet.id) return total + transaction.amount;
    if (transaction.kind === "expense" && transaction.walletId === wallet.id) return total - transaction.amount;
    if (transaction.kind === "transfer") {
      if (transaction.walletId === wallet.id) return total - transaction.amount - (transaction.feeAmount ?? 0);
      if (transaction.toWalletId === wallet.id) return total + transaction.amount;
    }
    return total;
  }, wallet.openingBalance);
};

export const getWalletBreakdown = (state: FinanceState) => state.wallets.map((wallet) => ({
  wallet,
  balance: getWalletBalance(wallet, state.transactions),
  income: getConfirmedTransactions(state).filter((transaction) => transaction.walletId === wallet.id && transaction.kind === "income").reduce((total, transaction) => total + transaction.amount, 0),
  expense: getConfirmedTransactions(state).filter((transaction) => transaction.walletId === wallet.id && transaction.kind === "expense").reduce((total, transaction) => total + transaction.amount, 0),
}));
