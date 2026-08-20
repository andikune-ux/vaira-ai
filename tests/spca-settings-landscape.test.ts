import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

describe("pusat Robot SPCA dan tata letak landscape", () => {
  it("menyediakan halaman tunggal untuk pengaturan Robot SPCA dan riwayat patroli", () => {
    const settings = source("app/spca-settings.tsx");
    const developer = source("app/developer-studio.tsx");
    expect(settings).toContain("Simpan pengaturan Robot SPCA");
    expect(settings).toContain("Batas kemunculan per sesi");
    expect(settings).toContain("Riwayat patroli lokal");
    expect(settings).toContain("Patroli pasif saat robot utama mati");
    expect(developer).toContain("Buka menu Robot SPCA");
    expect(developer).toContain('router.push("/spca-settings" as never)');
  });

  it("membatasi kemunculan per sesi dan merekam peristiwa lokal tanpa data layar", () => {
    const overlay = source("components/spca-overlay.tsx");
    const history = source("lib/spca-passive-history.ts");
    const extra = source("lib/spca-extra-settings.ts");
    expect(overlay).toContain("appearanceCount.current >= sessionLimit");
    expect(overlay).toContain('recordSpcaPassiveHistory("appearance"');
    expect(overlay).toContain('next >= 4 ? "evasion" : "tap"');
    expect(history).toContain("HISTORY_KEY");
    expect(extra).toContain("passiveMaxAppearances");
  });

  it("mengaktifkan mode landscape dan portrait secara manual dari Profil", () => {
    const settings = source("app/settings.tsx");
    const home = source("app/(tabs)/index.tsx");
    const extra = source("lib/spca-extra-settings.ts");
    expect(settings).toContain("Mode tampilan");
    expect(settings).toContain("changeManualOrientation");
    expect(settings).toContain("ScreenOrientation.lockAsync");
    expect(home).toContain("manualOrientation");
    expect(home).toContain("topBarLandscape");
    expect(home).toContain("columns={isLandscape ? 6 : 3}");
    expect(extra).toContain('manualOrientation: "portrait"');
  });

  it("mempertahankan patroli pasif hingga satu jam, mengelak tanpa pergi, dan memakai ekspresi layar wajah", () => {
    const settings = source("app/spca-settings.tsx");
    const overlay = source("components/spca-overlay.tsx");
    expect(settings).toContain("maximum={3600}");
    expect(settings).toContain("formatPatrolDuration");
    expect(overlay).toContain("Robot menampilkan gelembung, menunggu agar terbaca, lalu mengelak sebelum melanjutkan patroli");
    expect(overlay).toContain("evasionAnimation.current = Animated.sequence");
    expect(overlay).toContain("bubbleResumeTimer");
    expect(overlay).toContain("Ketukan ${next}: Robot menampilkan gelembung");
    expect(overlay).toContain("setEvasive(false)");
    expect(overlay).toContain("faceBrows");
    expect(overlay).toContain("faceEyes");
    expect(overlay).toContain("faceMouth");
  });

  it("menunggu jeda sejak layar dibuka lalu mengintip dari kanan bawah sebelum berpatroli aktif", () => {
    const overlay = source("components/spca-overlay.tsx");
    expect(overlay).toContain("const first = setTimeout(appear, intervalSeconds * 1000)");
    expect(overlay).toContain("right: -38");
    expect(overlay).toContain("Animated.delay(260)");
    expect(overlay).toContain("}, 1500);");
    expect(overlay).toContain("setBubble(null);");
    expect(overlay).toContain("startPatrol");
    expect(overlay).toContain("visibleRef.current");
  });

  it("menggunakan gelembung lebar yang mudah dibaca selama patroli pasif", () => {
    const overlay = source("components/spca-overlay.tsx");
    expect(overlay).toContain("width: 224");
    expect(overlay).toContain("lineHeight: 17");
    expect(overlay).toContain("textAlign: \"left\"");
  });

  it("menampilkan jejak radar tipis yang berdenyut selama patroli pasif", () => {
    const overlay = source("components/spca-overlay.tsx");
    expect(overlay).toContain("radarTrail");
    expect(overlay).toContain("radarTrailInner");
    expect(overlay).toContain("duration: 1550");
    expect(overlay).toContain("borderColor: `${radarColor}D0`");
  });

  it("menyimpan warna dan sakelar jejak radar dari halaman Robot SPCA", () => {
    const settings = source("app/spca-settings.tsx");
    const overlay = source("components/spca-overlay.tsx");
    const extra = source("lib/spca-extra-settings.ts");
    expect(settings).toContain("Tampilkan jejak radar");
    expect(settings).toContain("Warna jejak radar");
    expect(settings).toContain("radarTrailEnabled");
    expect(extra).toContain("radarTrailColor");
    expect(overlay).toContain("radarSettings.enabled");
    expect(overlay).toContain("radarSweepLine");
    expect(overlay).toContain("duration: 1200");
  });

  it("menggerakkan Robot SPCA dan memperbesar kaca pembesar ketika pemindaian awal", () => {
    const overlay = source("components/spca-overlay.tsx");
    expect(overlay).toContain("scanPatrol");
    expect(overlay).toContain("const freeScan = Animated.loop");
    expect(overlay).toContain("(analyzing ? 10 : 7)");
    expect(overlay).toContain("emphasis={analyzing}");
    expect(overlay).toContain("scanInFlight.current");
    expect(overlay).toContain("scan().catch");
    expect(overlay).toContain("setVisible(true)");
  });

  it("menampilkan scanner mini dengan garis radar lembut pada gelembung saat pemindaian", () => {
    const overlay = source("components/spca-overlay.tsx");
    expect(overlay).toContain("miniScannerBubble");
    expect(overlay).toContain("miniScannerLine");
    expect(overlay).toContain("Memindai layar");
    expect(overlay).toContain("Radar SPCA aktif");
    expect(overlay).toContain("bubble || analyzing");
  });

  it("menyimpan warna scanner dan memperlihatkan progres pemindaian 0–100%", () => {
    const settings = source("app/spca-settings.tsx");
    const overlay = source("components/spca-overlay.tsx");
    const extra = source("lib/spca-extra-settings.ts");
    expect(settings).toContain("Warna scanner mini");
    expect(settings).toContain("scannerColor");
    expect(extra).toContain("scannerColor");
    expect(overlay).toContain("SCANNER_COLORS");
    expect(overlay).toContain("scanPercent");
    expect(overlay).toContain("setScanPercent(100)");
    expect(overlay).toContain("{scanPercent}%");
  });
});

  it("mengizinkan hitbox menempel ke tepi layar tanpa melewati batas perangkat", () => {
    const overlay = source("components/spca-overlay.tsx");
    expect(overlay).toContain("const bodyInset = (hitSize - iconSize) / 2");
    expect(overlay).toContain("const minLeft = -bodyInset");
    expect(overlay).toContain("const maxLeft = Math.max(minLeft, width - iconSize - bodyInset)");
    expect(overlay).toContain("left: Math.max(minLeft, Math.min(left, maxLeft))");
    expect(overlay).toContain("const minTop = Math.max(safeArea.top - bodyInset, -bodyInset)");
    expect(overlay).toContain("const bottomReserve = Math.max(74, safeArea.bottom + 56)");
    expect(overlay).toContain("top: Math.max(minTop, Math.min(top, maxTop))");
    expect(overlay).toContain("const horizontalTravel = next.left - gestureStart.current.left");
  });
