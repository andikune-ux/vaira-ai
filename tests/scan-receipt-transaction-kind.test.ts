import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(`${process.cwd()}/${path}`, "utf-8");

describe("pilihan jenis transaksi Pindai Bukti", () => {
  it("memberikan koreksi manual untuk uang masuk, uang keluar, dan pindah saldo", () => {
    const screen = read("app/scan-receipt.tsx");
    expect(screen).toContain('label="Uang masuk"');
    expect(screen).toContain('label="Uang keluar"');
    expect(screen).toContain('label="Pindah saldo"');
    expect(screen).toContain("chooseKind");
    expect(screen).toContain("Pilih jenis yang benar bila struk terbaca keliru");
  });

  it("mengarahkan model Aira untuk mengklasifikasikan bukti secara eksplisit", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("choose income only when");
    expect(router).toContain("Choose expense");
    expect(router).toContain("Choose transfer");
  });
});
