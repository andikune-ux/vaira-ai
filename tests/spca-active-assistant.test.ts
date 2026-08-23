import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("antarmuka dan kontrak SPCA aktif", () => {
  it("menyediakan pusat diagnosis, tindakan pemulihan, dan penjelasan privasi", () => {
    const screen = read("app/spca-diagnostics.tsx");
    expect(screen).toContain("SPCA · PUSAT DIAGNOSTIK");
    expect(screen).toContain("Bersihkan cache");
    expect(screen).toContain("Laporan privat Administrator");
    expect(screen).toContain("submitDiagnostic");
  });

  it("menghubungkan robot aktif ke pusat diagnosis, bukan hanya animasi", () => {
    const overlay = read("components/spca-overlay.tsx");
    const hook = read("hooks/use-spca-diagnostics.ts");
    expect(overlay).toContain("useSpcaDiagnostics");
    expect(overlay).toContain('router.push("/spca-diagnostics"');
    expect(overlay).toContain("createSpcaFindings(runtime)");
    expect(overlay).toContain("SPCA menemukan:");
    expect(hook).toContain("120_000");
  });

  it("memproses garis radar scanner melalui Animated.View agar translateY valid pada Android", () => {
    const overlay = read("components/spca-overlay.tsx");
    const scannerLineIndex = overlay.indexOf("styles.miniScannerLine");
    const animatedViewIndex = overlay.lastIndexOf("<Animated.View", scannerLineIndex);

    expect(scannerLineIndex).toBeGreaterThan(-1);
    expect(animatedViewIndex).toBeGreaterThan(-1);
    expect(overlay.slice(animatedViewIndex, scannerLineIndex)).toContain("<Animated.View");
    expect(overlay).toContain("translateY: radar.interpolate");
    expect(overlay).not.toContain("translateY: { translateY:");
  });

  it("menjadwalkan screenshot dengan callback tugas yang valid dan menjaga target sentuh robot di atas dekorasi", () => {
    const overlay = read("components/spca-overlay.tsx");

    expect(overlay).toContain("InteractionManager.runAfterInteractions(() => resolve())");
    expect(overlay).not.toContain("await InteractionManager.runAfterInteractions();");
    expect(overlay).toContain('pointerEvents="box-none"');
    expect(overlay).toContain("hitSlop={12}");
    expect(overlay).toContain("elevation: 51");
  });

  it("membuka Pusat SPCA aktif dari ketukan robot patroli dan memindahkan reaksi ke tekan-tahan", () => {
    const overlay = read("components/spca-overlay.tsx");
    const passiveStart = overlay.indexOf("function PassiveSpcaPatrol()");
    const passiveRobot = overlay.slice(passiveStart);

    expect(passiveRobot).toContain('onPress={() => router.push("/spca-diagnostics" as never)}');
    expect(passiveRobot).toContain("onLongPress={onPress}");
    expect(passiveRobot).toContain("delayLongPress={420}");
    expect(passiveRobot).toContain('accessibilityLabel="Buka Pusat SPCA aktif"');
  });

  it("membatasi laporan ke akun pengirim dan Administrator terverifikasi", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("submitDiagnostic");
    expect(router).toContain("const account = await requireManualAccount(ctx.req)");
    expect(router).toContain("adminResolve");
    expect(router).toContain("verifyAdministratorCredentials(input.username, input.password)");
    expect(router).toContain("createSpcaDiagnosticReport");
  });
});
