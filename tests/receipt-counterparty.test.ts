import { describe, expect, it } from "vitest";

import { appendReceiptCounterpartyToNote, getReceiptCounterpartyLabel, getReceiptCounterpartyRole } from "@/lib/finance/receipt-counterparty";

describe("kolom nama pengirim/penerima Pindai Bukti", () => {
  it("memakai pengirim untuk uang masuk dan penerima untuk uang keluar atau transfer", () => {
    expect(getReceiptCounterpartyRole("income")).toBe("sender");
    expect(getReceiptCounterpartyLabel("income")).toBe("Nama pengirim");
    expect(getReceiptCounterpartyRole("expense")).toBe("recipient");
    expect(getReceiptCounterpartyRole("transfer")).toBe("recipient");
  });

  it("menyimpan nama sebagai bagian catatan tanpa membuat nilai ketika nama kosong", () => {
    expect(appendReceiptCounterpartyToNote("Belanja mingguan", "expense", "Toko Sinar")).toBe("Penerima: Toko Sinar · Belanja mingguan");
    expect(appendReceiptCounterpartyToNote("Setoran", "income", "Andi")).toBe("Pengirim: Andi · Setoran");
    expect(appendReceiptCounterpartyToNote("Bukti transaksi", "income", "")).toBe("Bukti transaksi");
  });
});
