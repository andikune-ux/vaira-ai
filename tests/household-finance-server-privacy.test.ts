import { describe, expect, it } from "vitest";
import fs from "node:fs";

const schema = fs.readFileSync("drizzle/schema.ts", "utf8");
const database = fs.readFileSync("server/db.ts", "utf8");
const router = fs.readFileSync("server/routers.ts", "utf8");

describe("privasi hasil Perencana Rumah Tangga di server", () => {
  it("menyimpan ringkasan analisis pada tabel khusus tanpa kolom profil kesehatan mentah", () => {
    const table = schema.slice(schema.indexOf('export const householdFinanceAnalyses'), schema.indexOf('export type HouseholdFinanceAnalysis'));
    expect(table).toContain("accountId");
    expect(table).toContain("resultJson");
    expect(table).not.toContain("heightCm");
    expect(table).not.toContain("weightKg");
    expect(table).not.toContain("allergies");
  });

  it("menolak payload sensitif dan membatasi hapus ke accountId pemilik", () => {
    expect(database).toContain("sanitizeHouseholdAnalysisPayload");
    expect(database).toContain("heightCm|weightKg|allergies");
    expect(database).toContain("deleteHouseholdFinanceAnalysisForAccount(id: number, accountId: number)");
    expect(database).toContain("and(eq(householdFinanceAnalyses.id, id), eq(householdFinanceAnalyses.accountId, accountId))");
    const householdRouter = router.slice(router.indexOf("householdFinance: router"), router.indexOf("spca: router"));
    expect(householdRouter).toContain("requireManualAccount(ctx.req)");
    expect(householdRouter).toContain("listHouseholdFinanceAnalysesForAccount(account.id)");
  });
});
