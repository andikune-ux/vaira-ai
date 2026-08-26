import { describe, expect, it } from "vitest";

import { parseTransactionEvidence, serializeTransactionEvidence } from "@/lib/finance/transaction-evidence";

describe("metadata bukti transfer", () => {
  it("mempertahankan rincian transfer OCR sampai tahap konfirmasi", () => {
    const restored = parseTransactionEvidence(serializeTransactionEvidence({
      paymentMethod: "bank_transfer",
      transferStatus: "succeeded",
      transferMethodLabel: "BI Fast",
      sourceBankName: "BCA",
      destinationBankName: "MANDIRI",
      senderAccountDisplay: "***5237",
      recipientAccountNumber: "987654321098",
      referenceNumber: "MB-REF-260826-X9",
      transactionPurpose: "Pemindahan Dana",
      sequenceNumber: "113713",
      adminFeeAmount: 0,
      adminFeeWaived: true,
      totalAmount: 250000,
      classificationBasis: "ocr_text",
    }));

    expect(restored).toMatchObject({
      paymentMethod: "bank_transfer",
      transferStatus: "succeeded",
      transferMethodLabel: "BI Fast",
      senderAccountDisplay: "***5237",
      recipientAccountNumber: "987654321098",
      referenceNumber: "MB-REF-260826-X9",
      transactionPurpose: "Pemindahan Dana",
      sequenceNumber: "113713",
      adminFeeAmount: 0,
      adminFeeWaived: true,
      totalAmount: 250000,
      classificationBasis: "ocr_text",
    });
  });
});
