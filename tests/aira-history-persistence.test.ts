import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
const routers = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const chat = readFileSync(resolve(process.cwd(), "components/aira-chat-screen.tsx"), "utf8");
const administratorEntry = readFileSync(resolve(process.cwd(), "components/aira-access-token-panel.tsx"), "utf8");

describe("Riwayat layanan Aira per akun", () => {
  it("menyimpan percakapan per akun, ID percakapan, dan mode tanpa mencampur akun", () => {
    expect(schema).toContain('airaConversationHistories');
    expect(schema).toContain('accountConversationUnique: uniqueIndex("aira_history_account_conversation_unique")');
    expect(schema).toContain('mode: mysqlEnum("mode", ["aira", "hot_pro", "scientist"])');
    expect(db).toContain("saveAiraConversationHistory(accountId");
    expect(db).toContain("listAiraConversationHistories(accountId");
  });

  it("mewajibkan sesi akun untuk simpan dan muat riwayat serta kredensial Administrator untuk pantau", () => {
    expect(routers).toContain("airaHistory: router({");
    expect(routers).toContain("const account = await requireManualAccount(ctx.req);");
    expect(routers).toContain("administrator: router({");
    expect(routers).toContain("listAdministratorAiraConversationHistories(input.limit ?? 300)");
    expect(routers).toContain("verifyAdministratorCredentials(input.username, input.password)");
  });

  it("memuat ulang riwayat setelah login dan menyinkronkan setiap perubahan percakapan", () => {
    expect(chat).toContain("trpc.airaHistory.list.useQuery");
    expect(chat).toContain("saveAiraHistory.mutateAsync");
    expect(chat).toContain("remote.conversationId");
    expect(chat).toContain("mode: remote.mode");
  });

  it("menyediakan tombol Layanan Aira berikon forum di console Administrator", () => {
    expect(administratorEntry).toContain('name="forum"');
    expect(administratorEntry).toContain("Riwayat Layanan Aira");
    expect(administratorEntry).toContain('pathname: "/administrator-aira"');
  });
});
