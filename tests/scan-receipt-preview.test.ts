import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const screen = fs.readFileSync(path.resolve(process.cwd(), "app/scan-receipt.tsx"), "utf8");

describe("pratinjau bukti transaksi sebelum pemindaian", () => {
  it("menahan foto baru di pratinjau sampai pengguna memilih Oke, gunakan", () => {
    expect(screen).toContain("const [pendingProof, setPendingProof]");
    expect(screen).toContain("setPendingProof({ uri: asset.uri");
    expect(screen).toContain('label={isApplyingPreview ? "Menyiapkan…" : "Oke, gunakan"}');
    expect(screen).toContain("setProof(nextProof)");
    expect(screen).toContain("resetDraft()");
  });

  it("menyediakan crop nyata dan tidak memindai foto sebelum disetujui", () => {
    expect(screen).toContain('label={cropEnabled ? "Reset crop" : "Crop"}');
    expect(screen).toContain("manipulateAsync(");
    expect(screen).toContain("SaveFormat.JPEG");
    expect(screen).toContain("originX: Math.floor(pendingProof.width * cropInset)");
    expect(screen).toContain('label="Kembali"');
    expect(screen).toContain("if (!uri) return;");
  });

  it("menampilkan gambar yang sudah digunakan dan meneruskannya saat transaksi ditinjau", () => {
    expect(screen).toContain('accessibilityLabel="Tinjau ulang gambar bukti transaksi"');
    expect(screen).toContain('proofUri: uri');
    expect(screen).toContain(">Tinjau gambar</Text>");
  });
});
