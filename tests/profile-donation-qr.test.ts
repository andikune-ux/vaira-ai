import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

describe("status profil dan donasi QR", () => {
  it("menampilkan cincin foto profil yang mengikuti status jaringan", () => {
    const profile = source("app/(tabs)/profile.tsx");
    expect(profile).toContain("Network.useNetworkState");
    expect(profile).toContain("avatarRing");
    expect(profile).toContain("statusColor");
  });

  it("menampilkan kode QR dan tautan rincian di area donasi", () => {
    const settings = source("app/settings.tsx");
    expect(settings).toContain('require("@/assets/images/donation-qr.png")');
    expect(settings).toContain("Rincian");
    expect(settings).toContain('router.push("/donation-details"');
    expect(fs.existsSync(path.resolve(__dirname, "../assets/images/donation-qr.png"))).toBe(true);
  });

  it("mengarahkan QR publik ke halaman utama lalu membuka Rincian tanpa rute server yang hilang", () => {
    const accounts = source("lib/donation-accounts.ts");
    const layout = source("app/_layout.tsx");
    expect(accounts).toContain("/donasi.html");
    expect(accounts).not.toContain(".manus.space/donation-details");
    expect(layout).toContain('get("open") !== "donation-details"');
    expect(layout).toContain('router.replace("/donation-details"');
  });

  it("menyediakan halaman HTML mandiri yang dapat dibuka pemindai QR tanpa router aplikasi", () => {
    const publicPage = source("public/donasi.html");
    expect(publicPage).toContain("Rincian Donasi V A I R A  A I");
    expect(publicPage).toContain("BANK SINARMAS · Prioritas Utama");
    expect(publicPage).toContain("a.n. Andik");
    expect(publicPage).toContain("navigator.clipboard.writeText");
  });

  it("menyediakan QR kedua untuk membuka aplikasi V A I R A  A I", () => {
    const publicPage = source("public/donasi.html");
    const script = source("scripts/generate-donation-qr.mjs");
    expect(publicPage).toContain("Buka aplikasi V A I R A  A I");
    expect(publicPage).toContain("vaira-ai-app-qr.png");
    expect(publicPage).toContain("manusvairaio://");
    expect(script).toContain('public/vaira-ai-app-qr.png');
    expect(fs.existsSync(path.resolve(__dirname, "../public/vaira-ai-app-qr.png"))).toBe(true);
  });

  it("hanya menampilkan rekening pada halaman Rincian, bukan di bawah QR Profil", () => {
    const profile = source("app/(tabs)/profile.tsx");
    expect(profile).not.toContain("primaryAccount");
    expect(profile).not.toContain("Salin rekening donasi utama");
    expect(profile).not.toContain("DONATION_ACCOUNTS");
  });

  it("menyediakan halaman rincian rekening dengan aksi salin dan Opsi Developer setelah donasi", () => {
    const settings = source("app/settings.tsx");
    const detail = source("app/donation-details.tsx");
    expect(detail).toContain("DONATION_ACCOUNTS");
    expect(detail).toContain("Clipboard.setStringAsync");
    expect(settings.lastIndexOf('title={t("developerOptions")}')).toBeGreaterThan(settings.lastIndexOf('title={t("supportAira")}'));
  });

  it("menyediakan unduhan QR Donasi melalui browser atau galeri perangkat", () => {
    const detail = source("app/donation-details.tsx");
    expect(detail).toContain("Unduh QR Donasi");
    expect(detail).toContain("FileSystem.downloadAsync");
    expect(detail).toContain("MediaLibrary.saveToLibraryAsync");
    expect(detail).toContain('link.download = "QR-Donasi-AiraX.png"');
  });

  it("menyediakan QR layar penuh, status lokasi simpan, dan cetak QR di web", () => {
    const detail = source("app/donation-details.tsx");
    expect(detail).toContain("qrFullscreen");
    expect(detail).toContain("Buka QR Donasi layar penuh");
    expect(detail).toContain("downloadStatus");
    expect(detail).toContain("QR disimpan ke folder Unduhan browser.");
    expect(detail).toContain("Cetak QR Donasi");
    expect(detail).toContain("window.open");
  });

  it("menampilkan pemilik Andik, aksi berbagi QR, dan riwayat konfirmasi yang tidak memproses pembayaran", () => {
    const accounts = source("lib/donation-accounts.ts");
    const detail = source("app/donation-details.tsx");
    const history = source("lib/donation-history.ts");
    expect(accounts).toContain('holder: "Andik"');
    expect(detail).toContain("Bagikan QR Donasi");
    expect(detail).toContain("Riwayat konfirmasi");
    expect(history).toContain("AsyncStorage");
    expect(history).not.toContain("payment");
  });
});
