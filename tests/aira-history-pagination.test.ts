import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("pagination riwayat Aira", () => {
  it("memuat batch maksimal 40 tanpa menghapus percakapan lama", () => {
    const db = readFileSync(`${process.cwd()}/server/db.ts`, "utf8");
    const router = readFileSync(`${process.cwd()}/server/routers.ts`, "utf8");
    expect(db).toContain("listAiraConversationHistoryPage");
    expect(db).toContain("listAiraConversationHistories(accountId");
    expect(db).toContain("updatedAt)).limit(40)");
    expect(db).toContain("Math.min(40");
    expect(db).toContain("limit(limit + 1).offset(offset)");
    expect(db).toContain("hasMore: rows.length > limit");
    expect(router).toContain("airaHistory: router");
    expect(router).toContain("page: publicProcedure");
    expect(router).toContain("listAiraConversationHistoryPage");
    const screen = readFileSync(`${process.cwd()}/app/aira-history.tsx`, "utf8");
    expect(screen).toContain("FlatList");
    expect(screen).toContain("Muat riwayat lebih lama");
    expect(screen).toContain("setOffset");
  });
});
