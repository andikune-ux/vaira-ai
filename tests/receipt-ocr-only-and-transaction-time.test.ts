import fs from "node:fs";

import { describe, expect, it } from "vitest";

import { isReceiptDateTimeInputValid, receiptDateTimeToIso } from "@/lib/finance/receipt-date-time";

const scanScreen = fs.readFileSync("app/scan-receipt.tsx", "utf8");
const addTransaction = fs.readFileSync("app/add-transaction.tsx", "utf8");
const router = fs.readFileSync("server/routers.ts", "utf8");

describe("Pindai Bukti OCR-saja dan waktu transaksi", () => {
  it("hanya memakai endpoint OCR pada layar pindai dan tidak menyisakan endpoint analisis bukti Aira", () => {
    expect(scanScreen).toContain("trpc.ai.analyzeReceiptOcr.useMutation()");
    expect(scanScreen).not.toContain("trpc.ai.analyzeReceipt.useMutation()");
    expect(scanScreen).not.toContain("Analisis bukti dengan Aira");
    expect(router).not.toContain("analyzeReceipt: publicProcedure");
    expect(router).toContain("analyzeReceiptOcr: publicProcedure");
  });

  it("menyediakan kalender mini dan meneruskan tanggal-jam yang valid untuk tambah maupun edit mutasi", () => {
    expect(addTransaction).toContain("TransactionDatePicker");
    expect(addTransaction).toContain("Tanggal dan jam transaksi");
    expect(addTransaction).toContain("receiptDateTimeToIso(transactionDate, transactionTime");
    expect(addTransaction).toContain("isReceiptDateTimeInputValid(transactionDate, transactionTime)");
    expect(isReceiptDateTimeInputValid("26-08-2026", "19:45")).toBe(true);
    expect(isReceiptDateTimeInputValid("31-02-2026", "19:45")).toBe(false);
    expect(isReceiptDateTimeInputValid("26-08-2026", "28:00")).toBe(false);
    expect(receiptDateTimeToIso("26-08-2026", "19:45")).toContain("2026-08-26T");
  });
});
