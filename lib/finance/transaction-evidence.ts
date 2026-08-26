import type { TransactionEvidence } from "./types";

const text = (value: unknown, limit = 120) => typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, limit) || undefined : undefined;
const account = (value: unknown) => {
  const digits = text(value, 32)?.replace(/\D/g, "");
  return digits && digits.length >= 8 && digits.length <= 24 ? digits : undefined;
};

export function normalizeTransactionEvidence(value: unknown): TransactionEvidence {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const paymentMethod = raw.paymentMethod === "bank_transfer" || raw.paymentMethod === "qris" || raw.paymentMethod === "cash" || raw.paymentMethod === "unknown" ? raw.paymentMethod : undefined;
  const classificationBasis = raw.classificationBasis === "ocr_text" || raw.classificationBasis === "wallet_destination" || raw.classificationBasis === "wallet_source" || raw.classificationBasis === "wallet_internal" ? raw.classificationBasis : undefined;
  return {
    paymentMethod,
    sourceBankName: text(raw.sourceBankName, 60),
    destinationBankName: text(raw.destinationBankName, 60),
    senderAccountName: text(raw.senderAccountName),
    recipientAccountName: text(raw.recipientAccountName),
    senderAccountNumber: account(raw.senderAccountNumber),
    recipientAccountNumber: account(raw.recipientAccountNumber),
    referenceNumber: text(raw.referenceNumber, 80),
    merchantName: text(raw.merchantName),
    classificationBasis,
  };
}

export function parseTransactionEvidence(value?: string | string[]): TransactionEvidence {
  const source = Array.isArray(value) ? value[0] : value;
  if (!source) return {};
  try { return normalizeTransactionEvidence(JSON.parse(source)); } catch { return {}; }
}

export const serializeTransactionEvidence = (value: TransactionEvidence) => JSON.stringify(normalizeTransactionEvidence(value));
