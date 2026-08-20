type ErrorLike = { message?: unknown; data?: { message?: unknown; code?: unknown }; shape?: { message?: unknown } };

export function getUserFacingError(error: unknown, fallback = "Terjadi kendala. Periksa data dan koneksi Anda, lalu coba lagi.") {
  const value = error as ErrorLike | null;
  const raw = [value?.data?.message, value?.shape?.message, value?.message].find((item): item is string => typeof item === "string")?.trim() ?? "";
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text || /^(undefined|null|error|internal server error|bad request|unauthorized|forbidden|not found)$/i.test(text)) return fallback;
  if (/invalid.*(username|id)|username.*invalid|format.*username/i.test(text)) return "Username tidak valid. Gunakan 3–40 karakter berupa huruf kecil, angka, titik, garis bawah, atau tanda hubung.";
  if (/invalid.*(public.?id|id publik)|public.?id.*invalid|id.*(9|12).*digit/i.test(text)) return "ID publik tidak valid. Gunakan angka dengan panjang 9–12 digit.";
  if (/email.*invalid|invalid.*email|email.*valid/i.test(text)) return "Format email belum benar. Periksa kembali alamat email Anda.";
  if (/phone|whatsapp|nomor.*valid|invalid.*number/i.test(text)) return "Nomor WhatsApp tidak valid. Masukkan nomor dengan kode negara, misalnya +62.";
  if (/password|kata sandi|sandi/i.test(text)) return "Kata sandi tidak sesuai atau belum memenuhi aturan. Periksa kembali lalu coba lagi.";
  if (/administrator|verifikasi.*admin/i.test(text)) return "Verifikasi Administrator gagal. Periksa username dan kata sandi Administrator.";
  if (/token.*(valid|kadaluarsa|digunakan)/i.test(text)) return "Token tidak dapat digunakan. Periksa kode token atau minta token baru kepada Administrator.";
  if (/koneksi|network|fetch|timeout|server/i.test(text)) return "Server atau koneksi sedang bermasalah. Periksa internet lalu coba lagi.";
  if (/akun.*tidak ditemukan|account.*not found/i.test(text)) return "Akun tidak ditemukan. Periksa ID atau username yang dimasukkan.";
  if (/sudah digunakan|already|conflict|duplicate/i.test(text)) return "Data tersebut sudah digunakan akun lain. Gunakan nilai yang berbeda.";
  if (/persetujuan|consent|room global/i.test(text)) return "Syarat Room Global belum terpenuhi. Periksa persetujuan dan status akun Anda.";
  if (/^[{}\[\]":,\s\w.-]+$/.test(text) && /code|message|path|input|issues/i.test(text)) return fallback;
  return text.length > 220 ? fallback : text;
}

export function getFriendlyValidationError(field: "username" | "publicId" | "email" | "phone" | "password") {
  return {
    username: "Username harus 3–40 karakter: huruf kecil, angka, titik, garis bawah, atau tanda hubung.",
    publicId: "ID publik harus berupa angka sepanjang 9–12 digit.",
    email: "Masukkan alamat email yang benar.",
    phone: "Masukkan nomor WhatsApp yang benar, misalnya +62xxxxxxxxxx.",
    password: "Kata sandi harus diisi sesuai aturan keamanan.",
  }[field];
}
