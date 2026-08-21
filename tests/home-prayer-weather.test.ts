import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (filePath: string) => fs.readFileSync(path.resolve(process.cwd(), filePath), "utf8");
const home = read("app/(tabs)/index.tsx");
const prayerTimes = read("app/prayer-times.tsx");
const preferences = read("lib/finance/types.ts");
const weather = read("components/aira-mode-status-card.tsx");

describe("Waktu Salat dan cuaca Beranda", () => {
  it("menyimpan tampilan Waktu Salat aktif secara default dan menyediakan sakelar pengaturan", () => {
    expect(preferences).toContain("prayerTimesVisible: true");
    expect(prayerTimes).toContain("prayerTimesVisible");
    expect(home).toContain("prayerTimesVisible");
  });

  it("menampilkan countdown salat berikutnya pada kartu ucapan", () => {
    expect(home).toContain("nextPrayer");
    expect(home).toContain("prayerCountdown");
  });

  it("menampilkan suhu, salat, dan pengingat sebagai kartu utama yang dapat dikendalikan", () => {
    expect(weather).toContain("api.open-meteo.com/v1/forecast");
    expect(weather).toContain("temperature_2m,apparent_temperature,weather_code");
    expect(weather).toContain('type HeroCardKind = "aira" | "greeting" | "reminder" | "prayer" | "weather"');
    expect(weather).toContain('if (showAira) list.push("aira")');
    expect(weather).toContain('if (showGreeting) list.push("greeting")');
    expect(weather).toContain('kind === "reminder"');
    expect(weather).toContain('kind === "prayer"');
    expect(weather).toContain('kind === "weather"');
    expect(weather).toContain("CUACA HARI INI");
    expect(weather).toContain("setCardIndex");
    expect(weather).toContain("advanceCard");
    expect(weather).toContain("pauseUntil");
    expect(weather).toContain("refreshWeather");
    expect(weather).toContain("PENGINGAT MENDEKAT");
    expect(weather).toContain("agendaToday");
    expect(weather).toContain("loadCalendarReminders");
  });

  it("menyediakan editor, animasi, simpan, dan berbagi kartu ucapan", () => {
    expect(weather).toContain("Edit kartu ucapan");
    expect(weather).toContain("setMessageDraft");
    expect(weather).toContain("greetingMotion");
    expect(weather).toContain("captureRef(greetingPreviewRef");
    expect(weather).toContain("MediaLibrary.saveToLibraryAsync");
    expect(weather).toContain("Sharing.shareAsync");
  });

  it("menyediakan sakelar lima kartu rotasi pada Pengaturan Profil", () => {
    const profileSettings = read("app/profile-settings.tsx");
    expect(profileSettings).toContain("Kartu rotasi Beranda");
    expect(profileSettings).toContain("showAiraHeroCard");
    expect(profileSettings).toContain("showGreetingHeroCard");
    expect(profileSettings).toContain("showReminderHeroCard");
    expect(profileSettings).toContain("showPrayerHeroCard");
    expect(profileSettings).toContain("showWeatherHeroCard");
  });
});
