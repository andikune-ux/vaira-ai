import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("pemicu rahasia mode Aira dari Daftar Riwayat", () => {
  it("hanya menampilkan pemilih mode setelah 20 ketukan dan memberi petunjuk mulai ketukan ke-11", () => {
    const history = read("components/aira-chat-navigation.tsx");
    expect(history).toContain("modeTapCount");
    expect(history).toContain("next >= 11");
    expect(history).toContain("next >= 20");
    expect(history).toContain("20 - next");
  });

  it("menempatkan pemicu pada bagian kanan bawah panel Riwayat, bukan layar percakapan utama", () => {
    const chat = read("components/aira-chat-screen.tsx");
    const history = read("components/aira-chat-navigation.tsx");
    const drawer = history.indexOf("<View style={[styles.drawer");
    const trigger = history.indexOf('accessibilityLabel="Pemicu rahasia mode Aira"');
    const selector = history.indexOf("<AiraModeSelector visible");
    expect(drawer).toBeGreaterThan(-1);
    expect(trigger).toBeGreaterThan(drawer);
    expect(trigger).toBeLessThan(selector);
    expect(history).toContain("secretTrigger");
    expect(history).toContain("bottom: 18");
    expect(history).toContain("right: 18");
    expect(chat).not.toContain('accessibilityLabel="Pemicu rahasia mode Aira"');
    expect(chat).not.toContain('accessibilityLabel="Buka pemilih mode Aira"');
  });

  it("menerima hanya PIN numerik empat sampai delapan angka pada form pemilih mode", () => {
    const selector = read("components/aira-mode-selector.tsx");
    expect(selector).toContain('value.replace(/\\D/g, "").slice(0, 8)');
    expect(selector).toContain('keyboardType="number-pad"');
    expect(selector).toContain("PIN harus 4 sampai 8 angka.");
  });
});
