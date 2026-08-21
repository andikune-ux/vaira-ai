export type CalendarEvent = { date: string; title: string; detail: string; holiday?: boolean; daysOff?: number };

const INDONESIA_EVENTS_2026: CalendarEvent[] = [
  { date: "2026-01-01", title: "Tahun Baru Masehi", detail: "Hari libur nasional", holiday: true },
  { date: "2026-01-16", title: "Isra Mikraj Nabi Muhammad SAW", detail: "Hari libur nasional", holiday: true },
  { date: "2026-02-19", title: "Awal Ramadan 1447 H", detail: "Awal bulan suci Ramadan · mengikuti penetapan resmi" },
  { date: "2026-02-17", title: "Tahun Baru Imlek 2577 Kongzili", detail: "Hari libur nasional", holiday: true },
  { date: "2026-03-19", title: "Hari Suci Nyepi", detail: "Tahun Baru Saka 1948 · hari libur nasional", holiday: true },
  { date: "2026-03-21", title: "Idulfitri 1447 H", detail: "Hari Raya Idulfitri · mengikuti penetapan resmi", holiday: true },
  { date: "2026-04-21", title: "Hari Kartini", detail: "Peringatan nasional" },
  { date: "2026-05-02", title: "Hari Pendidikan Nasional", detail: "Peringatan nasional" },
  { date: "2026-04-03", title: "Wafat Yesus Kristus", detail: "Hari libur nasional", holiday: true },
  { date: "2026-04-05", title: "Paskah", detail: "Hari besar keagamaan", holiday: true },
  { date: "2026-05-01", title: "Hari Buruh Internasional", detail: "Hari libur nasional", holiday: true },
  { date: "2026-05-14", title: "Kenaikan Yesus Kristus", detail: "Hari libur nasional", holiday: true },
  { date: "2026-05-27", title: "Idul Adha 1447 H", detail: "Hari libur nasional", holiday: true },
  { date: "2026-05-31", title: "Hari Raya Waisak 2570 BE", detail: "Hari libur nasional", holiday: true },
  { date: "2026-06-01", title: "Hari Lahir Pancasila", detail: "Hari libur nasional", holiday: true },
  { date: "2026-06-16", title: "Tahun Baru Islam 1448 H", detail: "Hari libur nasional", holiday: true },
  { date: "2026-06-25", title: "10 Muharam / Asyura", detail: "Peringatan Islam · mengikuti penetapan resmi" },
  { date: "2026-08-17", title: "Hari Kemerdekaan Republik Indonesia", detail: "HUT RI ke-81 · hari libur nasional", holiday: true },
  { date: "2026-08-25", title: "Maulid Nabi Muhammad SAW", detail: "Hari libur nasional", holiday: true },
  { date: "2026-10-02", title: "Hari Batik Nasional", detail: "Peringatan budaya Indonesia" },
  { date: "2026-10-28", title: "Hari Sumpah Pemuda", detail: "Peringatan nasional" },
  { date: "2026-11-10", title: "Hari Pahlawan", detail: "Peringatan nasional" },
  { date: "2026-11-25", title: "Hari Guru Nasional", detail: "Peringatan nasional" },
  { date: "2026-12-22", title: "Hari Ibu", detail: "Peringatan nasional" },
  { date: "2026-12-25", title: "Hari Raya Natal", detail: "Hari libur nasional", holiday: true },
];

const pad = (value: number) => String(value).padStart(2, "0");
export const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const getCalendarEvent = (date: Date) => INDONESIA_EVENTS_2026.find((event) => event.date === dateKey(date));
export const getCalendarEvents = (year: number, month: number) => INDONESIA_EVENTS_2026.filter((event) => event.date.startsWith(`${year}-${pad(month + 1)}`));
export const monthLabel = (date: Date) => date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
export const dayLabel = (date: Date) => date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const calendarDayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const getMonthCells = (date: Date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const total = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return [...Array(first.getDay()).fill(null), ...Array.from({ length: total }, (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1))];
};
const calendarOrdinal = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
const parseLocalDate = (value: string) => { const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day); };
export const getUpcomingEvent = (from = new Date()) => INDONESIA_EVENTS_2026.map((event) => ({ ...event, dateObject: parseLocalDate(event.date) })).filter((event) => calendarOrdinal(event.dateObject) >= calendarOrdinal(from)).sort((left, right) => left.dateObject.getTime() - right.dateObject.getTime())[0];
export const getDaysUntilEvent = (event: { dateObject: Date }, from = new Date()) => Math.max(0, Math.round((calendarOrdinal(event.dateObject) - calendarOrdinal(from)) / 86400000));
export const getUpcomingEventPrompt = (event: { title: string; dateObject: Date }, from = new Date()) => { const days = getDaysUntilEvent(event, from); if (days === 0) return `Hari ini ${event.title}. Mau dibuatkan kartu ucapan?`; if (days === 1) return `Besok ${event.title}. Mau dibuatkan kartu ucapan?`; return `${days} hari lagi ${event.title}. Mau dibuatkan kartu ucapan?`; };
