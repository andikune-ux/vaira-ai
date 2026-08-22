import type { TransactionKind } from "./types";

export type ReceiptCounterpartyRole = "sender" | "recipient";

export const getReceiptCounterpartyRole = (kind: TransactionKind): ReceiptCounterpartyRole =>
  kind === "income" ? "sender" : "recipient";

export const getReceiptCounterpartyLabel = (kind: TransactionKind) => {
  if (kind === "income") return "Nama pengirim";
  if (kind === "transfer") return "Nama penerima / tujuan";
  return "Nama penerima";
};

export const getReceiptCounterpartyNoteLabel = (kind: TransactionKind) =>
  getReceiptCounterpartyRole(kind) === "sender" ? "Pengirim" : "Penerima";

export const normalizeReceiptCounterpartyName = (value: string | null | undefined) =>
  value?.replace(/\s+/g, " ").trim().slice(0, 120) || "";

export const appendReceiptCounterpartyToNote = (
  note: string,
  kind: TransactionKind,
  counterpartyName: string | null | undefined,
) => {
  const normalizedName = normalizeReceiptCounterpartyName(counterpartyName);
  const normalizedNote = note.trim();
  if (!normalizedName) return normalizedNote;
  const label = getReceiptCounterpartyNoteLabel(kind);
  const prefix = `${label}: ${normalizedName}`;
  if (normalizedNote.toLocaleLowerCase("id-ID").includes(prefix.toLocaleLowerCase("id-ID"))) {
    return normalizedNote.slice(0, 240);
  }
  return `${prefix}${normalizedNote ? ` · ${normalizedNote}` : ""}`.slice(0, 240);
};
