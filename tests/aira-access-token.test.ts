import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (file: string) => fs.readFileSync(path.resolve(__dirname, "..", file), "utf8");

describe("Token akses layanan Aira", () => {
  it("menyimpan hash token dan metadata kriteria tanpa token mentah", () => {
    const schema = source("drizzle/schema.ts");
    const db = source("server/db.ts");
    expect(schema).toContain("airaAccessTokens");
    expect(schema).toContain('mysqlEnum("criterion", ["pro", "premium", "admin"])');
    expect(db).toContain("redeemAiraAccessToken");
    expect(db).toContain("isNull(airaAccessTokens.redeemedAt)");
    expect(db).toContain("durationDays: airaAccessTokens.durationDays");
    expect(db).toContain("isNull(airaAccessTokens.revokedAt)");
  });

  it("menerapkan Pro untuk chat dan Premium untuk generator", () => {
    const router = source("server/routers.ts");
    expect(router).toContain('requireAiraAccess(ctx.req, "pro")');
    expect(router).toContain('requireAiraAccess(ctx.req, "premium")');
    expect(router).toContain('airaAccess: router');
    expect(router).toContain('redeem: publicProcedure');
  });

  it("menyediakan kriteria admin dan durasi yang benar", () => {
    const panel = source("components/aira-access-token-panel.tsx");
    const router = source("server/routers.ts");
    expect(panel).toContain("Premium · Chat + gambar + dokumen");
    expect(panel).toContain("Admin · Semua hak yang tersedia");
    expect(router).toContain("Token Admin bersifat permanen");
    expect(router).toContain("Token Pro atau Premium harus memiliki durasi");
    expect(panel).toContain("create.mutateAsync");
    expect(panel).toContain("Buat Token");
    expect(router).toContain("create: publicProcedure");
    expect(router).toContain("createAiraAccessToken");
    expect(router).toContain('status: item.revokedAt ? "revoked"');
    expect(panel).toContain("formatTokenDuration");
    expect(panel).toContain("Cabut akses pengguna?");
  });

  it("melindungi token aktif dari penghapusan riwayat", () => {
    const db = source("server/db.ts");
    const router = source("server/routers.ts");
    expect(db).toContain("const inactiveToken = or(isNotNull(airaAccessTokens.revokedAt)");
    expect(db).toContain("lt(airaAccessTokens.expiresAt, new Date())");
    expect(db).toContain("where(and(isNull(airaAccessTokens.tokenHistoryHiddenAt), inactiveToken))");
    expect(db).toContain("lt(airaAccessTokens.createdAt, cutoff), inactiveToken");
    expect(router).toContain("Riwayat disembunyikan; token yang masih aktif tetap dapat digunakan.");
  });

  it("menyediakan permintaan token melalui Email dan WhatsApp", () => {
    const chat = source("components/aira-chat-screen.tsx");
    expect(chat).toContain("mailto:andikune@gmail.com");
    expect(chat).toContain("chat.whatsapp.com/KZj1sbtuPfAIjWdnncGXiA");
    expect(chat).toContain("Saya Memiliki Token");
  });
});
