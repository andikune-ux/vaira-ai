import { describe, expect, it } from "vitest";

import { airaRetryMessage, nextAiraFailureCount, useOcrFallbackOnAttempt } from "@/lib/finance/receipt-scan-attempts";

describe("urutan pemindaian bukti", () => {
  it("mencoba Aira dua kali sebelum mengarahkan pemindaian ketiga ke OCR", () => {
    expect(useOcrFallbackOnAttempt(0)).toBe(false);
    expect(useOcrFallbackOnAttempt(1)).toBe(false);
    expect(useOcrFallbackOnAttempt(2)).toBe(true);
  });

  it("menghitung kegagalan hanya ketika nominal tidak terbaca dan mereset setelah nominal ditemukan", () => {
    expect(nextAiraFailureCount(0, null)).toBe(1);
    expect(nextAiraFailureCount(1, null)).toBe(2);
    expect(nextAiraFailureCount(2, null)).toBe(2);
    expect(nextAiraFailureCount(2, 75000)).toBe(0);
    expect(airaRetryMessage(2)).toContain("OCR online cadangan");
  });
});
