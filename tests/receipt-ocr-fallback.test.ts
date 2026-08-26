import { describe, expect, it } from "vitest";

import { parseReceiptOcrText } from "@/server/receipt-ocr-fallback";

describe("fallback OCR online Pindai Bukti", () => {
  it("mengutamakan nominal berlabel dan menambahkan pengirim/penerima dari teks OCR", () => {
    const parsed = parseReceiptOcrText("Transfer Berhasil\nPengirim: Andi Pratama\nPenerima: Toko Sinar Jaya\nTotal Transfer Rp 125.000\nBiaya Rp 2.500");
    expect(parsed.provider).toBe("ocr_space");
    expect(parsed.kind).toBe("transfer");
    expect(parsed.amount).toBe(125000);
    expect(parsed.senderName).toBe("Andi Pratama");
    expect(parsed.recipientName).toBe("Toko Sinar Jaya");
    expect(parsed.occurredAt).toBeNull();
  });

  it("membiarkan nama pengirim dan penerima kosong ketika labelnya tidak ada", () => {
    const parsed = parseReceiptOcrText("Pembayaran merchant\nTotal Rp 75.000\nTerima kasih");
    expect(parsed.senderName).toBeNull();
    expect(parsed.recipientName).toBeNull();
  });

  it("tetap mengembalikan nominal mata uang ketika tanggal tidak ditemukan", () => {
    const parsed = parseReceiptOcrText("Pembayaran merchant\nRp 75.000\nTerima kasih");
    expect(parsed.amount).toBe(75000);
    expect(parsed.occurredAt).toBeNull();
  });

  it("membedakan uang masuk, uang keluar, dan pindah saldo dari teks bukti", () => {
    expect(parseReceiptOcrText("Kredit dana masuk Rp 300.000").kind).toBe("income");
    expect(parseReceiptOcrText("Pembayaran merchant Rp 75.000").kind).toBe("expense");
    expect(parseReceiptOcrText("Transfer berhasil ke rekening tujuan Rp 125.000").kind).toBe("transfer");
  });

  it("membaca tanggal dan jam yang terlihat tanpa membuat tanggal atau jam ketika tidak ada", () => {
    const parsed = parseReceiptOcrText("Pembayaran QRIS\nPenerima\nWarung Sejahtera\nNominal: Rp 48.500\nTanggal 26/08/2026\nPukul 19:45");
    expect(parsed.amount).toBe(48500);
    expect(parsed.recipientName).toBe("Warung Sejahtera");
    expect(parsed.transactionDate).toBe("26-08-2026");
    expect(parsed.transactionTime).toBe("19:45");
    expect(parsed.occurredAt).toBeNull();

    const withoutTime = parseReceiptOcrText("Total Rp 75.000\nTanggal 26-08-2026");
    expect(withoutTime.transactionDate).toBe("26-08-2026");
    expect(withoutTime.transactionTime).toBeNull();
  });

  it("membaca metadata bank, rekening, referensi, dan QRIS bila tertulis jelas pada bukti", () => {
    const parsed = parseReceiptOcrText("Pembayaran QRIS\nNama Merchant: Warung Nasi Bu Siti\nBank Pengirim: BCA\nNo Rekening Pengirim: 1234 5678 9012\nID Transaksi: QRIS-2026-ABCD\nNominal Rp 28.000\nTanggal 26-08-2026\nPukul 08:15");
    expect(parsed.evidence).toMatchObject({ paymentMethod: "qris", sourceBankName: "BCA", senderAccountNumber: "123456789012", referenceNumber: "QRIS-2026-ABCD", merchantName: "Warung Nasi Bu Siti", classificationBasis: "ocr_text" });
    expect(parsed.category).toBe("Makan");
    expect(parsed.note).toContain("Pembayaran QRIS kepada Warung Nasi Bu Siti");
  });

  it("membaca struktur bukti transfer bank secara berurutan, termasuk status, rekening pihak, metode, total, dan biaya Gratis", () => {
    const parsed = parseReceiptOcrText([
      "Transfer Berhasil",
      "Tanggal 26 Agustus 2026, 18.32 WIB",
      "ID Transaksi",
      "MB-REF-260826-X9",
      "Pengirim",
      "Andik Une",
      "BCA mobile",
      "1234 5678 9012",
      "Penerima",
      "Siti Aminah",
      "Bank Mandiri",
      "9876 5432 1098",
      "Jenis Transfer",
      "BI Fast",
      "Nominal Transfer Rp 250.000",
      "Biaya Admin Gratis",
      "Total Transfer Rp 250.000",
    ].join("\n"));

    expect(parsed.kind).toBe("transfer");
    expect(parsed.amount).toBe(250000);
    expect(parsed.senderName).toBe("Andik Une");
    expect(parsed.recipientName).toBe("Siti Aminah");
    expect(parsed.transactionDate).toBe("26-08-2026");
    expect(parsed.transactionTime).toBe("18:32");
    expect(parsed.evidence).toMatchObject({
      paymentMethod: "bank_transfer",
      transferStatus: "succeeded",
      transferMethodLabel: "BI Fast",
      sourceBankName: "BCA",
      destinationBankName: "MANDIRI",
      senderAccountNumber: "123456789012",
      recipientAccountNumber: "987654321098",
      referenceNumber: "MB-REF-260826-X9",
      adminFeeAmount: 0,
      adminFeeWaived: true,
      totalAmount: 250000,
      classificationBasis: "ocr_text",
    });
  });

  it("membaca biaya admin hanya ketika ada teks biaya yang jelas dan tidak menganggap nominal transfer sebagai biaya", () => {
    const parsed = parseReceiptOcrText("Transfer berhasil\nPengirim: Andi\nPenerima: Budi\nNominal Rp 750.000\nBiaya admin Rp 2.500\nTotal transfer Rp 752.500");
    expect(parsed.amount).toBe(750000);
    expect(parsed.evidence.adminFeeAmount).toBe(2500);
    expect(parsed.evidence.adminFeeWaived).toBeUndefined();
    expect(parsed.evidence.totalAmount).toBe(752500);
  });

  it("membedakan status gagal atau menunggu dan tidak mengisi rincian pihak ketika tidak tertulis", () => {
    expect(parseReceiptOcrText("Transfer gagal\nNominal Rp 10.000").evidence.transferStatus).toBe("failed");
    expect(parseReceiptOcrText("Transfer sedang diproses\nNominal Rp 10.000").evidence.transferStatus).toBe("pending");
    const incomplete = parseReceiptOcrText("Transfer berhasil\nNominal Rp 10.000");
    expect(incomplete.senderName).toBeNull();
    expect(incomplete.recipientName).toBeNull();
    expect(incomplete.evidence.senderAccountNumber).toBeUndefined();
    expect(incomplete.evidence.destinationBankName).toBeUndefined();
  });

  it("tetap membiarkan metadata sensitif kosong bila label tidak terlihat pada teks OCR", () => {
    const parsed = parseReceiptOcrText("Pembayaran Rp 50.000\nTerima kasih");
    expect(parsed.evidence.senderAccountNumber).toBeUndefined();
    expect(parsed.evidence.recipientAccountNumber).toBeUndefined();
    expect(parsed.evidence.referenceNumber).toBeUndefined();
  });
});
