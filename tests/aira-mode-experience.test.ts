import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

describe("identitas visual dan riwayat per mode Aira", () => {
  it("menyediakan tampilan terpisah tanpa mengubah identitas Aira Default", () => {
    const presentation = source("lib/aira-mode-presentation.ts");
    expect(presentation).toContain('label: "Aira Hot Pro 18+"');
    expect(presentation).toContain('primary: "#DB2777"');
    expect(presentation).toContain('label: "Aira Ahli Ilmuan"');
    expect(presentation).toContain('primary: "#15803D"');
    expect(presentation).toContain("palette: base");
  });

  it("menyimpan dan menyaring riwayat percakapan berdasarkan mode yang aktif", () => {
    const types = source("lib/finance/types.ts");
    const context = source("lib/finance/finance-context.tsx");
    const chat = source("components/aira-chat-screen.tsx");
    expect(types).toContain("mode?: AiraResponseMode");
    expect(context).toContain("mode: normalizeMode(conversation.mode)");
    expect(chat).toContain("const scopedConversations");
    expect(chat).toContain("conversation.mode === state.profile.aiMode");
    expect(chat).toContain("mode: state.profile.aiMode");
  });

  it("memuat ulang riwayat sesuai mode saat mode berubah atau aplikasi kembali aktif", () => {
    const context = source("lib/finance/finance-context.tsx");
    const chat = source("components/aira-chat-screen.tsx");
    expect(context).toContain('aiMode: "aira"');
    expect(chat).toContain("initializedMode.current === state.profile.aiMode");
    expect(chat).toContain("initializedMode.current = state.profile.aiMode");
  });
});
