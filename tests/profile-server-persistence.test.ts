import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const auth = readFileSync(resolve(process.cwd(), "server/manual-auth.ts"), "utf8");
const login = readFileSync(resolve(process.cwd(), "app/login.tsx"), "utf8");
const profile = readFileSync(resolve(process.cwd(), "app/profile-settings.tsx"), "utf8");
const airaSettings = readFileSync(resolve(process.cwd(), "app/aira-setting.tsx"), "utf8");
const homePreferences = readFileSync(resolve(process.cwd(), "app/home-preferences.tsx"), "utf8");

 describe("profil server dan pemisahan referensi Aira", () => {
  it("menyimpan avatar server secara aditif dan mengembalikannya pada akun publik", () => {
    expect(schema).toContain('avatarUri: text("avatarUri")');
    expect(router).toContain("uploadProfileAvatar");
    expect(router).toContain("avatarUri: z.string().trim().max(400).nullable().optional()");
    expect(auth).toContain("avatarUri: string | null");
  });

  it("memulihkan avatar, bio, dan foto unggulan dari respons login", () => {
    expect(login).toContain("userAvatarUri: result.account.avatarUri ?? localState.profile.userAvatarUri");
    expect(login).toContain("bio: result.account.bio");
    expect(login).toContain("featuredPhotoUris: result.account.featuredPhotoUris");
  });

  it("menyediakan galeri crop dan upload avatar pada Profil", () => {
    expect(profile).toContain("allowsEditing: true");
    expect(profile).toContain("uploadProfileAvatar");
    expect(profile).toContain("Foto profil, bio, dan foto unggulan tersimpan di server akun.");
    expect(profile).toContain("Profil, bio, dan foto unggulan Anda.");
    expect(profile).not.toContain("Waktu Salat di Beranda");
    expect(profile).not.toContain("Kartu rotasi Beranda");
  });

  it("menempatkan Waktu Salat dan kartu Beranda pada Referensi Aira", () => {
    expect(airaSettings).toContain("Pengaturan Referensi Aira");
    expect(airaSettings).not.toContain("Referensi Aira · Beranda");
    expect(homePreferences).toContain("Kartu Beranda & Waktu Salat");
    expect(homePreferences).toContain("Waktu Salat di Beranda");
    expect(homePreferences).toContain("Kartu ucapan event");
  });
});
