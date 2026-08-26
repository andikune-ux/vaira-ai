import fs from "node:fs";

import { describe, expect, it } from "vitest";

const legacyRoute = fs.readFileSync("app/smart-finance.tsx", "utf8");
const householdScreen = fs.readFileSync("app/household-finance-analysis.tsx", "utf8");
const types = fs.readFileSync("lib/finance/types.ts", "utf8");
const smartHealth = fs.readFileSync("lib/finance/smart-health.ts", "utf8");

describe("Perencana Rumah Tangga menggantikan wizard Keuangan Pintar lama", () => {
  it("mengarahkan rute lama ke formulir rencana terpadu tanpa menghapus rencana pengguna", () => {
    expect(legacyRoute).toContain("Redirect");
    expect(legacyRoute).toContain('href="/plan-form"');
  });

  it("mempertahankan profil keluarga, pertanyaan adaptif, dan batas saran kesehatan pada layar baru", () => {
    expect(householdScreen).toContain("Profil belum lengkap");
    expect(householdScreen).toContain("Pengeluaran pribadi tambahan");
    expect(householdScreen).toContain("Kebutuhan bersama rumah tangga");
    expect(types).toContain("SmartFinanceMemberRelation");
    expect(smartHealth).toContain("bukan diagnosis");
  });
});
