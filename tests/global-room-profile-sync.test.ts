import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
const profileSource = readFileSync(resolve(process.cwd(), "app/(tabs)/profile.tsx"), "utf8");
const publicProfileSource = readFileSync(resolve(process.cwd(), "app/global-room-public-profile.tsx"), "utf8");

describe("Global Room profile synchronization", () => {
  it("loads an active account profile even when its room presence is stale", () => {
    expect(dbSource).toContain("where(eq(manualAccounts.id, accountId))");
    expect(dbSource).toContain("if (!profile || profile.status !== \"active\") return null");
    expect(dbSource).toContain("avatarUri: refreshedPhotos[0] ?? null");
    expect(dbSource).toContain("featuredPhotos: refreshedPhotos");
  });

  it("provides an inline Edit and Simpan flow backed by updateProfile", () => {
    expect(profileSource).toContain("const [editingBio, setEditingBio]");
    expect(profileSource).toContain("syncProfile.mutateAsync");
    expect(profileSource).toContain("Bio profil tersimpan dan dapat dilihat peserta lain.");
    expect(profileSource).toContain('>{syncProfile.isPending ? "Menyimpan…" : "Simpan"}</Text>');
  });

  it("keeps public profile media reload and photo viewing available", () => {
    expect(publicProfileSource).toContain("profile.refetch");
    expect(publicProfileSource).toContain("Buka galeri foto unggulan");
    expect(publicProfileSource).toContain("Muat ulang foto");
  });
});
