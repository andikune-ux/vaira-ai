import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("sinkronisasi bukti transaksi per akun", () => {
  it("memiliki endpoint upload privat dan snapshot finance akun manual", () => {
    const router = read("server/routers.ts");
    const db = read("server/db.ts");
    expect(router).toContain("uploadProof: publicProcedure");
    expect(router).toContain("finance-proofs/${account.id}/");
    expect(router).toContain("db.saveManualFinanceSnapshot(account.id, input.payload)");
    expect(db).toContain("manualFinanceSnapshots");
  });

  it("mengunggah bukti lokal sebelum konfirmasi dan mem-push state akun", () => {
    const confirm = read("app/confirm-transaction.tsx");
    const finance = read("lib/finance/finance-context.tsx");
    expect(confirm).toContain("uploadProof.mutateAsync");
    expect(confirm).toContain("proofUri = uploaded.storageKey");
    expect(finance).toContain("financePull = trpc.manualAccount.finance.pull.useQuery");
    expect(finance).toContain("financePush.mutateAsync");
  });

  it("menghapus URI file lokal dari payload remote yang tidak dapat dipulihkan", () => {
    const router = read("server/routers.ts");
    expect(router).toContain('/^(?:file|blob|content|ph|data):/i.test(uri)');
    expect(router).toContain("storageGetSignedUrl(key)");
  });
});
