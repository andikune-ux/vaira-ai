import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

describe("notifikasi donasi dan efek melayang SPCA", () => {
  it("menampilkan ucapan terima kasih setelah konfirmasi lokal dicatat", () => {
    const donation = source("app/donation-details.tsx");
    expect(donation).toContain("Terima kasih atas dukungan Anda");
    expect(donation).toContain("Konfirmasi donasi dicatat di perangkat ini");
  });

  it("menjalankan animasi melayang dengan intensitas yang dapat dipilih ketika SPCA aktif", () => {
    const overlay = source("components/spca-overlay.tsx");
    const developer = source("app/developer-studio.tsx");
    expect(overlay).toContain("const float = useRef(new Animated.Value(0))");
    expect(overlay).toContain("const floating = Animated.loop");
    expect(overlay).toContain("const FLOAT_MOTION");
    expect(overlay).toContain("styles.floatGlow");
    expect(overlay).toContain("-floatMotion.lift");
    expect(developer).toContain("Intensitas animasi melayang");
    expect(developer).toContain('label: "Halus"');
    expect(developer).toContain('label: "Standar"');
    expect(developer).toContain('label: "Ekspresif"');
    expect(developer).toContain("SpcaMotionPreview");
    expect(developer).toContain("Pratinjau langsung · animasi");
    expect(developer).toContain("SPCA_PREVIEW_MOTION");
    expect(developer).toContain("Warna aura Robot SPCA");
    expect(developer).toContain("Kecepatan animasi");
    expect(overlay).toContain("const AURA_COLORS");
    expect(overlay).toContain("const ANIMATION_SPEED");
    expect(overlay).toContain("left: hitSize + 4");
    expect(developer).toContain("Posisi bubble pengingat");
    expect(developer).toContain("Efek masuk dan keluar bubble");
    expect(developer).toContain("Patroli pasif saat SPCA utama mati");
    expect(developer).toContain("0–2 menit");
    expect(overlay).toContain("function PassiveSpcaPatrol");
    expect(overlay).toContain("Aduh sakit");
    expect(overlay).toContain("Sakit Woyy");
    expect(overlay).toContain("Z#*z:!#");
    expect(overlay).toContain("pointerEvents=\"auto\"");
  });
});
