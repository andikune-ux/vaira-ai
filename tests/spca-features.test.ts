import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("fitur status koneksi dan SPCA", () => {
  it("menyediakan semua label status jaringan berwarna", () => {
    const network = source("components/network-status.tsx");
    expect(network).toContain('label: "Offline"');
    expect(network).toContain('label: "Sinyal putus"');
    expect(network).toContain('label: "Menghubungkan"');
    expect(network).toContain('label: "Online"');
  });

  it("menyimpan pengaturan patrol dan bubble yang aman", () => {
    const types = source("lib/finance/types.ts");
    expect(types).toContain("spcaAutoPatrol: true");
    expect(types).toContain("spcaPatrolIntervalSeconds: 10");
    expect(types).toContain("spcaBubbleDurationSeconds: 3");
    expect(types).toContain("spcaBubbleRepeatMinutes: 5");
  });

  it("menyediakan tangkapan layar perangkat, crop, penyimpanan galeri, dan cache sementara", () => {
    const overlay = source("components/spca-overlay.tsx");
    expect(overlay).toContain("captureScreen");
    expect(overlay).toContain("saveToLibraryAsync");
    expect(overlay).toContain("manipulateAsync");
    expect(overlay).toContain("clearTemporaryCache");
    expect(overlay).toContain("showReminderBubble");
    expect(overlay).not.toContain("ImagePicker");
  });

  it("menempatkan ekspresi pada layar wajah dan menyediakan laporan yang dapat diedit", () => {
    const overlay = source("components/spca-overlay.tsx");
    expect(overlay).toContain("faceScreen");
    expect(overlay).toContain("emotionBadge");
    expect(overlay).toContain('accessory: "tears"');
    expect(overlay).toContain('accessory: "tissue"');
    expect(overlay).toContain('accessory: "magnifier"');
    expect(overlay).toContain('accessory: "steam"');
    expect(overlay).toContain("ExpressionAccessory");
    expect(overlay).not.toContain('backgroundColor: "rgba(5,19,37,.88)"');
    expect(overlay).toContain('accent: "?"');
    expect(overlay).toContain('accent: "💩"');
    expect(overlay).toContain("crying:");
    expect(overlay).toContain("surprised:");
    expect(overlay).toContain("love:");
    expect(overlay).toContain("sleepy:");
    expect(overlay).toContain("reportDraft");
    expect(overlay).toContain("Radar sedang memindai");
    expect(overlay).not.toContain("moodBadge");
  });

  it("menyediakan pengaturan patrol dan bubble di Studio Developer", () => {
    const studio = source("app/developer-studio.tsx");
    expect(studio).toContain("spcaAutoPatrol");
    expect(studio).toContain("spcaPatrolIntervalSeconds");
    expect(studio).toContain("spcaPatrolDurationSeconds");
    expect(studio).toContain("spcaReminderBubbleEnabled");
  });
  it("uses scalar native animated values for SPCA X/Y transforms", () => {
    const overlay = source("components/spca-overlay.tsx");
    expect(overlay).not.toContain("Animated.ValueXY");
    expect(overlay).not.toContain("getTranslateTransform");
    expect(overlay).toContain("new Animated.Value(0)");
    expect(overlay).toContain("translateX: point.x");
    expect(overlay).toContain("translateY: point.y");
    expect(overlay).toContain("Animated.timing(point.x");
    expect(overlay).toContain("Animated.timing(point.y");
  });

});