import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

describe("akses Mode Guest V A I R A  A I", () => {
  it("mengarahkan tombol Masuk lagi Profil ke login manual", () => {
    const profile = read("app/(tabs)/profile.tsx");
    expect(profile).toContain('profile.mode === "guest" || !isAuthenticated ? () => router.push("/login")');
  });

  it("menampilkan pratinjau Aira dengan komposer terkunci bagi guest", () => {
    const route = read("app/chat.tsx"); const preview = read("components/aira-guest-preview.tsx");
    expect(route).toContain('state.profile.mode === "guest"');
    expect(route).toContain("AiraGuestPreview");
    expect(preview).toContain("Masuk untuk mengirim pesan ke Aira");
    expect(preview).toContain("Masuk untuk membuka komposer Aira");
  });

  it("menampilkan Pindai bukti dengan gembok dan mengarahkannya ke login bagi guest", () => {
    const finance = read("app/(tabs)/finance.tsx"); const ui = read("components/aira-ui.tsx");
    expect(finance).toContain("locked={isGuest}");
    expect(finance).toContain('router.push("/login" as never)');
    expect(ui).toContain("lockBadge");
  });
});
