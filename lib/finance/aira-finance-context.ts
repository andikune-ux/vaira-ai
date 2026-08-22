import { formatCompactCurrency, formatCurrency, formatShortDate, getBudgetUsage, getConfirmedTransactions, getMonthlyExpense, getMonthlyIncome, getTotalBalance, getWalletBalance } from "./finance-utils";
import type { FinanceState, TransactionKind } from "./types";

const transactionKindLabel: Record<TransactionKind, string> = {
  income: "masuk",
  expense: "keluar",
  transfer: "pindah saldo",
};

const compactText = (value: string, max = 96) => value.replace(/\s+/g, " ").trim().slice(0, max);

/**
 * Konteks yang dikirim hanya dari Aira Default. Tidak menyertakan nomor rekening,
 * URI bukti, maupun seluruh arsip transaksi; tujuannya membantu percakapan keuangan
 * tanpa mengubah data secara otomatis.
 */
export function buildDefaultAiraFinanceContext(state: FinanceState, now = new Date()) {
  const confirmed = getConfirmedTransactions(state);
  const monthlyIncome = getMonthlyIncome(state, now);
  const monthlyExpense = getMonthlyExpense(state, now);
  const recent = [...confirmed]
    .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
    .slice(0, 6);
  const walletLines = state.wallets.slice(0, 5).map((wallet) =>
    `- ${compactText(wallet.name, 40)}: ${formatCurrency(getWalletBalance(wallet, confirmed))}`,
  );
  const recentLines = recent.map((transaction) => {
    const counterpart = transaction.counterpartyName ? ` · ${compactText(transaction.counterpartyName, 52)}` : "";
    const note = transaction.note ? ` · ${compactText(transaction.note, 72)}` : "";
    return `- ${formatShortDate(transaction.occurredAt)} · ${transactionKindLabel[transaction.kind]} ${formatCurrency(transaction.amount)} · ${compactText(transaction.category, 42)}${counterpart}${note}`;
  });
  const budgetLines = state.budgets.slice(0, 4).map((budget) => {
    const usage = getBudgetUsage(budget, state);
    return `- ${compactText(budget.category, 42)}: ${formatCompactCurrency(usage.spending)} dari ${formatCompactCurrency(budget.limit)}`;
  });
  const commitmentLines = state.commitments
    .filter((commitment) => !commitment.isDone)
    .slice(0, 4)
    .map((commitment) => `- ${compactText(commitment.title, 54)}${commitment.amount ? `: ${formatCompactCurrency(commitment.amount)}` : ""}`);

  return [
    "KONTEKS KEUANGAN PRIBADI TERBATAS (hanya untuk Aira Default; baca-saja, jangan pernah disimpan atau diubah otomatis).",
    `Tanggal ringkasan: ${formatShortDate(now.toISOString())}. Saldo total catatan: ${formatCurrency(getTotalBalance(state))}.`,
    `Bulan berjalan: pemasukan ${formatCurrency(monthlyIncome)}; pengeluaran ${formatCurrency(monthlyExpense)}.`,
    `Dompet (${state.wallets.length}):`,
    ...(walletLines.length ? walletLines : ["- Belum ada dompet tercatat."]),
    "Transaksi terbaru terbatas:",
    ...(recentLines.length ? recentLines : ["- Belum ada transaksi terkonfirmasi."]),
    "Anggaran aktif:",
    ...(budgetLines.length ? budgetLines : ["- Belum ada anggaran."]),
    "Komitmen yang belum selesai:",
    ...(commitmentLines.length ? commitmentLines : ["- Tidak ada komitmen aktif."]),
  ].join("\n").slice(0, 3500);
}
