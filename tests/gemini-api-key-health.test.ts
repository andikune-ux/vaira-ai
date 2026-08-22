import { describe, expect, it } from "vitest";

describe("Gemini API key health", () => {
  const isQuotaLimited = (message?: string) => /quota|rate.limit|resource.*exhausted/i.test(message ?? "");
  it("mengakses katalog model resmi menggunakan secret backend", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey).toBeTruthy();

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
      headers: { "x-goog-api-key": apiKey! },
    });
    const body = await response.json() as { models?: Array<{ name?: string }>; error?: { message?: string } };

    expect(response.ok || isQuotaLimited(body.error?.message), body.error?.message ?? "Gemini menolak health check.").toBe(true);
    if (!response.ok) return;
    expect(Array.isArray(body.models)).toBe(true);
    expect(body.models?.some((model) => typeof model.name === "string" && model.name.startsWith("models/"))).toBe(true);
  }, 20_000);

  it("menghasilkan JSON singkat melalui Gemini 3.6 Flash", async () => {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Balas JSON saja dengan tepat: {\"reply\":\"ok\"}" }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 512 },
      }),
    });
    const body = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
    expect(response.ok || isQuotaLimited(body.error?.message), body.error?.message ?? "Gemini tidak menghasilkan respons.").toBe(true);
    if (!response.ok) return;
    const text = body.candidates?.flatMap((candidate) => candidate.content?.parts ?? []).map((part) => part.text ?? "").join("\n");
    expect(text).toContain('"reply":"ok"');
  }, 30_000);

  it("menghasilkan kontrak JSON Aira yang dapat diparse backend", async () => {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "Anda adalah Aira. Kembalikan JSON dengan reply string, expertResponses array, suggestedTransaction null, dan suggestedMemory null." }] },
        contents: [{ role: "user", parts: [{ text: "Sapa saya singkat dalam bahasa Indonesia." }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 1024 },
      }),
    });
    const body = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
    expect(response.ok || isQuotaLimited(body.error?.message), body.error?.message ?? "Gemini tidak menghasilkan kontrak Aira.").toBe(true);
    if (!response.ok) return;
    const text = body.candidates?.flatMap((candidate) => candidate.content?.parts ?? []).map((part) => part.text ?? "").join("\n") ?? "";
    const payload = JSON.parse(text) as { reply?: unknown; expertResponses?: unknown; suggestedTransaction?: unknown; suggestedMemory?: unknown };
    expect(typeof payload.reply).toBe("string");
    expect(Array.isArray(payload.expertResponses)).toBe(true);
    expect(payload.suggestedTransaction).toBeNull();
    expect(payload.suggestedMemory).toBeNull();
  }, 35_000);
});
