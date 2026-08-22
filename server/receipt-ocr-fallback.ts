export type ReceiptOcrFallback = {
  kind: "income" | "expense" | "transfer";
  amount: number | null;
  category: string;
  note: string;
  senderName: string | null;
  recipientName: string | null;
  occurredAt: null;
  sourceHint: string | null;
  destinationHint: string | null;
  confidence: number;
  needsReview: true;
  provider: "ocr_space";
};

const amountFromText = (value: string) => {
  const normalized = value.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
};

const extractLabelledName = (lines: string[], labels: string[]) => {
  const labelPattern = labels.map((label) => label.replace(/\s+/g, "\\s+")).join("|");
  const matcher = new RegExp(`^(?:${labelPattern})\\s*[:\\-]?\\s*(.+)$`, "i");
  const candidate = lines.map((line) => line.match(matcher)?.[1]?.trim() || "").find(Boolean);
  if (!candidate || /\b(?:rp|idr|nominal|jumlah|total|tanggal|waktu|ref(?:erensi)?)\b/i.test(candidate)) return null;
  return candidate.replace(/\s+/g, " ").slice(0, 120) || null;
};

export function parseReceiptOcrText(text: string): ReceiptOcrFallback {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const labelledAmount = lines
    .filter((line) => /\b(total|jumlah|nominal|dibayar|total transfer|nilai transfer|debit|kredit)\b/i.test(line))
    .map(amountFromText)
    .find((value): value is number => value !== null);
  const currencyAmounts = lines
    .flatMap((line) => Array.from(line.matchAll(/(?:rp|idr)\s*([0-9][0-9.,]*)/gi)).map((match) => amountFromText(match[1])))
    .filter((value): value is number => value !== null);
  const amount = labelledAmount ?? currencyAmounts.sort((first, second) => second - first)[0] ?? null;
  const senderName = extractLabelledName(lines, ["nama pengirim", "pengirim", "sender", "dari"]);
  const recipientName = extractLabelledName(lines, ["nama penerima", "penerima", "tujuan", "kepada", "merchant", "payee"]);
  const isIncoming = /\b(uang masuk|dana masuk|saldo bertambah|kredit|penerimaan|diterima|received|setoran|deposit|top up)\b/i.test(text);
  const isTransfer = !isIncoming && /\b(transfer|rekening|bank|e-wallet|gopay|dana|ovo|shopeepay)\b/i.test(text);
  const kind = isIncoming ? "income" as const : isTransfer ? "transfer" as const : "expense" as const;
  return {
    kind,
    amount,
    category: kind === "income" ? "Pemasukan lainnya" : kind === "transfer" ? "Transfer dana" : "Lainnya",
    note: "Bukti dibaca melalui OCR online; periksa kembali sebelum menyimpan.",
    senderName,
    recipientName,
    occurredAt: null,
    sourceHint: senderName,
    destinationHint: recipientName,
    confidence: amount ? 0.58 : 0.2,
    needsReview: true,
    provider: "ocr_space",
  };
}

export async function analyzeReceiptWithOcrSpace(imageDataUrl: string): Promise<ReceiptOcrFallback> {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) throw new Error("OCR_SPACE_API_KEY belum tersedia.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);
  try {
    const body = new URLSearchParams({
      base64Image: imageDataUrl,
      language: "auto",
      isOverlayRequired: "false",
      OCREngine: "2",
      scale: "true",
    });
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`OCR.Space gagal (${response.status}).`);
    const payload = await response.json() as { IsErroredOnProcessing?: boolean; ErrorMessage?: string | string[]; ParsedResults?: Array<{ ParsedText?: string | null }> };
    if (payload.IsErroredOnProcessing) throw new Error(Array.isArray(payload.ErrorMessage) ? payload.ErrorMessage.join("; ") : payload.ErrorMessage || "OCR.Space tidak dapat membaca bukti.");
    const parsedText = payload.ParsedResults?.map((item) => item.ParsedText || "").join("\n").trim();
    if (!parsedText) throw new Error("OCR.Space tidak menemukan teks pada bukti.");
    return parseReceiptOcrText(parsedText);
  } finally {
    clearTimeout(timeout);
  }
}
