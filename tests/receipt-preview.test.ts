import fs from "node:fs";

import { describe, expect, it } from "vitest";

const screen = fs.readFileSync("app/scan-receipt.tsx", "utf8");

describe("pratinjau foto Pindai Bukti", () => {
  it("membuka modal pratinjau penuh dari thumbnail bukti", () => {
    expect(screen).toContain("const [fullPreviewOpen, setFullPreviewOpen] = useState(false)");
    expect(screen).toContain("setFullPreviewOpen(true)");
    expect(screen).toContain("visible={fullPreviewOpen}");
    expect(screen).toContain("Pratinjau foto bukti");
    expect(screen).toContain('contentFit="contain"');
  });

  it("menampilkan pesan kesalahan dan menyediakan jalur kembali ke crop saat foto gagal dimuat", () => {
    expect(screen).toContain("const [previewError, setPreviewError] = useState<string | null>(null)");
    expect(screen).toContain("Foto bukti tidak dapat dimuat");
    expect(screen).toContain("Ganti / crop");
    expect(screen).toContain("setPreviewOpen(true)");
  });
});
