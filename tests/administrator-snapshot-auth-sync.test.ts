import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("administrator snapshot auth sync", () => {
  const router = fs.readFileSync(path.resolve(process.cwd(), "server/routers.ts"), "utf8");
  const screen = fs.readFileSync(path.resolve(process.cwd(), "app/administrator.tsx"), "utf8");

  it("uses explicit administrator credentials for snapshot status", () => {
    expect(router).toMatch(/globalTestSnapshot:\s*router\(\{[\s\S]*?status:\s*publicProcedure/);
    expect(router).toMatch(/status:\s*publicProcedure[\s\S]*?verifyAdministratorCredentials\(input\.username, input\.password\)/);
    expect(screen).toMatch(/globalTestSnapshot\.status\.useQuery\(\{ username, password \}/);
  });

  it("uses explicit administrator credentials for snapshot push and stores as admin identity", () => {
    expect(router).toMatch(/globalTestSnapshot:[\s\S]*?push:\s*publicProcedure/);
    expect(router).toMatch(/push:\s*publicProcedure[\s\S]*?verifyAdministratorCredentials\(input\.username, input\.password\)/);
    expect(router).toMatch(/saveGlobalTestSnapshot\(0, input\.payload\)/);
  });

  it("keeps guest pull contract unchanged", () => {
    expect(router).toMatch(/pull:\s*publicProcedure\.query\(async \(\) =>/);
    expect(fs.readFileSync(path.resolve(process.cwd(), "components/global-test-sync.tsx"), "utf8")).toMatch(/globalTestSnapshot\.pull\.useQuery\(undefined/);
  });
});
