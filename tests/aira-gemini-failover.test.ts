import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("Gemini utama dan fallback Aira", () => {
  it("mencoba tiga model Gemini berurutan sebelum fallback provider lain", () => {
    expect(router).toContain('const GEMINI_AIRA_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"]');
    expect(router).toContain("const GEMINI_AIRA_TIMEOUT_MS = 22_000");
    expect(router).toContain("async function invokeGeminiAira");
    expect(router).toContain('responseMimeType: "application/json"');
    expect(router).toContain("Gemini ${model} gagal; mencoba model Gemini berikutnya.");
    expect(router).toContain("geminiQuotaExceeded = true");
    const fallbackStart = router.indexOf("if (!parsed && !geminiQuotaExceeded)");
    expect(fallbackStart).toBeGreaterThan(0);
    expect(router.indexOf("const catalog = await withServiceTimeout(listLLMModels()", fallbackStart)).toBeGreaterThan(fallbackStart);
  });
});
