import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envSource = readFileSync(resolve(process.cwd(), "server/_core/env.ts"), "utf8");
const llmSource = readFileSync(resolve(process.cwd(), "server/_core/llm.ts"), "utf8");

describe("Aira provider failover", () => {
  it("supports a self-host primary and a server-side backup configuration", () => {
    expect(envSource).toContain("AIRA_SELF_HOST_API_URL");
    expect(envSource).toContain("AIRA_SELF_HOST_MODEL");
    expect(envSource).toContain("AIRA_BACKUP_API_URL");
    expect(envSource).toContain("AIRA_BACKUP_MODEL");
  });

  it("orders self-host before backup and Forge", () => {
    expect(llmSource.indexOf('name: "self-host"')).toBeLessThan(llmSource.indexOf('name: "backup"'));
    expect(llmSource.indexOf('name: "backup"')).toBeLessThan(llmSource.indexOf('name: "forge"'));
    expect(llmSource).toContain("switching provider");
    expect(llmSource).toContain("Semua provider Aira tidak tersedia");
  });
});

