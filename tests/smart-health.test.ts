import { describe, expect, it } from "vitest";
import { getHealthyFoodAdvice, getSmartHealthNutritionAdvice, healthFoodGroupLabel, monthlyFoodCost, SMART_HEALTH_STORAGE_KEY } from "../lib/finance/smart-health";

describe("Keuangan Sehat lokal", () => {
  it("menghitung harga pangan bulanan berdasarkan frekuensi", () => {
    expect(monthlyFoodCost({ quantity: 2, price: 10_000, frequency: "weekly" })).toBeCloseTo(86_666.67, 1);
  });

  it("memberi label kelompok sayur dan saran yang transparan", () => {
    expect(healthFoodGroupLabel("sayur")).toBe("Sayur");
    expect(getHealthyFoodAdvice({ people: [{ id: "p1", name: "Si Polan", ageYears: 26 }], foods: [{ id: "f1", group: "sayur", name: "Bayam", quantity: 2, unit: "ikat", price: 5_000, frequency: "weekly" }], updatedAt: "2026-08-19T00:00:00.000Z" })).toContain("anggaran pangan");
  });

  it("menyesuaikan analisis dengan pola makan dan alergi anggota", () => {
    const advice = getSmartHealthNutritionAdvice({ people: [{ id: "p1", name: "Si Polan", ageYears: 26, heightCm: 170, weightKg: 65, dietPattern: "vegetarian", allergies: "kacang" }], foods: [], updatedAt: "2026-08-19T00:00:00.000Z" });
    expect(advice).toContain("Si Polan");
    expect(advice).toContain("protein nabati");
    expect(advice).toContain("kacang");
    expect(advice).toContain("bukan diagnosis");
    expect(advice).not.toContain("kkal");
  });

  it("memiliki namespace penyimpanan lokal terpisah dari FinanceContext", () => {
    expect(SMART_HEALTH_STORAGE_KEY).toContain("local");
    expect(SMART_HEALTH_STORAGE_KEY).not.toContain("transaction");
  });

});
