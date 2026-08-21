import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

describe("branding dan avatar Profil V A I R A  A I", () => {
  it("mengarahkan metadata aplikasi ke logo V A I R A  A I baru", () => {
    const config = source("app.config.ts");
    expect(config).toContain('https://files.manuscdn.com/user_upload_by_module/session_file/310519663887191524/SmxQiPwUtfycXoUv.jpeg');
    expect(fs.existsSync(path.resolve(__dirname, "../assets/images/icon.png"))).toBe(true);
  });

  it("menyimpan username dan foto pribadi pada profil akun", () => {
    const types = source("lib/finance/types.ts");
    const login = source("app/login.tsx");
    const profile = source("app/(tabs)/profile.tsx");
    const profileSettings = source("app/profile-settings.tsx");
    expect(types).toContain("username?: string");
    expect(types).toContain("userAvatarUri?: string");
    expect(login).toContain("username: result.account.username");
    expect(profileSettings).toContain("launchImageLibraryAsync");
    expect(profileSettings).toContain("Foto unggulan");
    expect(profileSettings).toContain("featuredPhotoUris");
    expect(profile).toContain("@{profile.username}");
  });

  it("menampilkan foto pengguna pada bubble dan avatar berbeda untuk mode khusus", () => {
    const chat = source("components/aira-chat-screen.tsx");
    expect(chat).toContain("HOT_PRO_AVATAR");
    expect(chat).toContain("EXPERT_AVATARS");
    expect(chat).toContain("UserAvatar uri={state.profile.userAvatarUri}");
    expect(chat).toContain("expert={message.expert}");
    expect(chat).toContain('require("../assets/images/aira-hot-pro-avatar.png")');
    expect(chat).toContain('require("../assets/images/expert-general.png")');
    expect(fs.existsSync(path.resolve(__dirname, "../assets/images/aira-hot-pro-avatar.png"))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, "../assets/images/expert-general.png"))).toBe(true);
  });
});
