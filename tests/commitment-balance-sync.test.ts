import fs from "node:fs";

import { describe, expect, it } from "vitest";

import { applyConfirmedCommitmentTransaction, COMMITMENT_FLOW_OPTIONS } from "@/lib/finance/commitment-sync";
import { getWalletBalance } from "@/lib/finance/finance-utils";
import { EMPTY_FINANCE_STATE, type Commitment, type FinanceState, type TransactionInput, type Wallet } from "@/lib/finance/types";

const wallet: Wallet = { id: "wallet-cash", name: "Kas", kind: "cash", openingBalance: 100_000, color: "#1677FF", createdAt: "2026-08-26T00:00:00.000Z" };
const baseState = (): FinanceState => ({ ...EMPTY_FINANCE_STATE, wallets: [wallet], transactions: [], commitments: [], lastUpdatedAt: "2026-08-26T00:00:00.000Z" });
const input = (overrides: Partial<TransactionInput>): TransactionInput => ({ kind: "expense", amount: 10_000, walletId: wallet.id, category: "Lainnya", note: "Catatan", occurredAt: "2026-08-26T00:00:00.000Z", origin: "manual", ...overrides });
const apply = (state: FinanceState, transaction: TransactionInput) => applyConfirmedCommitmentTransaction(state, transaction, { transactionId: `tx-${state.transactions.length}`, commitmentId: `commitment-${state.commitments.length}`, createdAt: "2026-08-26T00:00:00.000Z" });

describe("sinkronisasi saldo Hutang dan Piutang", () => {
  it("mencatat hutang diterima sebagai pemasukan dan membuat daftar hutang baru", () => {
    const next = apply(baseState(), input({ kind: "income", amount: 75_000, counterpartyName: "Rina", commitmentFlow: "debt_received" }));
    expect(getWalletBalance(wallet, next.transactions)).toBe(175_000);
    expect(next.commitments).toHaveLength(1);
    expect(next.commitments[0]).toMatchObject({ kind: "debt", amount: 75_000, remainingAmount: 75_000, counterparty: "Rina", isDone: false });
  });

  it("mencatat piutang diberikan sebagai pengeluaran dan membuat daftar piutang baru", () => {
    const next = apply(baseState(), input({ kind: "expense", amount: 40_000, counterpartyName: "Budi", commitmentFlow: "receivable_issued" }));
    expect(getWalletBalance(wallet, next.transactions)).toBe(60_000);
    expect(next.commitments[0]).toMatchObject({ kind: "receivable", remainingAmount: 40_000, counterparty: "Budi" });
  });

  it("mengurangi sisa hutang atau piutang hanya pada daftar yang dipilih setelah pembayaran dikonfirmasi", () => {
    const debt: Commitment = { id: "debt-1", kind: "debt", title: "Hutang Rina", amount: 100_000, remainingAmount: 100_000, isRecurring: false, isDone: false, createdAt: "2026-08-26T00:00:00.000Z" };
    const state = { ...baseState(), commitments: [debt] };
    const partial = apply(state, input({ kind: "expense", amount: 35_000, commitmentFlow: "debt_payment", commitmentId: debt.id }));
    expect(getWalletBalance(wallet, partial.transactions)).toBe(65_000);
    expect(partial.commitments[0]).toMatchObject({ remainingAmount: 65_000, isDone: false });
    const settled = apply(partial, input({ kind: "expense", amount: 65_000, commitmentFlow: "debt_payment", commitmentId: debt.id }));
    expect(settled.commitments[0]).toMatchObject({ remainingAmount: 0, isDone: true });
  });

  it("tidak mengubah daftar bila jenis transaksi tidak cocok dengan hubungan komitmen", () => {
    const receivable: Commitment = { id: "receivable-1", kind: "receivable", title: "Piutang Budi", amount: 50_000, remainingAmount: 50_000, isRecurring: false, isDone: false, createdAt: "2026-08-26T00:00:00.000Z" };
    const next = apply({ ...baseState(), commitments: [receivable] }, input({ kind: "expense", amount: 50_000, commitmentFlow: "receivable_payment", commitmentId: receivable.id }));
    expect(next.commitments[0]).toMatchObject({ remainingAmount: 50_000, isDone: false });
  });
});

describe("Pindai Bukti Hutang dan Piutang", () => {
  const scan = fs.readFileSync("app/scan-receipt.tsx", "utf8");
  const confirm = fs.readFileSync("app/confirm-transaction.tsx", "utf8");

  it("menyediakan empat pilihan eksplisit dan meneruskannya ke konfirmasi", () => {
    expect(COMMITMENT_FLOW_OPTIONS.map((item) => item.label)).toEqual(["Hutang diterima", "Bayar hutang", "Piutang diberikan", "Terima piutang"]);
    expect(scan).toContain("COMMITMENT_FLOW_OPTIONS.map");
    expect(scan).toContain("commitmentFlow: commitmentFlow ??");
    expect(scan).toContain("commitmentId");
  });

  it("tetap menunggu konfirmasi pengguna sebelum saldo dan daftar diperbarui", () => {
    expect(confirm).toContain("addConfirmedTransaction(payload)");
    expect(confirm).toContain("Saldo telah diperbarui dan daftar hutang/piutang baru sudah ditambahkan.");
    expect(confirm).toContain("sisa hutang/piutang terkait sudah disesuaikan");
  });
});
