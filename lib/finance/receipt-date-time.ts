const pad = (value: number) => String(value).padStart(2, "0");

export function formatReceiptDate(date = new Date()) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

export function formatReceiptTime(date = new Date()) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function normalizeReceiptDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

export function normalizeReceiptTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function receiptDateTimeFromIso(iso: string) {
  const date = new Date(iso);
  return { date: formatReceiptDate(date), time: formatReceiptTime(date) };
}

export function receiptDateTimeToIso(dateInput: string, timeInput: string, fallback = new Date()) {
  const dateMatch = dateInput.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  const timeMatch = timeInput.match(/^(\d{2}):(\d{2})$/);
  const day = dateMatch ? Number(dateMatch[1]) : fallback.getDate();
  const month = dateMatch ? Number(dateMatch[2]) - 1 : fallback.getMonth();
  const year = dateMatch ? Number(dateMatch[3]) : fallback.getFullYear();
  const hour = timeMatch ? Number(timeMatch[1]) : fallback.getHours();
  const minute = timeMatch ? Number(timeMatch[2]) : fallback.getMinutes();
  const candidate = new Date(year, month, day, hour, minute, 0, 0);
  const validDate = candidate.getFullYear() === year && candidate.getMonth() === month && candidate.getDate() === day;
  const validTime = hour >= 0 && hour < 24 && minute >= 0 && minute < 60;
  return validDate && validTime ? candidate.toISOString() : fallback.toISOString();
}
