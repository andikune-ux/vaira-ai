import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const routers = fs.readFileSync(path.resolve(__dirname, "../server/routers.ts"), "utf8");

describe("fallback Aira untuk percakapan berulang", () => {
  it("mengaktifkan cooldown setelah kuota Gemini dan tidak mengulang Gemini untuk pesan berikutnya", () => {
    expect(routers).toContain("GEMINI_QUOTA_COOLDOWN_MS = 5 * 60_000");
    expect(routers).toContain("geminiUnavailableUntil");
    expect(routers).toContain('GEMINI_AIRA_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"]');
    expect(routers).toContain("geminiPrimaryUnavailableUntil");
    expect(routers).toContain("GEMINI_AIRA_MODELS.slice(1)");
    expect(routers).toContain("Gemini dilewati selama cooldown kuota");
    expect(routers).toContain("isGeminiQuotaError(geminiError)");
    expect(routers).toContain("if (!parsed && !geminiQuotaExceeded)");
  });

  it("memiliki fallback cepat dengan batas katalog dan maksimal dua kandidat model", () => {
    expect(routers).toContain("withServiceTimeout(listLLMModels(), 4_000");
    expect(routers).toContain("modelCandidates.slice(0, 2)");
    expect(routers).toContain("gpt-5-mini");
  });
});
