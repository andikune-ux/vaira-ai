import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("pelaporan Room Global", () => {
  it("menyimpan kategori, konteks pesan, prioritas, dan status laporan", () => {
    const schema = read("drizzle/schema.ts");
    const db = read("server/db.ts");
    const router = read("server/routers.ts");
    expect(schema).toContain("globalRoomReports");
    expect(schema).toContain('contextMessage: text("contextMessage")');
    expect(schema).toContain('priority: mysqlEnum("priority", ["normal", "high"])');
    expect(db).toContain("hasRecentGlobalRoomReport");
    expect(router).toContain("getLatestGlobalRoomMessage");
    expect(router).toContain("TOO_MANY_REQUESTS");
  });

  it("menghubungkan formulir peserta ke administrator dan ekspor Excel", () => {
    const schema = read("drizzle/schema.ts");
    const db = read("server/db.ts");
    const room = read("app/global-room.tsx");
    const admin = read("app/administrator.tsx");
    const reportPage = read("app/administrator-room-reports.tsx");
    const router = read("server/routers.ts");
    const exporter = read("lib/finance/report-export.ts");
    expect(room).toContain("Konfirmasi & kirim");
    expect(room).toContain("Laporan telah dikirim ke administrator.");
    expect(admin).toContain("/administrator-room-reports");
    expect(reportPage).toContain("Laporan & Moderasi");
    expect(reportPage).toContain("Tinjau");
    expect(reportPage).toContain("Selesaikan");
    expect(router).toContain("Laporan Room Global diperbarui");
    expect(admin).toContain("Laporan Room");
    expect(exporter).toContain("exportExcelGlobalRoomReports");
    expect(schema).toContain('deletedAt: timestamp("deletedAt")');
    expect(schema).toContain('deletedBy: varchar("deletedBy"');
    expect(db).toContain("softDeleteGlobalRoomReports");
    expect(router).toContain("deleteReports");
    expect(reportPage).toContain("Hapus laporan yang ditandai");
    expect(reportPage).toContain("Hapus semua laporan");
    expect(reportPage).toContain("formatDate(report.createdAt)");
  });
});

  it("membuka jendela Room Obrolan Global setelah masuk", () => {
    const lobby = read("app/global-room.tsx");
    const chat = read("app/global-room-chat.tsx");
    expect(lobby).toContain('router.push("/global-room-chat" as never)');
    expect(chat).toContain("Room Obrolan Global");
    expect(chat).toContain("Keluar dari Room Global");
    expect(chat).toContain("Masuk diperlukan");
  });


describe("Room Global requirements", () => {
  it("memvalidasi usia dan privasi profil publik", async () => {
    const routerSource = await import("node:fs/promises").then((fs) => fs.readFile("server/routers.ts", "utf8"));
    const roomSource = await import("node:fs/promises").then((fs) => fs.readFile("app/global-room.tsx", "utf8"));
    const chatSource = await import("node:fs/promises").then((fs) => fs.readFile("app/global-room-chat.tsx", "utf8"));
    expect(routerSource).toContain("minimal 16 tahun");
    expect(routerSource).toContain("assertGlobalRoomAge(account.birthDate)");
    expect(roomSource).toContain("V A I R A  A I tidak membagikan data akun pribadi");
    expect(roomSource).toContain("ID pengguna:");
    expect(roomSource).not.toContain("@{selectedParticipant.username}");
    expect(chatSource).toContain("ROOM_COLORS");
    expect(chatSource).toContain("avatarUri");
  });
});
