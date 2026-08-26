import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const home = readFileSync(resolve(process.cwd(), "app/(tabs)/index.tsx"), "utf8");
const plansTab = readFileSync(resolve(process.cwd(), "app/(tabs)/plans.tsx"), "utf8");
const smartFinance = readFileSync(resolve(process.cwd(), "app/smart-finance.tsx"), "utf8");

describe("navigasi Keuangan Pintar", () => {
  it("membuka formulir rencana yang benar dari Rencana Cepat Beranda", () => {
    expect(home).toContain('pathname: "/plan-form"');
  });

  it("menampilkan akses Keuangan Pintar baru pada tab Rencana", () => {
    expect(plansTab).toContain('label="Keuangan Pintar"');
    expect(plansTab).toContain('icon="auto-graph"');
    expect(plansTab).toContain('"/household-finance-analysis"');
  });

  it("mengarahkan tautan Rencana lama menuju formulir rencana terpadu", () => {
    expect(smartFinance).toContain("Redirect");
    expect(smartFinance).toContain('href="/plan-form"');
  });
});
