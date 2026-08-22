import { describe, expect, it } from "vitest";

describe("kredensial OCR.Space", () => {
  it("dapat mengakses endpoint OCR online dengan API key yang tersimpan", async () => {
    const apiKey = process.env.OCR_SPACE_API_KEY;
    expect(apiKey).toBeTruthy();

    const body = new URLSearchParams({
      url: "https://dl.a9t9.com/ocr/solarcell.jpg",
      language: "eng",
      isOverlayRequired: "false",
      OCREngine: "2",
    });
    let response: Response | null = null;
    let lastError: unknown;
    for (let attempt = 0; attempt < 3 && !response; attempt += 1) {
      try {
        response = await fetch("https://api.ocr.space/parse/image", {
          method: "POST",
          headers: {
            apikey: apiKey as string,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
          signal: AbortSignal.timeout(20_000),
        });
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
      }
    }
    if (!response) throw lastError;
    expect(response.ok).toBe(true);
    const payload = await response.json() as { IsErroredOnProcessing?: boolean; ParsedResults?: unknown[] };
    expect(payload.IsErroredOnProcessing).not.toBe(true);
    expect(payload.ParsedResults?.length).toBeGreaterThan(0);
  }, 65_000);
});
