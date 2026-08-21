import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("Gemini utama dan fallback Forge Aira", () => {
  it("mencoba Gemini 3.6 Flash sebelum daftar model Forge", () => {
    expect(router).toContain('const GEMINI_AIRA_MODEL = "gemini-3.6-flash"');
    expect(router).toContain("const GEMINI_AIRA_TIMEOUT_MS = 22_000");
    expect(router).toContain("async function invokeGeminiAira");
    expect(router).toContain('responseMimeType: "application/json"');
    expect(router).toContain("Gemini utama gagal; mencoba Forge");
    const chatProviderBlock = router.slice(router.indexOf("invokeGeminiAira(systemPrompt, messages)"));
    expect(chatProviderBlock.indexOf("const catalog = await listLLMModels()")).toBeGreaterThan(0);
  });
});
