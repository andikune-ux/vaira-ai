import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("integrasi Perchance dan stabilitas Robot SPCA", () => {
  it("membuka Perchance melalui route internal Aira dengan fallback web dan error state", () => {
    const ai = source("app/(tabs)/ai.tsx");
    const perchance = source("app/perchance-webview.tsx");
    expect(ai).toContain('pathname: "/aira-browser"');
    expect(ai).toContain('https://perchance.org/ai-text-to-image-generator');
    expect(ai).toContain("Buka Perchance AI di Aira AI Browser");
    expect(perchance).toContain("https://perchance.org/ai-text-to-image-generator");
    expect(perchance).toContain("react-native-webview");
    expect(perchance).toContain("Perchance belum dapat dimuat");
    expect(perchance).toContain("Buka browser eksternal");
  });

  it("mencegah pemindaian SPCA ganda dan menangani kegagalan tanpa promise unhandled", () => {
    const spca = source("components/spca-overlay.tsx");
    expect(spca).toContain("scanInFlight.current");
    expect(spca).toContain("setVisible(true)");
    expect(spca).toContain("scan().catch");
    expect(spca).toContain("SPCA tidak dapat memulai pemindaian saat ini");
  });
});
