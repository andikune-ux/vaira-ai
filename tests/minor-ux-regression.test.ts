import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("minor UX regressions", () => {
  it("keeps per-photo upload progress in profile settings", () => {
    const source = readProjectFile("app/profile-settings.tsx");
    expect(source).toContain("uploadingPhotoIndex");
    expect(source).toContain("Mengunggah foto");
    expect(source).toContain("setUploadingPhotoIndex(index + 1)");
  });

  it("keeps the system permission and battery guidance for prayer alarms", () => {
    const source = readProjectFile("app/prayer-times.tsx");
    expect(source).toContain("Jadwal");
    expect(source).toContain("Izin sistem");
    expect(source).toContain("Suara & getar");
    expect(source).toContain("Tes alarm adzan");
    expect(source).toContain("penghemat baterai");
    expect(source).toContain("Perbarui status izin");
  });

  it("keeps Room Global navigation and audio controls accessible after header grouping", () => {
    const source = readProjectFile("app/global-room-chat.tsx");
    expect(source).toContain("Keluar dari Room Global");
    expect(source).toContain("power-settings-new");
    expect(source).toContain("exitIconButton");
    expect(source).toContain("Buka pengaturan Administrator Room Global");
    expect(source).toContain("Provider audio belum aktif, coba periksa ulang");
    expect(source).toContain("Buka uji Jitsi publik");
  });

  it("keeps the Room Global header readable on narrow screens", () => {
    const source = readProjectFile("app/global-room-chat.tsx");
    expect(source).toContain('flexWrap: "wrap"');
    expect(source).toContain('flex: { flex: 1, minWidth: 0 }');
    expect(source).toContain('compactTitle: { flexShrink: 1');
  });

  it("does not present a missing SectionHeading callback as an active button", () => {
    const source = readProjectFile("components/aira-ui.tsx");
    expect(source).toContain("action ? onPress ?");
    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain("colors.muted");
  });

  it("keeps guest room access actionable and uses the single active home-card system", () => {
    const roomSource = readProjectFile("app/global-room.tsx");
    const homeSource = readProjectFile("app/(tabs)/index.tsx");
    const rotatorSource = readProjectFile("components/aira-mode-status-card.tsx");
    expect(roomSource).toContain('router.push("/login"');
    expect(roomSource).toContain("Masuk ke akun");
    expect(homeSource).toContain("AiraModeStatusCard");
    expect(rotatorSource).toContain("activeOffsetX");
    expect(rotatorSource).not.toContain("manualNavigation");
  });

  it("keeps protected room and administrator rules in source", () => {
    const roomSource = readProjectFile("app/global-room-chat.tsx");
    const adminSource = readProjectFile("app/administrator.tsx");
    expect(roomSource).toContain("ADMIN VAIRA");
    expect(roomSource).toContain("16");
    expect(adminSource).toContain("Token Aira");
    expect(adminSource).toContain("Room Global");
  });
});
