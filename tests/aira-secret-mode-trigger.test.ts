import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("pemicu rahasia mode Aira dari Daftar Riwayat", () => {
  it("hanya menampilkan pemilih mode setelah 20 ketukan dan memberi petunjuk mulai ketukan ke-11", () => {
    const chat = read("components/aira-chat-screen.tsx");
    expect(chat).toContain("modeTapCount");
    expect(chat).toContain("next >= 11");
    expect(chat).toContain("next >= 20");
    expect(chat).toContain("20 - next");
  });

  it("menempatkan pemicu pada bagian kanan bawah panel Riwayat, bukan layar percakapan utama", () => {
    const chat = read("components/aira-chat-screen.tsx");
    const historyStart = chat.indexOf("{historyOpen ? <View");
    const trigger = chat.indexOf('accessibilityLabel="Pemicu rahasia mode Aira"');
    const selector = chat.indexOf("<AiraModeSelector visible");
    expect(historyStart).toBeGreaterThan(-1);
    expect(trigger).toBeGreaterThan(historyStart);
    expect(trigger).toBeLessThan(selector);
    expect(chat).toContain('alignSelf: "flex-end"');
    expect(chat).not.toContain('accessibilityLabel="Buka pemilih mode Aira"');
  });

  it("menerima hanya PIN numerik empat sampai delapan angka pada form pemilih mode", () => {
    const selector = read("components/aira-mode-selector.tsx");
    expect(selector).toContain('value.replace(/\\D/g, "").slice(0, 8)');
    expect(selector).toContain('keyboardType="number-pad"');
    expect(selector).toContain("PIN harus 4 sampai 8 angka.");
  });
});
