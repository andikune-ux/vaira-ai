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

const isAccountNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 24;
};

const bankNames = ["BCA", "BRI", "BNI", "MANDIRI", "BTN", "BSI", "CIMB", "PERMATA", "DANAMON", "JAGO", "SEABANK", "NEO", "BLU", "OVO", "DANA", "GOPAY", "SHOPEEPAY", "LINKAJA"];

const detectBank = (value: string) => {
  const uppercase = value.toUpperCase();
  return bankNames.find((bank) => new RegExp(`\\b${bank}\\b`, "i").test(uppercase)) ?? null;
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
  const source = ymd ? { year: Number(ymd[1]), month: Number(ymd[2]), day: Number(ymd[3]) } : dmy ? { day: Number(dmy[1]), month: Number(dmy[2]), year: dmy[3].length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3]) } : null;
  if (!source) return null;
  const candidate = new Date(source.year, source.month - 1, source.day);
  if (candidate.getFullYear() !== source.year || candidate.getMonth() !== source.month - 1 || candidate.getDate() !== source.day) return null;
  return `${pad(source.day)}-${pad(source.month)}-${source.year}`;
};

const parseTime = (text: string) => {
  const colon = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/);
  const dottedAfterJam = text.match(/\b(?:jam|pukul|time)\s*[:\-]?\s*([01]?\d|2[0-3])\.([0-5]\d)\b/i);
  const source = colon ?? dottedAfterJam;
  if (!source) return null;
  return `${pad(Number(source[1]))}:${source[2]}`;
};

const detectDateTime = (lines: string[]) => {
  const joined = lines.join("\n");
  return { transactionDate: parseDate(joined), transactionTime: parseTime(joined) };
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
  const amount = findAmount(lines);
  const senderName = extractLabelledName(lines, ["nama pengirim", "nama rekening pengirim", "pengirim", "sender", "dari", "asal dana"]);
  const recipientName = extractLabelledName(lines, ["nama penerima", "nama rekening penerima", "penerima", "tujuan", "kepada", "merchant", "payee", "untuk"]);
  const senderAccountNumber = extractLabelledValue(lines, ["no rekening pengirim", "rekening pengirim", "nomor rekening pengirim", "account sender", "a/n pengirim"], isAccountNumber)?.replace(/\D/g, "") ?? null;
  const recipientAccountNumber = extractLabelledValue(lines, ["no rekening penerima", "rekening penerima", "nomor rekening penerima", "account recipient", "a/n penerima"], isAccountNumber)?.replace(/\D/g, "") ?? null;
  const sourceBankName = extractLabelledValue(lines, ["bank pengirim", "bank asal", "dari bank", "source bank"], (value) => Boolean(detectBank(value))) ?? detectBank(senderName ?? "") ?? null;
  const destinationBankName = extractLabelledValue(lines, ["bank penerima", "bank tujuan", "tujuan bank", "destination bank"], (value) => Boolean(detectBank(value))) ?? detectBank(recipientName ?? "") ?? null;
  const referenceNumber = extractLabelledValue(lines, ["id transaksi", "id trx", "nomor referensi", "no referensi", "ref", "reference", "kode transaksi"], (value) => /^[A-Za-z0-9._/\- ]{4,80}$/.test(value)) ?? null;
  const isQris = /\bqris\b/i.test(text);
  const merchantName = isQris ? (recipientName ?? extractLabelledName(lines, ["nama merchant", "merchant", "nama toko", "toko"])) : null;
  const category = categoryFor(kind, text);
  const suggestedNote = merchantName
    ? `${isQris ? "Pembayaran QRIS" : "Pembayaran"} kepada ${merchantName}${category !== "Lainnya" ? ` · kategori saran ${category}` : ""}`
    : `Bukti dibaca melalui OCR online${referenceNumber ? ` · referensi ${referenceNumber}` : ""}; periksa hasil sebelum menyimpan.`;
  const { transactionDate, transactionTime } = detectDateTime(lines);
  const evidence: TransactionEvidence = {
    paymentMethod: isQris ? "qris" : sourceBankName || destinationBankName || senderAccountNumber || recipientAccountNumber ? "bank_transfer" : "unknown",
    sourceBankName: sourceBankName ?? undefined,
    destinationBankName: destinationBankName ?? undefined,
    senderAccountName: senderName ?? undefined,
    recipientAccountName: recipientName ?? undefined,
    senderAccountNumber: senderAccountNumber ?? undefined,
    recipientAccountNumber: recipientAccountNumber ?? undefined,
    referenceNumber: referenceNumber ?? undefined,
    merchantName: merchantName ?? undefined,
    classificationBasis: "ocr_text",
  };
  const evidenceCount = [amount, senderName, recipientName, senderAccountNumber, recipientAccountNumber, referenceNumber, transactionDate, transactionTime].filter(Boolean).length;
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
    confidence: Math.min(0.9, 0.2 + evidenceCount * 0.14),
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
