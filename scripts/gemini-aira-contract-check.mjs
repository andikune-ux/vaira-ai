const models = ["gemini-3.5-flash-lite"];

async function main() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY belum tersedia.");

  const results = [];
  for (const model of models) {
    const startedAt = Date.now();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "Kamu adalah Aira. Balas JSON valid dengan field reply." }] },
        contents: [{ role: "user", parts: [{ text: "Jawab singkat: apakah kamu aktif?" }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 512 },
      }),
    });
    const payload = await response.json().catch(() => null);
    const text = payload?.candidates?.flatMap((candidate) => candidate?.content?.parts ?? []).map((part) => part?.text ?? "").join("\n").trim();
    results.push({ model, ok: response.ok && Boolean(text), status: response.status, ms: Date.now() - startedAt, response: text?.slice(0, 160) ?? "", error: payload?.error?.message ?? null });
  }
  console.log(JSON.stringify({ results }, null, 2));
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
