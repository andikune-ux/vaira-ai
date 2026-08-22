import { describe, expect, it } from "vitest";

import { parseReceiptOcrText } from "@/server/receipt-ocr-fallback";

describe("fallback OCR online Pindai Bukti", () => {
  it("mengutamakan nominal berlabel dan menambahkan penerima dari teks OCR", () => {
    const parsed = parseReceiptOcrText("Transfer Berhasil\nPenerima: Toko Sinar Jaya\nTotal Transfer Rp 125.000\nBiaya Rp 2.500");
    expect(parsed.provider).toBe("ocr_space");
    expect(parsed.kind).toBe("transfer");
    expect(parsed.amount).toBe(125000);
    expect(parsed.recipientName).toBe("Toko Sinar Jaya");
    expect(parsed.occurredAt).toBeNull();
  });

  it("tetap mengembalikan nominal mata uang ketika tanggal tidak ditemukan", () => {
    const parsed = parseReceiptOcrText("Pembayaran merchant\nRp 75.000\nTerima kasih");
    expect(parsed.amount).toBe(75000);
    expect(parsed.occurredAt).toBeNull();
  });
});
