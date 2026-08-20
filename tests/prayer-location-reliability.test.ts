import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.resolve(__dirname, "..", "app/prayer-times.tsx"), "utf8");
const config = fs.readFileSync(path.resolve(__dirname, "..", "app.config.ts"), "utf8");

describe("keandalan lokasi waktu salat", () => {
  it("membatasi pencarian lokasi presisi dan pemeriksaan layanan", () => {
    expect(source).toContain("const LOCATION_TIMEOUT_MS = 60_000");
    expect(source).toContain("withTimeout(Location.requestForegroundPermissionsAsync()")
    expect(source).toContain("withTimeout(Location.hasServicesEnabledAsync(), 3_000");
    expect(source).toContain("withTimeout(Location.getCurrentPositionAsync");
    expect(source).toContain("locationSearchLabel");
    expect(source).toContain("/60 dtk");
  });

  it("memastikan build Android meminta lokasi presisi dan mendiagnosis provider GPS", () => {
    expect(config).toContain("ACCESS_COARSE_LOCATION");
    expect(config).toContain("ACCESS_FINE_LOCATION");
    expect(config).toContain("expo-location");
    expect(source).toContain("Location.getProviderStatusAsync");
    expect(source).toContain("provider?.gpsAvailable === false");
    expect(source).toContain("provider?.networkAvailable === false");
  });

  it("memakai lokasi terakhir ketika GPS presisi tidak merespons", () => {
    expect(source).toContain("Location.getLastKnownPositionAsync");
    expect(source).toContain("LAST_KNOWN_MAX_AGE_MS");
    expect(source).toContain("Jadwal dimuat dari lokasi terakhir perangkat");
  });

  it("menyediakan lokasi manual, metadata sumber, dan cache jadwal", () => {
    expect(source).toContain("MANUAL_LOCATIONS");
    expect(source).toContain("Pilih lokasi manual");
    expect(source).toContain("AsyncStorage.setItem(prayerCacheKey");
    expect(source).toContain("locationSource === \"gps\"");
    expect(source).toContain("Sinkron terakhir");
  });

  it("menginvalidasi cache saat metode atau zona waktu berubah dan memeriksa akurasi", () => {
    expect(source).toContain("savedPrayerLocation.timezone === Intl.DateTimeFormat().resolvedOptions().timeZone");
    expect(source).toContain("savedPrayerLocation.calculationMethod ?? calculationMethod");
    expect(source).toContain("accuracy > 1_000");
    expect(source).toContain("CALCULATION_METHODS");
    expect(source).toContain("Kementerian Agama Indonesia");
  });

  it("menampilkan status gagal yang jelas dan selalu mengakhiri loading", () => {
    expect(source).toContain("const [locationError, setLocationError]");
    expect(source).toContain("setLocationError(message)");
    expect(source).toContain("finally { setIsLoading(false); }");
    expect(source).toContain('title={locationError ? "Lokasi belum siap" : "Jadwal belum tersedia"}');
  });
});
