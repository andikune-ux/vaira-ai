import { describe, expect, it } from "vitest";
import { getMonthlyTransportEstimate, getRecommendedRiceSacks5kg, getSmartFinanceOfflineAdvice, getSmartFinanceSummary, monthlyEquivalent } from "../lib/finance/smart-finance";

describe("Keuangan Pintar", () => {
  it("menormalkan kebutuhan mingguan dan harian ke estimasi bulanan", () => {
    expect(monthlyEquivalent({ amount: 100_000, cadence: "weekly" })).toBeCloseTo(433_333.33, 1);
    expect(monthlyEquivalent({ amount: 10_000, cadence: "daily" })).toBe(300_000);
  });

  it("menghitung sisa pemasukan dan status rencana", () => {
    const summary = getSmartFinanceSummary({ monthKey: "2026-08", income: 10_000_000, updatedAt: "2026-08-01T00:00:00.000Z", items: [{ id: "1", title: "Listrik", amount: 1_000_000, cadence: "monthly", isPaid: false, reminderEnabled: true }] });
    expect(summary.remaining).toBe(9_000_000);
    expect(summary.status).toBe("healthy");
  });

  it("merekomendasikan dua karung untuk dua dewasa dan bayi enam bulan", () => {
    expect(getRecommendedRiceSacks5kg([{ id: "1", relation: "self", label: "Suami", ageYears: 26 }, { id: "2", relation: "spouse", label: "Istri", ageYears: 27 }, { id: "3", relation: "child", label: "Bayi", ageYears: 0, ageMonths: 6 }])).toBe(2);
  });

  it("mengestimasi ongkos transportasi berdasarkan frekuensi", () => {
    expect(getMonthlyTransportEstimate({ mode: "angkot", tripsPerDay: 2, daysPerWeek: 5, costPerTrip: 5_000 })).toBeCloseTo(216_666.67, 1);
  });

  it("memberi peringatan offline ketika rencana melebihi pemasukan", () => {
    const plan = { monthKey: "2026-08", income: 1_000_000, updatedAt: "2026-08-01T00:00:00.000Z", items: [{ id: "1", title: "Kontrakan", amount: 2_000_000, cadence: "monthly" as const, isPaid: false, reminderEnabled: true }] };
    expect(getSmartFinanceSummary(plan).status).toBe("over");
    expect(getSmartFinanceOfflineAdvice(plan)).toContain("melebihi pemasukan");
  });
});
