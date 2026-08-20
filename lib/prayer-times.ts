export type PrayerKey = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export type PrayerTime = {
  key: PrayerKey;
  label: "Subuh" | "Dzuhur" | "Ashar" | "Maghrib" | "Isya";
  time: string;
  date: Date;
};

type AladhanResponse = {
  data?: {
    timings?: Partial<Record<PrayerKey, string>>;
  };
};

const labels: Record<PrayerKey, PrayerTime["label"]> = {
  Fajr: "Subuh",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya",
};

const parseClock = (value: string) => value.replace(/\s*\(.+\)\s*/g, "").trim();

export async function fetchPrayerTimes(latitude: number, longitude: number, date = new Date(), method = 20) {
  const dateLabel = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  const url = `https://api.aladhan.com/v1/timings/${dateLabel}?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&method=${encodeURIComponent(method)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Jadwal salat tidak dapat dimuat dari layanan waktu salat.");
  const payload = await response.json() as AladhanResponse;
  const timings = payload.data?.timings;
  if (!timings) throw new Error("Layanan waktu salat tidak mengirim jadwal yang lengkap.");
  const keys: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  return keys.map((key) => {
    const time = parseClock(timings[key] ?? "");
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) throw new Error("Format jadwal salat tidak dikenali.");
    const eventDate = new Date(date);
    eventDate.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return { key, label: labels[key], time, date: eventDate };
  });
}

export function getNextPrayer(items: PrayerTime[], now = new Date()) {
  return items.find((item) => item.date.getTime() > now.getTime()) ?? null;
}
