import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("Aira service availability messaging", () => {
  it("distinguishes upstream limits from connectivity and session failures", () => {
    expect(source).toContain("UPSTREAM_LIMIT");
    expect(source).toContain("AI_UNAVAILABLE");
    expect(source).toContain("AIRA_MODEL_TIMEOUT_MS");
    expect(source).toContain("withServiceTimeout(invokeLLM");
    expect(source).toContain("batas penggunaan layanan tercapai");
    expect(source).toContain("Layanan AI utama belum merespons dalam batas waktu aman");
  });
});
