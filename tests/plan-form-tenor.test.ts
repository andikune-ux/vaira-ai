import fs from "node:fs";

import { describe, expect, it } from "vitest";

const form = fs.readFileSync("app/plan-form.tsx", "utf8");
const legacy = fs.readFileSync("app/smart-finance.tsx", "utf8");
const plansTab = fs.readFileSync("app/(tabs)/plans.tsx", "utf8");
const types = fs.readFileSync("lib/finance/types.ts", "utf8");

describe("formulir Rencana dan sisa tenor", () => {
  it("memakai satu formulir komitmen untuk tagihan, hutang, dan piutang", () => {
    expect(form).toContain("Gunakan formulir komitmen yang sama untuk Tagihan, Hutang, dan Piutang.");
    expect(form).toContain("COMMITMENT_MODES");
    expect(form).toContain("Tagihan, hutang & piutang");
    expect(plansTab).not.toContain('sheet=commitment');
  });

  it("menyimpan serta menampilkan sisa tenor dalam bulan tanpa menimpa data tenor lama", () => {
    expect(types).toContain("remainingInstallmentMonths?: number");
    expect(form).toContain("Sisa tenor tagihan (bulan, opsional)");
    expect(form).toContain("remainingInstallmentMonths");
    expect(form).toContain("Sisa tenor ${remaining} bulan");
    expect(form).toContain("existing?.installmentMonths ?? remainingInstallmentMonths");
  });

  it("mengarahkan rute Rencana lama ke formulir yang sama", () => {
    expect(legacy).toContain('href="/plan-form"');
    expect(legacy).not.toContain("Keuangan Pintar bulan ini");
  });
});
