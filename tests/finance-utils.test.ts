import { describe, expect, it } from "vitest";

import { getBudgetUsage, getMonthlyExpense, getSpendByCategory, getTotalBalance, getWalletBalance } from "../lib/finance/finance-utils";
import type { FinanceState, Transaction, Wallet } from "../lib/finance/types";

const wallet: Wallet = { id: "wallet-1", name: "Kas", kind: "cash", openingBalance: 100_000, color: "#18B68A", createdAt: "2026-08-01T00:00:00.000Z" };
const now = new Date();
const transaction = (overrides: Partial<Transaction>): Transaction => ({ id: crypto.randomUUID(), kind: "expense", amount: 10_000, walletId: wallet.id, category: "Makan", note: "Makan siang", occurredAt: now.toISOString(), origin: "manual", status: "confirmed", createdAt: now.toISOString(), ...overrides });
const stateWith = (transactions: Transaction[]): FinanceState => ({ version: 1, profile: { mode: "guest", preferredLanguage: "id", systemLanguage: "id", voice: "female", personalInstruction: "Bantu saya", instructionItems: [], aiMode: "aira", aiPersona: "", syncEnabled: false, generationNotificationsEnabled: true, dailyReminderEnabled: false, dailyReminderHour: 20, dailyReminderMinute: 0, prayerReminderEnabled: false, prayerAlarmTone: "device_default", prayerAlarmVibrationEnabled: true, uiPreferences: { homeHeadline: "Halo", showRealtimeClock: true, compactHome: false, colorVisionMode: "standard", spcaEnabled: false, spcaPosition: { left: 12, top: 140 }, spcaIconSize: 54, spcaScalePercent: 25, spcaTransparencyPercent: 100, spcaAutoPatrol: true, spcaPatrolIntervalSeconds: 10, spcaPatrolDurationSeconds: 5, spcaReminderBubbleEnabled: true, spcaBubbleDurationSeconds: 3, spcaBubbleRepeatMinutes: 5, quickActionOrder: ["chat", "add", "scan", "prayer", "calculator", "report"], quickPlanOrder: ["budget", "goal", "bill", "debt", "receivable"] }, developerMode: false }, wallets: [wallet], transactions, budgets: [], goals: [], commitments: [], knowledgeItems: [], conversations: [], generatedResults: [], lastUpdatedAt: now.toISOString() });

describe("perhitungan keuangan V A I R A  A I", () => {
  it("hanya memasukkan transaksi terkonfirmasi ke saldo", () => {
    const state = stateWith([transaction({ kind: "income", amount: 75_000 }), transaction({ amount: 20_000, status: "draft" }), transaction({ amount: 15_000 })]);
    expect(getWalletBalance(wallet, state.transactions)).toBe(160_000);
    expect(getTotalBalance(state)).toBe(160_000);
  });

  it("mengelompokkan pengeluaran bulan berjalan berdasarkan kategori", () => {
    const state = stateWith([transaction({ amount: 20_000, category: "Makan" }), transaction({ amount: 15_000, category: "Makan" }), transaction({ amount: 8_000, category: "Transportasi" }), transaction({ kind: "income", amount: 1_000_000 })]);
    expect(getMonthlyExpense(state)).toBe(43_000);
    expect(getSpendByCategory(state)).toEqual([{ category: "Makan", amount: 35_000 }, { category: "Transportasi", amount: 8_000 }]);
  });

  it("menghitung pemakaian anggaran dari transaksi yang sudah dikonfirmasi", () => {
    const state = stateWith([transaction({ amount: 40_000, category: "Makan" }), transaction({ amount: 50_000, category: "Makan", status: "draft" })]);
    const usage = getBudgetUsage({ id: "budget-1", category: "Makan", limit: 100_000, period: "monthly", alertAt: 0.8, createdAt: now.toISOString() }, state);
    expect(usage.spending).toBe(40_000);
    expect(usage.remaining).toBe(60_000);
    expect(usage.ratio).toBe(0.4);
  });
});
