import { describe, expect, it } from "vitest";

import { classifyReceiptWithWallets } from "@/lib/finance/receipt-wallet-match";
import type { Wallet } from "@/lib/finance/types";

const wallets: Wallet[] = [
  { id: "bca", name: "BCA Andik", kind: "bank", openingBalance: 0, accountNumber: "123456789012", color: "#1D62D3", createdAt: "2026-08-26T00:00:00.000Z" },
  { id: "dana", name: "DANA Andik", kind: "ewallet", openingBalance: 0, accountNumber: "9988776655", color: "#1686D9", createdAt: "2026-08-26T00:00:00.000Z" },
];

describe("klasifikasi bukti berdasarkan dompet lokal", () => {
  it("mengenali tujuan rekening milik pengguna sebagai pemasukan", () => {
    const result = classifyReceiptWithWallets({ kind: "expense", evidence: { recipientAccountNumber: "1234 5678 9012" } }, wallets);
    expect(result).toMatchObject({ kind: "income", destinationWalletId: "bca", evidence: { classificationBasis: "wallet_destination" } });
  });

  it("mengenali asal rekening milik pengguna sebagai pengeluaran", () => {
    const result = classifyReceiptWithWallets({ kind: "income", evidence: { senderAccountNumber: "123456789012" } }, wallets);
    expect(result).toMatchObject({ kind: "expense", sourceWalletId: "bca", evidence: { classificationBasis: "wallet_source" } });
  });

  it("mengenali dua dompet berbeda milik pengguna sebagai pindah saldo", () => {
    const result = classifyReceiptWithWallets({ kind: "expense", evidence: { senderAccountNumber: "123456789012", recipientAccountNumber: "9988776655" } }, wallets);
    expect(result).toMatchObject({ kind: "transfer", sourceWalletId: "bca", destinationWalletId: "dana", evidence: { classificationBasis: "wallet_internal" } });
  });
});
