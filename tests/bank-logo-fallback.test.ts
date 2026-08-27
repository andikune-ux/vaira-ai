import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.resolve(__dirname, "../app/wallets.tsx"), "utf8");

describe("Bank logo fallback", () => {
  it("menggunakan sumber ikon Google saat aset lokal gagal", () => {
    expect(source).toContain("https://www.google.com/s2/favicons?sz=128");
    expect(source).toContain("setLocalFailed(true)");
    expect(source).toContain("setGoogleFailed(true)");
  });

  it("tetap menampilkan inisial bank jika seluruh sumber logo gagal", () => {
    expect(source).toContain("{entry?.initials ?? \"?\"}");
    expect(source).toContain("showGoogle ?");
  });
});
