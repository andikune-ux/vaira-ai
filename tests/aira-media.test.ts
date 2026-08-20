import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("lampiran layanan Aira", () => {
  it("menyimpan data URL media ke penyimpanan sebelum memanggil model", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("normalizeAiraContent");
    expect(router).toContain("storagePut(`aira-media/");
    expect(router).toContain("storageGetSignedUrl(uploaded.key)");
    expect(router).toContain('item.id.startsWith("gemini-3-flash")');
  });

  it("mengalihkan lampiran besar dari payload base64 ke unggahan langsung", () => {
    const chat = read("components/aira-chat-screen.tsx");
    expect(chat).toContain("MAX_MEDIA_BYTES");
    expect(chat).toContain("200 MB");
  });
});
