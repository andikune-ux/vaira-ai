import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const types = fs.readFileSync(path.resolve(__dirname, "../lib/finance/types.ts"), "utf8");
const studio = fs.readFileSync(path.resolve(__dirname, "../app/developer-studio.tsx"), "utf8");
const overlay = fs.readFileSync(path.resolve(__dirname, "../components/spca-overlay.tsx"), "utf8");

describe("ukuran Robot SPCA", () => {
  it("menyimpan ukuran default dan menyediakan kontrol Studio Developer", () => {
    expect(types).toContain("spcaScalePercent: number");
    expect(types).toContain("spcaScalePercent: 25");
    expect(types).toContain("spcaTransparencyPercent: 100");
    expect(studio).toContain("Skala ikon Robot SPCA");
    expect(studio).toContain("PreferenceSlider");
    expect(studio).toContain("Pratinjau langsung");
  });

  it("membatasi ukuran aman lalu menerapkannya pada maskot dan wajah robot", () => {
    expect(overlay).toContain("preferences.spcaScalePercent");
    expect(overlay).toContain("preferences.spcaTransparencyPercent");
    expect(overlay).toContain("height: iconSize");
    expect(overlay).toContain("faceScale");
    expect(overlay).toContain("const bodyInset = (hitSize - iconSize) / 2");
    expect(overlay).toContain("const minLeft = -bodyInset");
    expect(overlay).toContain("width - iconSize - bodyInset");
    expect(overlay).toContain("Radar, aura, and wave effects may extend beyond it.");
    expect(overlay).toContain("height - bottomReserve - iconSize - bodyInset");
  });
});
