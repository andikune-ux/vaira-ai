import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("pengelolaan riwayat Room Global dan daftar akun Administrator", () => {
  it("menyediakan hapus riwayat permanen yang dikonfirmasi tanpa menggantikan soft-delete moderator", () => {
    const router = read("server/routers.ts");
    const db = read("server/db.ts");
    const screen = read("app/administrator-room-messages.tsx");

    expect(router).toContain("adminPurgeHistory");
    expect(router).toContain('z.literal("HAPUS RIWAYAT ROOM GLOBAL")');
    expect(router).toContain("Riwayat Room Global dihapus permanen");
    expect(db).toContain("purgeGlobalRoomHistoryByAdmin");
    expect(db.indexOf("db.delete(globalRoomMessageReactions)")).toBeLessThan(db.indexOf("db.delete(globalRoomMessages)"));
    expect(screen).toContain("Hapus riwayat percakapan permanen?");
    expect(screen).toContain("Hapus riwayat");
    expect(screen).toContain("Hapus semua");
  });

  it("mencari dan merangkum akun berdasarkan seluruh identifier aman", () => {
    const db = read("server/db.ts");
    const accounts = read("app/administrator-accounts.tsx");

    expect(db).toContain("account.publicId ?? \"\"");
    expect(db).toContain("String(account.id)");
    expect(accounts).toContain("Cari nama, username, ID, email, WhatsApp");
    expect(accounts).toContain("Dibuat:");
    expect(accounts).toContain('timeStyle: "medium"');
    expect(accounts).toContain("ID {account.publicId");
  });

  it("mempertahankan Token Aira sebagai halaman khusus dan tidak lagi menduplikasinya di konsol", () => {
    const administrator = read("app/administrator.tsx");
    const tokens = read("app/administrator-tokens.tsx");

    expect(administrator).toContain('label="Daftar akun"');
    expect(administrator).toContain('pathname: "/administrator-accounts"');
    expect(administrator).toContain('pathname: "/administrator-tokens"');
    expect(administrator).not.toContain("<AiraAccessTokenPanel");
    expect(tokens).toContain("AiraAccessTokenPanel");
  });
});
