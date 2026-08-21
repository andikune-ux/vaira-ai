import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

describe("Kalender dan kartu dinamis Beranda", () => {
  it("menyediakan kalender real-time dengan event hari besar dan pengingat manual", async () => {
    const finance = await readFile("app/(tabs)/finance.tsx", "utf8");
    const calendar = await readFile("lib/calendar-data.ts", "utf8");
    const reminders = await readFile("lib/calendar-reminders.ts", "utf8");
    expect(finance).toContain("Buka kalender real-time");
    expect(finance).toContain("Pengingat manual");
    expect(finance).toContain("Simpan pengingat");
    expect(calendar).toContain("Hari Kemerdekaan Republik Indonesia");
    expect(calendar).toContain("getMonthCells");
    expect(reminders).toContain("scheduleNotificationAsync");
    expect(reminders).toContain("saveCalendarReminders");
  });

  it("memutar kartu Aira dan kartu ucapan serta menyediakan berbagi gambar offline", async () => {
    const home = await readFile("app/(tabs)/index.tsx", "utf8");
    expect(home).toContain("heroCardMode");
    expect(home).toContain("setInterval(toggleHeroCard, greetingCardIntervalSeconds * 1000)");
    expect(home).toContain("setGreetingPreviewVisible(true)");
    expect(home).toContain("shareGreetingCard");
    expect(home).toContain("captureRef");
    expect(home).toContain("Pratinjau kartu ucapan");
    expect(home).toContain("Simpan");
    expect(home).toContain("Bagikan");
    expect(home).toContain("MediaLibrary.saveToLibraryAsync");
    expect(home).toContain("Buat kartu ucapan offline");
  });

  it("menyediakan pengaturan developer kartu ucapan", async () => {
    const types = await readFile("lib/finance/types.ts", "utf8");
    const financeContext = await readFile("lib/finance/finance-context.tsx", "utf8");
    const developer = await readFile("app/developer-studio.tsx", "utf8");
    expect(types).toContain("greetingCardEnabled: true");
    expect(types).toContain("greetingCardIntervalSeconds: 10");
    expect(types).toContain('greetingCardAnimation: "slide"');
    expect(types).toContain('greetingCardShareFormat: "story"');
    expect(types).toContain('greetingCardTemplate: "royal"');
    expect(types).toContain('greetingCardEffect: "text"');
    expect(developer).toContain("Buka pengaturan kartu ucapan");
    expect(developer).toContain("minimumValue={5} maximumValue={60}");
    expect(developer).toContain("Teks saja");
    expect(developer).toContain("Seluruh kartu");
    expect(developer.match(/Pilih animasi/g)?.length).toBeGreaterThan(0);
    expect(developer).toContain("blur");
    expect(developer).toContain("Animasi acak kartu ucapan");
    expect(developer).toContain('value: "random"');
    expect(types).toContain('"random"');
    expect(financeContext).toContain('"random"');
    expect(developer).toContain("Pratinjau langsung");
    expect(developer).toContain("Persegi 1:1");
    expect(developer).toContain("Story 9:16");
    expect(developer).toContain("Royal Gold");
    expect(developer).toContain("Champagne Luxe");
    expect(developer).toContain("Midnight Velvet");
    expect(developer).toContain("Pearl Ivory");
  });

  it("menyediakan sakelar Profil untuk menyembunyikan Waktu Salat dari Aksi Cepat dan kartu Aira", async () => {
    const profile = await readFile("app/profile-settings.tsx", "utf8");
    const home = await readFile("app/(tabs)/index.tsx", "utf8");
    const signalCard = await readFile("components/aira-mode-status-card.tsx", "utf8");
    expect(profile).toContain("Waktu Salat di Beranda");
    expect(profile).toContain("prayerTimesVisible");
    expect(home).toContain('action.id !== "prayer"');
    expect(signalCard).toContain("showPrayer");
  });

  it("menyediakan hitung mundur event dan tawaran kartu", async () => {
    const calendar = await readFile("lib/calendar-data.ts", "utf8");
    const home = await readFile("app/(tabs)/index.tsx", "utf8");
    expect(calendar).toContain("getDaysUntilEvent");
    expect(calendar).toContain("getUpcomingEventPrompt");
    expect(home).toContain("upcomingEventDays");
    expect(home).toContain("greetingPrompt");
    expect(home).toContain("9:16");
    expect(home).toContain("greetingTemplateStyle");
    expect(home).toContain("greetingPreviewCard");
    expect(home).toContain("includes(\"fitri\")");
    expect(home).toContain("includes(\"kemerdekaan\")");
    expect(home).toContain("ketupat");
    expect(home).toContain("MERDEKA");
  });
});
