import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("penghapusan Snapshot Global Administrator", () => {
  const router = fs.readFileSync(path.resolve(process.cwd(), "server/routers.ts"), "utf8");
  const screen = fs.readFileSync(path.resolve(process.cwd(), "app/administrator.tsx"), "utf8");

  it("menghapus status, tarik, dan simpan snapshot dari layar Administrator", () => {
    expect(screen).not.toContain("globalTestSnapshot");
    expect(screen).not.toContain("Tarik snapshot global");
    expect(screen).not.toContain("Simpan snapshot global");
  });

  it("menghapus endpoint Snapshot Global dari router server", () => {
    expect(router).not.toContain("globalTestSnapshot");
    expect(router).not.toContain("getGlobalTestSnapshot");
    expect(router).not.toContain("saveGlobalTestSnapshot");
  });

  it("menghapus helper penyimpanan snapshot global dari akses database aplikasi", () => {
    const db = fs.readFileSync(path.resolve(process.cwd(), "server/db.ts"), "utf8");
    expect(db).not.toContain("getGlobalTestSnapshot");
    expect(db).not.toContain("saveGlobalTestSnapshot");
  });
});
