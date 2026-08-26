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

export function isReceiptDateTimeInputValid(dateInput: string, timeInput: string) {
  const dateMatch = dateInput.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  const timeMatch = timeInput.match(/^(\d{2}):(\d{2})$/);
  if (!dateMatch || !timeMatch) return false;
  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]) - 1;
  const year = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const candidate = new Date(year, month, day, hour, minute, 0, 0);
  return candidate.getFullYear() === year && candidate.getMonth() === month && candidate.getDate() === day && hour >= 0 && hour < 24 && minute >= 0 && minute < 60;
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
  return isReceiptDateTimeInputValid(dateInput, timeInput) ? candidate.toISOString() : fallback.toISOString();
}
