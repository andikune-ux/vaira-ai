import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { calculateQiblaBearing, normalizeDegrees, shortestAngleDelta } from "../lib/qibla";

const prayerScreen = readFileSync(resolve(process.cwd(), "app/prayer-times.tsx"), "utf8");
const compassScreen = readFileSync(resolve(process.cwd(), "app/qibla-compass.tsx"), "utf8");

describe("kompas arah kiblat", () => {
  it("menghitung bearing yang valid menuju Ka'bah", () => {
    const bearing = calculateQiblaBearing(-6.2088, 106.8456);
    expect(bearing).toBeGreaterThan(290);
    expect(bearing).toBeLessThan(301);
    expect(normalizeDegrees(bearing)).toBe(bearing);
  });

  it("menormalkan rotasi dan memilih delta sudut terpendek", () => {
    expect(normalizeDegrees(-10)).toBe(350);
    expect(shortestAngleDelta(5, 355)).toBe(10);
    expect(shortestAngleDelta(355, 5)).toBe(-10);
  });

  it("memiliki tombol pembuka kompas dan tombol Oke untuk kembali", () => {
    expect(prayerScreen).toContain('pathname: "/qibla-compass"');
    expect(prayerScreen).toContain("Buka kompas arah kiblat");
    expect(compassScreen).toContain('accessibilityLabel="Oke, kembali ke waktu salat"');
    expect(compassScreen).toContain("router.back()");
    expect(compassScreen).toContain("watchHeadingAsync");
    expect(compassScreen).toContain("Ka'bah · Makkah al-Mukarramah");
    expect(compassScreen).toContain("qiblaHalo");
    expect(compassScreen).toContain("sensorGuidance");
  });
});
