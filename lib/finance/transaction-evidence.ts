import type { TransactionEvidence } from "./types";

const text = (value: unknown, limit = 120) => typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, limit) || undefined : undefined;
const account = (value: unknown) => {
  const digits = text(value, 32)?.replace(/\D/g, "");
  return digits && digits.length >= 8 && digits.length <= 24 ? digits : undefined;
};
const accountDisplay = (value: unknown) => {
  const display = text(value, 32);
  return display && /(?:\*{2,}\d{3,}|\d{8,24})/.test(display) ? display : undefined;
};
const money = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value) : undefined;

export function normalizeTransactionEvidence(value: unknown): TransactionEvidence {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const paymentMethod = raw.paymentMethod === "bank_transfer" || raw.paymentMethod === "qris" || raw.paymentMethod === "cash" || raw.paymentMethod === "unknown" ? raw.paymentMethod : undefined;
  const classificationBasis = raw.classificationBasis === "ocr_text" || raw.classificationBasis === "wallet_destination" || raw.classificationBasis === "wallet_source" || raw.classificationBasis === "wallet_internal" ? raw.classificationBasis : undefined;
  const transferStatus = raw.transferStatus === "succeeded" || raw.transferStatus === "pending" || raw.transferStatus === "failed" || raw.transferStatus === "unknown" ? raw.transferStatus : undefined;
  return {
    paymentMethod,
    transferStatus,
    transferMethodLabel: text(raw.transferMethodLabel, 60),
    sourceBankName: text(raw.sourceBankName, 60),
    destinationBankName: text(raw.destinationBankName, 60),
    senderAccountName: text(raw.senderAccountName),
    recipientAccountName: text(raw.recipientAccountName),
    senderAccountNumber: account(raw.senderAccountNumber),
    recipientAccountNumber: account(raw.recipientAccountNumber),
    senderAccountDisplay: accountDisplay(raw.senderAccountDisplay ?? raw.senderAccountNumber),
    recipientAccountDisplay: accountDisplay(raw.recipientAccountDisplay ?? raw.recipientAccountNumber),
    referenceNumber: text(raw.referenceNumber, 80),
    transactionPurpose: text(raw.transactionPurpose, 120),
    sequenceNumber: text(raw.sequenceNumber, 40),
    merchantName: text(raw.merchantName),
    adminFeeAmount: money(raw.adminFeeAmount),
    adminFeeWaived: raw.adminFeeWaived === true ? true : undefined,
    totalAmount: money(raw.totalAmount),
    classificationBasis,
  };
}

export function parseTransactionEvidence(value?: string | string[]): TransactionEvidence {
  const source = Array.isArray(value) ? value[0] : value;
  if (!source) return {};
  try { return normalizeTransactionEvidence(JSON.parse(source)); } catch { return {}; }
}

export const serializeTransactionEvidence = (value: TransactionEvidence) => JSON.stringify(normalizeTransactionEvidence(value));
