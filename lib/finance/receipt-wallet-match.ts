import type { TransactionEvidence, TransactionKind, Wallet } from "./types";

export type ReceiptWalletMatchInput = {
  kind: TransactionKind;
  senderName?: string | null;
  recipientName?: string | null;
  evidence?: TransactionEvidence;
};

export type ReceiptWalletMatch = {
  kind: TransactionKind;
  sourceWalletId?: string;
  destinationWalletId?: string;
  evidence: TransactionEvidence;
};

const normalizeText = (value?: string | null) => value?.toLocaleLowerCase("id-ID").replace(/[^\p{L}\p{N}]/gu, "") ?? "";
const normalizeDigits = (value?: string | null) => value?.replace(/\D/g, "") ?? "";

const walletForAccount = (wallets: Wallet[], accountNumber?: string) => {
  const normalized = normalizeDigits(accountNumber);
  return normalized ? wallets.find((wallet) => normalizeDigits(wallet.accountNumber) === normalized) : undefined;
};

const walletForName = (wallets: Wallet[], name?: string | null) => {
  const normalized = normalizeText(name);
  if (normalized.length < 4) return undefined;
  return wallets.find((wallet) => {
    const walletName = normalizeText(wallet.name);
    return walletName.length >= 4 && (walletName === normalized || walletName.includes(normalized) || normalized.includes(walletName));
  });
};

export function classifyReceiptWithWallets(input: ReceiptWalletMatchInput, wallets: Wallet[]): ReceiptWalletMatch {
  const evidence = { ...(input.evidence ?? {}) };
  const sourceWallet = walletForAccount(wallets, evidence.senderAccountNumber) ?? walletForName(wallets, evidence.senderAccountName ?? input.senderName);
  const destinationWallet = walletForAccount(wallets, evidence.recipientAccountNumber) ?? walletForName(wallets, evidence.recipientAccountName ?? input.recipientName);

  if (sourceWallet && destinationWallet && sourceWallet.id !== destinationWallet.id) {
    return { kind: "transfer", sourceWalletId: sourceWallet.id, destinationWalletId: destinationWallet.id, evidence: { ...evidence, classificationBasis: "wallet_internal" } };
  }
  if (destinationWallet) {
    return { kind: "income", destinationWalletId: destinationWallet.id, evidence: { ...evidence, classificationBasis: "wallet_destination" } };
  }
  if (input.kind === "transfer" && evidence.transferStatus && evidence.transferStatus !== "unknown") {
    return { kind: "transfer", sourceWalletId: sourceWallet?.id, evidence: { ...evidence, classificationBasis: sourceWallet ? "wallet_source" : "ocr_text" } };
  }
  if (sourceWallet) {
    return { kind: "expense", sourceWalletId: sourceWallet.id, evidence: { ...evidence, classificationBasis: "wallet_source" } };
  }
  return { kind: input.kind, evidence };
}
