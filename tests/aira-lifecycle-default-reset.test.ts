import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("reset mode Aira saat aplikasi tidak aktif", () => {
  it("mengembalikan mode khusus ke Aira Default segera saat aplikasi meninggalkan keadaan aktif", () => {
    const context = read("lib/finance/finance-context.tsx");
    expect(context).toContain('if (nextState === "active") return;');
    expect(context).toContain('profile: { ...previous.profile, aiMode: "aira" }');
  });

  it("membuat chat Aira Default baru setelah reset otomatis tanpa menghapus riwayat mode sebelumnya", () => {
    const chat = read("components/aira-chat-screen.tsx");
    expect(chat).toContain("mustStartNewDefaultChat");
    expect(chat).toContain("Riwayat mode sebelumnya tetap tersimpan secara terpisah.");
    expect(chat).toContain('state.profile.aiMode === "aira"');
  });
});
