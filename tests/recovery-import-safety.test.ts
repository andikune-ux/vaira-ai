import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const prepareScript = fs.readFileSync(path.resolve(process.cwd(), "scripts/prepare-recovery-import.mjs"), "utf8");
const applyScript = fs.readFileSync(path.resolve(process.cwd(), "scripts/apply-recovery-import.mjs"), "utf8");
const cloudScript = fs.readFileSync(path.resolve(process.cwd(), "scripts/import-restricted-cloud-metadata.mjs"), "utf8");

describe("SERVER DATABASE 2 recovery safeguards", () => {
  it("keeps legacy sessions, raw access tokens, cloud objects, schema, and migrations out of the data-only import", () => {
    expect(prepareScript).toContain('"manualAccounts"');
    expect(prepareScript).not.toContain('"manualAccountSessions",');
    expect(prepareScript).not.toContain('"airaAccessTokens",');
    expect(prepareScript).not.toContain('"airaxCloudBackups",');
    expect(prepareScript).not.toContain('"__drizzle_migrations",');
    expect(prepareScript).toContain("no DROP TABLE, CREATE TABLE, ALTER TABLE, sessions, cloud objects, access tokens, or migrations");
  });

  it("requires empty standby tables and rolls back a failed data import", () => {
    expect(applyScript).toContain("tabel standby tidak kosong");
    expect(applyScript).toContain("await connection.beginTransaction()");
    expect(applyScript).toContain("await connection.rollback()");
    expect(applyScript).toContain("legacyServerTouched: false");
    expect(applyScript).toContain("sessionsImported: false");
  });

  it("imports cloud metadata only under restricted status until storage is verified", () => {
    expect(cloudScript).toContain("airaxCloudBackups");
    expect(cloudScript).toContain("SET `status` = 'restricted'");
    expect(cloudScript).toContain("cloudObjectsImported: false");
  });
});
