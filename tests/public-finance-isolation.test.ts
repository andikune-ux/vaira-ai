import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("isolasi data keuangan dari ruang publik", () => {
  it("menghapus pemuatan dan penerbitan snapshot keuangan global", () => {
    const router = read("server/routers.ts");
    const layout = read("app/_layout.tsx");
    const legacySync = read("components/global-test-sync.tsx");

    expect(router).not.toContain("globalTestSnapshot");
    expect(router).not.toContain("getGlobalTestSnapshot");
    expect(router).not.toContain("saveGlobalTestSnapshot");
    expect(layout).not.toContain("<GlobalTestSync />");
    expect(legacySync).toContain("data keuangan hanya boleh memakai sinkronisasi akun");
    expect(legacySync).not.toContain("replaceAllData");
  });

  it("mempertahankan sinkronisasi keuangan pribadi di balik prosedur terautentikasi", () => {
    const router = read("server/routers.ts");
    const syncRouter = router.slice(router.indexOf("sync: router({"));

    expect(syncRouter).toContain("pull: protectedProcedure.query");
    expect(syncRouter).toContain("push: protectedProcedure");
    expect(syncRouter).toContain("db.getFinanceSnapshot(ctx.user.id)");
    expect(syncRouter).toContain("db.saveFinanceSnapshot(ctx.user.id, input.payload)");
  });

  it("membatasi pesan Room Global dan grup privat pada isi pesan, bukan payload keuangan", () => {
    const router = read("server/routers.ts");
    const globalSend = router.slice(router.indexOf("sendMessage: publicProcedure.input"), router.indexOf("deleteMessage: publicProcedure.input"));

    expect(globalSend).toContain("content: z.string().trim().min(1).max(2000)");
    expect(globalSend).not.toMatch(/wallet|transaction|financeSnapshot|balance/i);
    expect(router).toContain("sendMessage: publicProcedure.input(z.object({ groupId: z.number().int().positive(), content: z.string().trim().min(1).max(4_000)");
  });
});
