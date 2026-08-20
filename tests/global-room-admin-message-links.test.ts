import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

describe("Moderasi pesan dan keamanan link Room Global", () => {
  it("menyediakan soft-delete pesan hanya pada alur administrator", async () => {
    const router = await readFile("server/routers.ts", "utf8");
    const admin = await readFile("app/administrator.tsx", "utf8");
    const adminMessages = await readFile("app/administrator-room-messages.tsx", "utf8");
    const room = await readFile("app/global-room-chat.tsx", "utf8");
    expect(router).toContain("adminDeleteMessage");
    expect(router).toContain("Pesan dihapus admin");
    expect(admin).toContain("/administrator-room-messages");
    expect(adminMessages).toContain("Hapus pesan yang ditandai?");
    expect(adminMessages).toContain("Pesan Room Global");
    expect(room).not.toContain("deleteGlobalMessage");
  });

  it("menyediakan hapus pesan terpilih dan hapus semua dengan refresh daftar", async () => {
    const router = await readFile("server/routers.ts", "utf8");
    const adminMessages = await readFile("app/administrator-room-messages.tsx", "utf8");
    expect(router).toContain("adminDeleteMessages");
    expect(router).toContain("deleteGlobalRoomMessagesByAdmin");
    expect(adminMessages).toContain("Hapus ditandai");
    expect(adminMessages).toContain("Hapus semua");
    expect(adminMessages).toContain("Pilih semua");
    expect(adminMessages).toContain("setSelectedIds([])");
  });

  it("menampilkan link biru dan memberi peringatan sebelum membuka browser", async () => {
    const room = await readFile("app/global-room-chat.tsx", "utf8");
    expect(room).toContain("messageLink");
    expect(room).toContain("Peringatan keamanan link");
    expect(room).toContain("Buka browser");
    expect(room).toContain("Linking.openURL(url)");
    expect(room).toContain("Judi online");
    expect(room).toContain("phishing");
  });
});
