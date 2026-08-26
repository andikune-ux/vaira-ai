import { describe, expect, it } from "vitest";
import fs from "node:fs";

const screen = fs.readFileSync("app/household-finance-analysis.tsx", "utf8");
const types = fs.readFileSync("lib/finance/types.ts", "utf8");
const router = fs.readFileSync("server/routers.ts", "utf8");

describe("layar Perencana Rumah Tangga", () => {
  it("mewajibkan profil anggota dan menyediakan pertanyaan adaptif kerja atau studi", () => {
    expect(screen).toContain("Profil belum lengkap");
    expect(screen).toContain("tinggi, berat, pola makan, dan alergi/pantangan wajib");
    expect(screen).toContain('memberDraft.activity === "working"');
    expect(screen).toContain('memberDraft.activity === "student"');
    expect(screen).toContain("Tanggal servis terakhir");
    expect(types).toContain("SmartFinanceMemberRelation");
    expect(types).toContain("SmartFinanceSharedExpense");
  });

  it("menampilkan pemisahan biaya, ekspor PDF, dan penyimpanan privat per akun", () => {
    expect(screen).toContain("Pengeluaran pribadi tambahan");
    expect(screen).toContain("Kebutuhan bersama rumah tangga");
    expect(screen).toContain("Simpan hasil ke server");
    expect(screen).toContain("Ekspor hasil ke PDF");
    expect(screen).toContain("state.profile.mode === \"account\"");
    expect(screen).toContain("safeResult");
    expect(screen).toContain("Harga target hemat (opsional)");
    expect(screen).toContain("Rekomendasi harga pangan dari catatan Anda");
    expect(screen).toContain("TOTAL SEMUA HARGA / BIAYA");
    expect(screen).toContain("NILAI AKHIR RENCANA");
    expect(types).toContain('"spices"');
    expect(types).toContain("targetAmount?: number");
    expect(router).toContain("householdFinance: router");
    expect(router).toContain("saveAnalysis");
    expect(router).toContain("deleteMine");
  });
});
