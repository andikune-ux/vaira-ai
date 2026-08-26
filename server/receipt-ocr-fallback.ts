import type { TransactionEvidence } from "@/lib/finance/types";

export type ReceiptOcrFallback = {
  kind: "income" | "expense" | "transfer";
  amount: number | null;
  category: string;
  note: string;
  senderName: string | null;
  recipientName: string | null;
  /** Dipertahankan untuk kompatibilitas; tanggal dan jam mentah digunakan agar zona waktu tidak diasumsikan. */
  occurredAt: null;
  transactionDate: string | null;
  transactionTime: string | null;
  sourceHint: string | null;
  destinationHint: string | null;
  evidence: TransactionEvidence;
  confidence: number;
  needsReview: true;
  provider: "ocr_space";
};

const cleanLine = (value: string) => value.replace(/\s+/g, " ").trim();

const isIdentityValue = (value: string) => {
  if (!value || value.length < 2 || value.length > 120) return false;
  if (/\b(?:rp|idr|nominal|jumlah|total|tanggal|waktu|jam|ref(?:erensi)?|trx|transaksi)\b/i.test(value)) return false;
  if (/^[-–—:\d.,/]+$/.test(value)) return false;
  return true;
};

const amountFromToken = (value: string) => {
  const token = value.trim().replace(/[^0-9,.-]/g, "");
  if (!/\d/.test(token)) return null;
  const separators = [...token.matchAll(/[.,]/g)];
  const lastSeparator = separators[separators.length - 1];
  let integerPart = token;
  if (lastSeparator) {
    const decimalTail = token.slice(lastSeparator.index! + 1).replace(/\D/g, "");
    const prefix = token.slice(0, lastSeparator.index!);
    const prefixHasSeparator = /[.,]/.test(prefix);
    if (decimalTail.length === 2 && (prefixHasSeparator || prefix.replace(/\D/g, "").length >= 4)) integerPart = prefix;
  }
  const parsed = Number(integerPart.replace(/\D/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
};

const amountTokens = (line: string) => Array.from(line.matchAll(/(?:rp\.?|idr)\s*([0-9][0-9.,]*)/gi))
  .map((match) => amountFromToken(match[1]))
  .filter((amount): amount is number => amount !== null);

const labelledAmount = (lines: string[], labels: string[]) => {
  const labelPattern = labels.map((label) => label.replace(/\s+/g, "\\s+")).join("|");
  const pattern = new RegExp(`(?:^|\\b)(?:${labelPattern})(?:\\b|$)`, "i");
  for (const [index, line] of lines.entries()) {
    if (!pattern.test(line)) continue;
    const inline = amountTokens(line)[0];
    if (inline !== undefined) return inline;
    const following = amountTokens(lines[index + 1] ?? "")[0];
    if (following !== undefined) return following;
  }
  return null;
};

const findAmount = (lines: string[]) => {
  const priority = /\b(total(?:\s+bayar|\s+transaksi)?|jumlah(?:\s+bayar)?|nominal|nilai(?:\s+transfer)?|dibayar|debit|kredit)\b/i;
  const labelled = lines.filter((line) => priority.test(line)).flatMap(amountTokens);
  if (labelled.length) return labelled[0] ?? null;
  const currency = lines.flatMap(amountTokens);
  if (currency.length) return Math.max(...currency);
  const plainCandidates = lines
    .filter((line) => !/\b(?:tanggal|waktu|jam|ref(?:erensi)?|nomor|no\.)\b/i.test(line))
    .flatMap((line) => Array.from(line.matchAll(/\b([0-9][0-9.,]{3,})\b/g)).map((match) => amountFromToken(match[1])))
    .filter((amount): amount is number => amount !== null && amount >= 1_000);
  return plainCandidates.length ? Math.max(...plainCandidates) : null;
};

const extractLabelledName = (lines: string[], labels: string[]) => {
  const labelPattern = labels.map((label) => label.replace(/\s+/g, "\\s+")).join("|");
  const inline = new RegExp(`^(?:${labelPattern})\\s*[:\\-]?\\s*(.+)$`, "i");
  const standalone = new RegExp(`^(?:${labelPattern})\\s*[:\\-]?$`, "i");
  for (const [index, line] of lines.entries()) {
    const match = line.match(inline)?.[1]?.trim();
    if (match && isIdentityValue(match)) return cleanLine(match).slice(0, 120);
    if (standalone.test(line)) {
      const nextLine = lines[index + 1];
      if (nextLine && isIdentityValue(nextLine)) return cleanLine(nextLine).slice(0, 120);
    }
  }
  return null;
};

const extractLabelledValue = (lines: string[], labels: string[], accept: (value: string) => boolean) => {
  const labelPattern = labels.map((label) => label.replace(/\s+/g, "\\s+")).join("|");
  const inline = new RegExp(`^(?:${labelPattern})\\s*[:\\-]?\\s*(.+)$`, "i");
  const standalone = new RegExp(`^(?:${labelPattern})\\s*[:\\-]?$`, "i");
  for (const [index, line] of lines.entries()) {
    const match = line.match(inline)?.[1]?.trim();
    if (match && accept(match)) return cleanLine(match).slice(0, 120);
    if (standalone.test(line)) {
      const nextLine = lines[index + 1];
      if (nextLine && accept(nextLine)) return cleanLine(nextLine).slice(0, 120);
    }
  }
  return null;
};

const extractReferenceNumber = (lines: string[]) => {
  const labelPattern = ["id transaksi", "id trx", "nomor referensi", "no referensi", "ref", "reference", "kode transaksi"].map((label) => label.replace(/\s+/g, "\\s+")).join("|");
  const inline = new RegExp(`^(?:${labelPattern})\\s*[:\\-]?\\s*(.*)$`, "i");
  const stop = /^(?:pengirim|penerima|nama\s+(?:pengirim|penerima)|ke\s+rekening\s+tujuan|bank\s+(?:pengirim|penerima|tujuan)|jenis\s+transfer|metode(?:\s+transfer)?|nominal|total|biaya|layanan|tujuan\s+transaksi|no\s+urut|pt\.?|menara|npwp)\b/i;
  for (const [index, line] of lines.entries()) {
    const match = line.match(inline);
    if (!match) continue;
    const parts = match[1] ? [match[1]] : [];
    for (let offset = 1; offset <= 3; offset += 1) {
      const candidate = lines[index + offset];
      if (!candidate || stop.test(candidate) || !/^[A-Za-z0-9._/\- ]{3,80}$/.test(candidate)) break;
      parts.push(candidate);
    }
    const reference = parts.join("").replace(/\s+/g, "");
    if (/^[A-Za-z0-9._/\-]{4,100}$/.test(reference)) return reference;
  }
  return null;
};

const extractTransactionPurpose = (lines: string[]) => {
  const label = /^tujuan\s+transaksi\s*[:\-]?\s*(.*)$/i;
  const stop = /^(?:ref(?:erence)?|no\s+urut|biaya|layanan|nominal|total|pt\.?|menara|npwp)\b/i;
  for (const [index, line] of lines.entries()) {
    const match = line.match(label);
    if (!match) continue;
    const parts = match[1] ? [match[1]] : [];
    const continuation = lines[index + 1];
    if (continuation && !stop.test(continuation) && isIdentityValue(continuation)) parts.push(continuation);
    const purpose = cleanLine(parts.join(" "));
    if (purpose) return purpose.slice(0, 120);
  }
  return null;
};

const extractSequenceNumber = (lines: string[]) => extractLabelledValue(lines, ["no urut", "nomor urut"], (value) => /^[A-Za-z0-9._/\- ]{3,40}$/.test(value))?.replace(/\s+/g, "") ?? null;

const isAccountNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 24;
};

type AccountDetails = { number: string | null; display: string | null };

const accountFromText = (value: string): AccountDetails => {
  const clean = cleanLine(value);
  const masked = clean.match(/\*{2,}\s*\d(?:[\s-]*\d){2,}/)?.[0];
  if (masked) return { number: null, display: masked.replace(/[\s-]/g, "") };
  const unmasked = clean.match(/\d(?:[\s-]*\d){7,23}/)?.[0];
  if (!unmasked) return { number: null, display: null };
  const digits = unmasked.replace(/\D/g, "");
  return isAccountNumber(digits) ? { number: digits, display: digits } : { number: null, display: null };
};

const partyBlockValues = (lines: string[], labels: string[], otherLabels: string[]) => {
  const labelPattern = labels.map((label) => label.replace(/\s+/g, "\\s+")).join("|");
  const otherPattern = new RegExp(`^(?:${otherLabels.map((label) => label.replace(/\s+/g, "\\s+")).join("|")})\\s*[:\\-]?$`, "i");
  const pattern = new RegExp(`^(?:${labelPattern})\\s*[:\\-]?\\s*(.*)$`, "i");
  for (const [index, line] of lines.entries()) {
    const match = line.match(pattern);
    if (!match) continue;
    const values = match[1] ? [match[1]] : [];
    for (let offset = 1; offset <= 5; offset += 1) {
      const candidate = lines[index + offset];
      if (!candidate || otherPattern.test(candidate)) break;
      values.push(candidate);
    }
    return values;
  }
  return [];
};

const extractPartyAccount = (lines: string[], accountLabels: string[], partyLabels: string[], otherLabels: string[]) => {
  const labelled = extractLabelledValue(lines, accountLabels, (value) => Boolean(accountFromText(value).display));
  if (labelled) return accountFromText(labelled);
  for (const value of partyBlockValues(lines, partyLabels, otherLabels)) {
    const candidate = accountFromText(value);
    if (candidate.display) return candidate;
  }
  return { number: null, display: null };
};

const bankNames = ["BCA", "BRI", "BNI", "MANDIRI", "BTN", "BSI", "CIMB", "PERMATA", "DANAMON", "JAGO", "SEABANK", "SINARMAS", "NEO", "BLU", "OVO", "DANA", "GOPAY", "SHOPEEPAY", "LINKAJA"];

const detectBank = (value: string) => {
  const uppercase = value.toUpperCase();
  return bankNames.find((bank) => new RegExp(`\\b${bank}\\b`, "i").test(uppercase)) ?? null;
};

const detectPartyBank = (lines: string[], labels: string[], otherLabels: string[]) => {
  for (const value of partyBlockValues(lines, labels, otherLabels)) {
    const bank = detectBank(value);
    if (bank) return bank;
  }
  return null;
};

const extractBcaDestination = (lines: string[]) => {
  const index = lines.findIndex((line) => /^ke\s+rekening\s+tujuan\b/i.test(line));
  if (index < 0) return { bank: null, account: { number: null, display: null } as AccountDetails, name: null };
  const values = lines.slice(index + 1, index + 6);
  const bank = values.map(detectBank).find((value): value is string => Boolean(value)) ?? null;
  const account = values.map(accountFromText).find((value) => Boolean(value.display)) ?? { number: null, display: null };
  const name = values.find((value) => isIdentityValue(value) && !detectBank(value) && !accountFromText(value).display) ?? null;
  return { bank, account, name: name ? cleanLine(name).slice(0, 120) : null };
};

const detectSourceBank = (lines: string[], senderName: string | null) => {
  const labelled = extractLabelledValue(lines, ["bank pengirim", "bank asal", "dari bank", "source bank"], (value) => Boolean(detectBank(value)));
  if (labelled) return detectBank(labelled);
  const joined = lines.join("\n");
  if (/\bm-?transfer\b/i.test(joined) || /\b(?:pt\.?\s*)?bank\s+central\s+asia\b/i.test(joined)) return "BCA";
  return detectBank(senderName ?? "");
};

const parseTransferStatus = (text: string): NonNullable<TransactionEvidence["transferStatus"]> => {
  if (/\b(?:transfer\s+)?(?:gagal|failed|ditolak|tidak berhasil)\b/i.test(text)) return "failed";
  if (/\b(?:menunggu|pending|diproses|dalam proses)\b/i.test(text)) return "pending";
  if (/\b(?:transfer\s+)?(?:berhasil|sukses|success)\b/i.test(text)) return "succeeded";
  return "unknown";
};

const parseTransferMethod = (lines: string[]) => {
  const direct = extractLabelledValue(lines, ["metode transfer", "metode", "jenis transfer", "jalur transfer"], isIdentityValue);
  if (direct) return direct;
  const joined = lines.join("\n");
  if (/\bbi\s*fast\b/i.test(joined)) return "BI Fast";
  if (/\breal time online\b/i.test(joined)) return "Real Time Online";
  if (/\bskn\b/i.test(joined)) return "SKN";
  return null;
};

const parseAdminFee = (lines: string[]) => {
  const feeLabel = /^\s*(?:biaya\b|admin\s*fee\b)/i;
  for (const [index, line] of lines.entries()) {
    if (!feeLabel.test(line)) continue;
    const scope = `${line} ${lines[index + 1] ?? ""}`;
    if (/\b(?:gratis|free|bebas\s+biaya|rp\.?\s*0+(?:[.,]0+)?)\b/i.test(scope)) return { amount: 0, waived: true };
    const amount = amountTokens(scope)[0];
    if (amount !== undefined) return { amount, waived: false };
  }
  return { amount: null, waived: false };
};

const merchantCategory = (text: string) => {
  if (/\b(?:warung\s+nasi|nasi\b|makan|restoran|cafe|kuliner)\b/i.test(text)) return "Makan";
  if (/\b(?:sayur|buah|sembako|pasar|market|grocery)\b/i.test(text)) return "Belanja";
  if (/\b(?:cukur|barber|salon)\b/i.test(text)) return "Perawatan";
  if (/\b(?:transport|parkir|bensin|pertamina|ojek|grab|gojek)\b/i.test(text)) return "Transportasi";
  if (/\b(?:listrik|air|wifi|internet|pulsa|paket data)\b/i.test(text)) return "Tagihan";
  return null;
};

const pad = (value: number) => String(value).padStart(2, "0");

const parseDate = (text: string) => {
  const ymd = text.match(/\b(20\d{2})[\/.\-](0?[1-9]|1[0-2])[\/.\-](0?[1-9]|[12]\d|3[01])\b/);
  const dmy = text.match(/\b(0?[1-9]|[12]\d|3[01])[\/.\-](0?[1-9]|1[0-2])[\/.\-](\d{2}|20\d{2})\b/);
  const monthNames: Record<string, number> = { januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6, juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12 };
  const written = text.match(/\b(0?[1-9]|[12]\d|3[01])\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(20\d{2})\b/i);
  const source = ymd
    ? { year: Number(ymd[1]), month: Number(ymd[2]), day: Number(ymd[3]) }
    : dmy
      ? { day: Number(dmy[1]), month: Number(dmy[2]), year: dmy[3].length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3]) }
      : written
        ? { day: Number(written[1]), month: monthNames[written[2].toLowerCase()]!, year: Number(written[3]) }
        : null;
  if (!source) return null;
  const candidate = new Date(source.year, source.month - 1, source.day);
  if (candidate.getFullYear() !== source.year || candidate.getMonth() !== source.month - 1 || candidate.getDate() !== source.day) return null;
  return `${pad(source.day)}-${pad(source.month)}-${source.year}`;
};

const parseTime = (text: string) => {
  const colon = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/);
  const dotted = text.match(/\b([01]?\d|2[0-3])\.([0-5]\d)(?::[0-5]\d)?\b/);
  const source = colon ?? dotted;
  if (!source) return null;
  return `${pad(Number(source[1]))}:${source[2]}`;
};

const detectDateTime = (lines: string[]) => {
  const joined = lines.join("\n");
  const datedLine = lines.find((line) => parseDate(line) !== null);
  return {
    transactionDate: parseDate(datedLine ?? joined),
    transactionTime: datedLine ? parseTime(datedLine) ?? parseTime(joined) : parseTime(joined),
  };
};

const classifyTransaction = (text: string) => {
  const incoming = /\b(?:uang|dana|saldo)\s+masuk\b|\b(?:kredit|penerimaan|diterima|received|setoran|deposit|refund|cashback)\b/i.test(text);
  const transfer = /\b(?:pindah(?:an)?\s+(?:saldo|dana)|transfer|rekening\s+sendiri|antar\s+(?:rekening|dompet)|e-?wallet)\b/i.test(text);
  if (incoming) return "income" as const;
  if (transfer) return "transfer" as const;
  return "expense" as const;
};

const categoryFor = (kind: ReceiptOcrFallback["kind"], text: string) => {
  if (kind === "income") return "Pemasukan lainnya";
  if (kind === "transfer") return "Transfer dana";
  const merchant = merchantCategory(text);
  if (merchant) return merchant;
  if (/\b(?:belanja|market|toko|merchant|qris)\b/i.test(text)) return "Belanja";
  return "Lainnya";
};

export function parseReceiptOcrText(text: string): ReceiptOcrFallback {
  const lines = text.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const kind = classifyTransaction(text);
  const senderLabels = ["nama pengirim", "nama rekening pengirim", "pengirim", "sender", "dari", "asal dana"];
  const recipientLabels = ["nama penerima", "nama rekening penerima", "penerima", "tujuan transfer", "tujuan dana", "kepada", "merchant", "payee", "untuk"];
  const amount = labelledAmount(lines, ["nominal", "total transfer", "jumlah transfer", "total bayar", "total transaksi", "jumlah bayar", "nilai transfer"]) ?? findAmount(lines);
  const totalAmount = labelledAmount(lines, ["total transfer", "total bayar", "total transaksi", "jumlah transfer", "jumlah bayar"]);
  const senderName = extractLabelledName(lines, senderLabels);
  const bcaDestination = extractBcaDestination(lines);
  const recipientName = bcaDestination.name ?? extractLabelledName(lines, recipientLabels);
  const senderAccount = extractPartyAccount(lines, ["no rekening pengirim", "rekening pengirim", "nomor rekening pengirim", "account sender", "a/n pengirim"], senderLabels, recipientLabels);
  const recipientAccount = bcaDestination.account.display ? bcaDestination.account : extractPartyAccount(lines, ["no rekening penerima", "rekening penerima", "nomor rekening penerima", "account recipient", "a/n penerima"], recipientLabels, senderLabels);
  const sourceBankName = detectSourceBank(lines, senderName) ?? detectPartyBank(lines, senderLabels, recipientLabels) ?? null;
  const destinationBankName = bcaDestination.bank ?? extractLabelledValue(lines, ["bank penerima", "bank tujuan", "tujuan bank", "destination bank"], (value) => Boolean(detectBank(value))) ?? detectPartyBank(lines, recipientLabels, senderLabels) ?? detectBank(recipientName ?? "") ?? null;
  const referenceNumber = extractReferenceNumber(lines);
  const transactionPurpose = extractTransactionPurpose(lines);
  const sequenceNumber = extractSequenceNumber(lines);
  const transferStatus = parseTransferStatus(text);
  const transferMethodLabel = parseTransferMethod(lines);
  const adminFee = parseAdminFee(lines);
  const isQris = /\bqris\b/i.test(text);
  const merchantName = isQris ? (recipientName ?? extractLabelledName(lines, ["nama merchant", "merchant", "nama toko", "toko"])) : null;
  const category = categoryFor(kind, text);
  const suggestedNote = merchantName
    ? `${isQris ? "Pembayaran QRIS" : "Pembayaran"} kepada ${merchantName}${category !== "Lainnya" ? ` · kategori saran ${category}` : ""}`
    : kind === "transfer" && recipientName
      ? `Transfer${transferStatus === "succeeded" ? " berhasil" : ""} kepada ${recipientName}${transactionPurpose ? ` · ${transactionPurpose}` : ""}; periksa hasil sebelum menyimpan.`
      : "Bukti dibaca melalui OCR online; periksa hasil sebelum menyimpan.";
  const { transactionDate, transactionTime } = detectDateTime(lines);
  const evidence: TransactionEvidence = {
    paymentMethod: isQris ? "qris" : sourceBankName || destinationBankName || senderAccount.display || recipientAccount.display || transferStatus !== "unknown" ? "bank_transfer" : "unknown",
    transferStatus: kind === "transfer" ? transferStatus : undefined,
    transferMethodLabel: kind === "transfer" ? transferMethodLabel ?? undefined : undefined,
    sourceBankName: sourceBankName ?? undefined,
    destinationBankName: destinationBankName ?? undefined,
    senderAccountName: senderName ?? undefined,
    recipientAccountName: recipientName ?? undefined,
    senderAccountNumber: senderAccount.number ?? undefined,
    recipientAccountNumber: recipientAccount.number ?? undefined,
    senderAccountDisplay: senderAccount.display ?? undefined,
    recipientAccountDisplay: recipientAccount.display ?? undefined,
    referenceNumber: referenceNumber ?? undefined,
    transactionPurpose: transactionPurpose ?? undefined,
    sequenceNumber: sequenceNumber ?? undefined,
    merchantName: merchantName ?? undefined,
    adminFeeAmount: kind === "transfer" ? adminFee.amount ?? undefined : undefined,
    adminFeeWaived: kind === "transfer" && adminFee.waived ? true : undefined,
    totalAmount: totalAmount ?? undefined,
    classificationBasis: "ocr_text",
  };
  const evidenceCount = [amount, senderName, recipientName, senderAccount.display, recipientAccount.display, referenceNumber, transactionPurpose, transactionDate, transactionTime, transferStatus !== "unknown"].filter(Boolean).length;
  return {
    kind,
    amount,
    category,
    note: suggestedNote,
    senderName,
    recipientName,
    occurredAt: null,
    transactionDate,
    transactionTime,
    sourceHint: senderName,
    destinationHint: recipientName,
    evidence,
    confidence: Math.min(0.9, 0.2 + evidenceCount * 0.1),
    needsReview: true,
    provider: "ocr_space",
  };
}

export async function analyzeReceiptWithOcrSpace(imageDataUrl: string): Promise<ReceiptOcrFallback> {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) throw new Error("OCR_SPACE_API_KEY belum tersedia.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const body = new URLSearchParams({
      base64Image: imageDataUrl,
      language: "auto",
      isOverlayRequired: "false",
      OCREngine: "2",
      scale: "true",
      isTable: "true",
    });
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`OCR.Space gagal (${response.status}).`);
    const payload = await response.json() as { IsErroredOnProcessing?: boolean; ErrorMessage?: string | string[]; ParsedResults?: { ParsedText?: string | null }[] };
    if (payload.IsErroredOnProcessing) throw new Error(Array.isArray(payload.ErrorMessage) ? payload.ErrorMessage.join("; ") : payload.ErrorMessage || "OCR.Space tidak dapat membaca bukti.");
    const parsedText = payload.ParsedResults?.map((item) => item.ParsedText || "").join("\n").trim();
    if (!parsedText) throw new Error("OCR.Space tidak menemukan teks pada bukti.");
    return parseReceiptOcrText(parsedText);
  } finally {
    clearTimeout(timeout);
  }
}
