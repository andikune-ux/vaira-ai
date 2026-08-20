import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const home = readFileSync(resolve(process.cwd(), "app/(tabs)/index.tsx"), "utf8");
const plansTab = readFileSync(resolve(process.cwd(), "app/(tabs)/plans.tsx"), "utf8");
const smartFinance = readFileSync(resolve(process.cwd(), "app/smart-finance.tsx"), "utf8");

describe("navigasi Keuangan Pintar", () => {
  it("membuka form yang benar dari Rencana Cepat Beranda", () => {
    expect(home).toContain('pathname: "/plan-form"');
    expect(home).toContain('pathname: "/smart-finance"');
    expect(home).toContain('params: { sheet: "smart" }');
  });

  it("menampilkan tombol Keuangan Pintar pada tab Rencana", () => {
    expect(plansTab).toContain('label="Keuangan Pintar"');
    expect(plansTab).toContain('icon="auto-graph"');
    expect(plansTab).toContain('/smart-finance?sheet=smart');
  });

  it("memiliki panel smart dan mode smart pada layar Smart Finance", () => {
    expect(smartFinance).toContain("Keuangan Pintar");
    expect(smartFinance).toContain('openForm("smart")');
    expect(smartFinance).toContain('mode === "smart"');
  });
});
