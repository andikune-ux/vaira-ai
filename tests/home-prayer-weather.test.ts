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

  it("menampilkan suhu dan salat berikutnya sebagai kartu utama yang bergiliran", () => {
    expect(weather).toContain("api.open-meteo.com/v1/forecast");
    expect(weather).toContain("temperature_2m,apparent_temperature,weather_code");
    expect(weather).toContain('type HeroCardKind = "aira" | "greeting" | "prayer" | "weather"');
    expect(weather).toContain('"aira", "greeting"');
    expect(weather).toContain('kind === "prayer"');
    expect(weather).toContain('kind === "weather"');
    expect(weather).toContain("CUACA HARI INI");
    expect(weather).toContain("setCardIndex");
  });
});
