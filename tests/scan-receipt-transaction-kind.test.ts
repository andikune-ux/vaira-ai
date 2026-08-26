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

  it("memakai OCR saja untuk mengklasifikasikan bukti secara eksplisit", () => {
    const ocr = read("server/receipt-ocr-fallback.ts");
    const router = read("server/routers.ts");
    expect(ocr).toContain("classifyTransaction");
    expect(ocr).toContain("uang|dana|saldo");
    expect(ocr).toContain("transfer");
    expect(router).toContain("analyzeReceiptOcr: publicProcedure");
    expect(router).not.toContain("analyzeReceipt: publicProcedure");
  });
});
