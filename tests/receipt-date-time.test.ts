import { describe, expect, it } from "vitest";

import { formatReceiptDate, formatReceiptTime, normalizeReceiptDateInput, normalizeReceiptTimeInput, receiptDateTimeToIso } from "@/lib/finance/receipt-date-time";

describe("format Pindai Bukti", () => {
  it("menampilkan dan menormalkan tanggal menjadi DD-MM-YYYY", () => {
    expect(formatReceiptDate(new Date(2026, 7, 22, 17, 49))).toBe("22-08-2026");
    expect(normalizeReceiptDateInput("22082026")).toBe("22-08-2026");
    expect(normalizeReceiptDateInput("22/08/2026")).toBe("22-08-2026");
  });

  it("menampilkan dan menormalkan jam menjadi HH:MM", () => {
    expect(formatReceiptTime(new Date(2026, 7, 22, 7, 9))).toBe("07:09");
    expect(normalizeReceiptTimeInput("1749")).toBe("17:49");
    expect(normalizeReceiptTimeInput("17.49")).toBe("17:49");
  });

  it("memakai waktu fallback bila input manual belum lengkap atau tidak valid", () => {
    const fallback = new Date(2026, 7, 22, 17, 49, 0, 0);
    expect(receiptDateTimeToIso("22-08-2026", "17:49", fallback)).toBe(fallback.toISOString());
    expect(receiptDateTimeToIso("31-02-2026", "99:99", fallback)).toBe(fallback.toISOString());
  });
});
