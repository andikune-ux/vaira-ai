import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

describe("kalender mini V A I R A  A I", () => {
  it("menyediakan kalender lokal dengan navigasi bulan dan tahun", () => {
    const picker = read("components/mini-date-picker.tsx");
    expect(picker).toContain("month: \"long\", year: \"numeric\"");
    expect(picker).toContain("Bulan sebelumnya");
    expect(picker).toContain("Bulan berikutnya");
    expect(picker).toContain("Hari ini");
    expect(picker).toContain("dateKey");
  });

  it("menerapkan kalender untuk Anggaran, Target, pengingat, dan tanggal lahir", () => {
    const plans = read("app/plan-form.tsx");
    const register = read("app/register.tsx");
    const smartFinance = read("app/smart-finance.tsx");
    expect(plans).toContain('label="Tanggal target"');
    expect(plans).toContain('label="Tanggal pengingat"');
    expect(register).toContain('label="Tanggal lahir"');
    expect(register).toContain("maxDate={new Date().toISOString().slice(0, 10)}");
    expect(smartFinance).toContain("MiniDatePicker");
    expect(smartFinance).toContain('label="Tanggal beli"');
    expect(smartFinance).toContain('optional />');
    expect(smartFinance).toContain('if (!checklistCategory)');
  });
});
