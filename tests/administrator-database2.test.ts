import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const routerSource = fs.readFileSync(path.resolve(process.cwd(), "server/routers.ts"), "utf8");
const administratorSource = fs.readFileSync(path.resolve(process.cwd(), "app/administrator.tsx"), "utf8");
const database2Source = fs.readFileSync(path.resolve(process.cwd(), "app/administrator-database2.tsx"), "utf8");

describe("SERVER DATABASE 2", () => {
  it("adds an isolated second-server control without replacing legacy SERVER DATABASE", () => {
    expect(administratorSource).toContain("SERVER DATABASE 2");
    expect(administratorSource).toContain('router.push("/administrator-database2" as never)');
    expect(administratorSource).toContain("SERVER DATABASE");
  });

  it("uses a dedicated SERVER DATABASE 2 credential pair for verification and status", () => {
    expect(routerSource).toContain("verifyServerDatabase2Credentials");
    expect(routerSource).toContain("SERVER_DATABASE_2_USERNAME");
    expect(routerSource).toContain("SERVER_DATABASE_2_PASSWORD");
    expect(routerSource).toMatch(/database2:\s*router\(/);
    expect(routerSource).toContain("db.getServerDatabase2RecoveryStatus()");
  });

  it("states that primary sync is manual and recovered cloud metadata remains restricted", () => {
    expect(database2Source).toContain("Tidak ada sinkronisasi otomatis");
    expect(database2Source).toContain("Arsip AiraXCloud yang dipulihkan tetap dibatasi");
    expect(database2Source).toContain("Sesi lama serta token akses tidak dipindahkan");
  });
});
