import { describe, expect, it } from "vitest";
import fs from "node:fs";

const screen = fs.readFileSync("app/smart-finance.tsx", "utf8");
const types = fs.readFileSync("lib/finance/types.ts", "utf8");
const smartHealth = fs.readFileSync("lib/finance/smart-health.ts", "utf8");

describe("Smart Finance household and checklist wizard", () => {
  it("places income before household profile and supports optional other income", () => {
    expect(screen.indexOf("Pemasukan" )).toBeLessThan(screen.indexOf("Profil rumah tangga"));
    expect(screen).toContain("Tambah pemasukan lain");
    expect(types).toContain("otherIncome?: SmartFinanceIncome[]");
  });

  it("uses one household member form for age, height, and weight", () => {
    expect(screen).toContain("memberHeight");
    expect(screen).toContain("memberWeight");
    expect(screen).toContain("Data nama, umur, tinggi, berat");
    expect(screen).toContain("Tidak menjadi transaksi, laporan, atau data sinkronisasi");
    expect(screen).not.toContain("Simpan profil lokal");
  });

  it("models transport and food as stepped checklist branches", () => {
    expect(screen).toContain("TRANSPORT_CHECKLIST_OPTIONS");
    expect(screen).toContain("Keuangan Sehat");
    expect(screen).toContain('checklistCategory === "Pangan"');
    expect(screen).toContain("isHealthChecklist");
    expect(screen).toContain("SMART_HEALTH_STORAGE_KEY");
    expect(screen).not.toContain("Simpan batas transportasi");
    expect(screen).not.toContain("Keuangan Sehat (opsional, lokal)");
    expect(screen).not.toContain('"Transportasi", "Pangan", "Keuangan Sehat"');
    expect(screen).toContain("Ekspor PDF");
    expect(screen).toContain("Ekspor Excel");
    expect(screen).toContain("exportAllFinancePdf");
    expect(screen).toContain("exportAllFinanceExcel");
    expect(screen).not.toContain("Ekspor Keuangan Sehat PDF");
    expect(screen).toContain("Analisis Aira");
    expect(screen).toContain("Analisis berjalan otomatis");
    expect(screen).toContain("getSmartHealthNutritionAdvice");
    expect(smartHealth).toContain("protein");
    expect(smartHealth).toContain("karbohidrat");
    expect(screen).toContain("MOTOR_DETAIL_OPTIONS");
    expect(screen).toContain("FOOD_CHECKLIST_OPTIONS");
    expect(screen).toContain("Jenis, merek, dan jumlah");
    expect(screen).toContain("normalizeChecklistCategory(checklistCategory)");
    expect(types).toContain("category?: string");
    expect(types).toContain("subcategory?: string");
  });
});
