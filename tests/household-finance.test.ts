import { describe, expect, it } from "vitest";

import { buildHouseholdAnalysis, toMonthlyAmount } from "../lib/finance/household-finance";
import type { SmartFinancePlan } from "../lib/finance/types";

describe("Perencana Rumah Tangga", () => {
  it("menormalkan nominal harian dan mingguan ke bulan dengan rumus transparan", () => {
    expect(toMonthlyAmount(10_000, "daily")).toBe(300_000);
    expect(toMonthlyAmount(120_000, "weekly")).toBeCloseTo(520_000, 5);
    expect(toMonthlyAmount(500_000, "monthly")).toBe(500_000);
  });

  it("memisahkan pendapatan, biaya pribadi adaptif, dan biaya bersama", () => {
    const plan: SmartFinancePlan = {
      monthKey: "2026-08",
      income: 0,
      items: [],
      updatedAt: "2026-08-01T00:00:00.000Z",
      analysisVersion: 2,
      incomeSources: [
        { id: "income-main", label: "Gaji suami", amount: 1_000_000, cadence: "monthly", kind: "main", memberId: "m1" },
        { id: "income-extra", label: "Usaha kecil", amount: 120_000, cadence: "weekly", kind: "additional" },
      ],
      members: [{
        id: "m1",
        label: "Andi",
        name: "Andi",
        relation: "husband",
        ageYears: 31,
        heightCm: 171,
        weightKg: 68,
        dietPattern: "halal",
        allergies: "kacang",
        activity: "working",
        planner: {
          work: {
            workplace: "Kantor",
            commute: { mode: "motorcycle", costPerTrip: 5_000, comparisonMode: "public_transport", comparisonCostPerTrip: 3_000, tripsPerDay: 2, daysPerWeek: 5, nextServiceDate: "15-09-2026" },
            mealBudget: { amount: 120_000, cadence: "monthly" },
          },
        },
      }],
      personalExpenses: [{ id: "personal-1", memberId: "m1", title: "Kas kerja", category: "work", amount: 10_000, cadence: "weekly" }],
      sharedExpenses: [{ id: "shared-1", title: "Listrik", category: "electricity", amount: 120_000, cadence: "weekly" }],
    };

    const analysis = buildHouseholdAnalysis(plan, new Date("2026-08-21T00:00:00.000Z"));

    expect(analysis.totalIncome).toBeCloseTo(1_520_000, 5);
    expect(analysis.totalPersonalExpense).toBeCloseTo(380_000, 5);
    expect(analysis.totalSharedExpense).toBeCloseTo(520_000, 5);
    expect(analysis.totalExpense).toBeCloseTo(900_000, 5);
    expect(analysis.remaining).toBeCloseTo(620_000, 5);
    expect(analysis.personalByMember[0]?.memberLabel).toBe("Andi");
    expect(analysis.personalByMember[0]?.rows.some((row) => row.label.includes("transportasi"))).toBe(true);
    expect(analysis.alerts.join(" ")).toContain("15-09-2026");
    expect(analysis.suggestions.join(" ")).toContain("bukan tarif transportasi real-time");
  });

  it("tidak memasukkan tinggi, berat, atau alergi mentah ke hasil yang siap disimpan", () => {
    const analysis = buildHouseholdAnalysis({
      monthKey: "2026-08",
      income: 100_000,
      items: [],
      updatedAt: "2026-08-01T00:00:00.000Z",
      members: [{ id: "m1", label: "Rani", name: "Rani", relation: "wife", ageYears: 29, heightCm: 160, weightKg: 55, dietPattern: "vegetarian", allergies: "kacang" }],
    });
    const serialized = JSON.stringify(analysis);
    expect(serialized).not.toContain("heightCm");
    expect(serialized).not.toContain("weightKg");
    expect(serialized).not.toContain("kacang");
    expect(analysis.wellbeingNote).toContain("bukan diagnosis");
  });

  it("menghasilkan rekomendasi harga pangan dari nominal pengguna tanpa membuat harga pasar", () => {
    const analysis = buildHouseholdAnalysis({
      monthKey: "2026-08",
      income: 2_000_000,
      items: [],
      updatedAt: "2026-08-01T00:00:00.000Z",
      sharedExpenses: [
        { id: "veg", title: "Sayur harian", category: "vegetables", amount: 30_000, targetAmount: 25_000, cadence: "daily", quantity: 1, unit: "paket" },
        { id: "protein", title: "Lauk mingguan", category: "protein", amount: 70_000, cadence: "weekly" },
        { id: "spices", title: "Bumbu dapur", category: "spices", amount: 100_000, targetAmount: 80_000, cadence: "monthly" },
      ],
    });

    const vegetable = analysis.foodPriceRecommendations.find((item) => item.id === "veg");
    const protein = analysis.foodPriceRecommendations.find((item) => item.id === "protein");
    const spices = analysis.foodPriceRecommendations.find((item) => item.id === "spices");
    expect(vegetable?.dailyAmount).toBe(30_000);
    expect(vegetable?.weeklyAmount).toBeCloseTo(900_000 / (52 / 12), 5);
    expect(vegetable?.monthlyAmount).toBe(900_000);
    expect(vegetable?.targetMonthlyAmount).toBe(750_000);
    expect(vegetable?.monthlySavings).toBe(150_000);
    expect(protein?.monthlyAmount).toBeCloseTo(70_000 * 52 / 12, 5);
    expect(spices?.targetDailyAmount).toBeCloseTo(80_000 / 30, 5);
    expect(analysis.totalSharedExpense).toBeCloseTo(900_000 + 70_000 * 52 / 12 + 100_000, 5);
    expect(analysis.pantryNotes.join(" ")).toContain("tidak mengambil atau mengarang harga pasar");
  });
});
