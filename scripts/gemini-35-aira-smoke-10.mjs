const prompts = [
  "Halo Aira, apakah kamu aktif?",
  "Sebutkan satu manfaat daftar tugas.",
  "Buat satu kalimat motivasi pagi.",
  "Apa arti menabung secara sederhana?",
  "Sebutkan satu cara mengatur waktu.",
  "Apa arti prioritas?",
  "Buat satu contoh catatan pengeluaran.",
  "Sebutkan satu langkah menjaga keamanan akun.",
  "Ringkas manfaat mencatat transaksi.",
  "Tutup percakapan dengan salam singkat.",
];

async function main() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY belum tersedia.");

  const results = [];
  for (const [index, prompt] of prompts.entries()) {
    const startedAt = Date.now();
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "Kamu adalah Aira. Balas JSON valid dengan field reply. Jawab singkat dalam bahasa Indonesia." }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 512 },
      }),
    });
    const payload = await response.json().catch(() => null);
    const text = payload?.candidates?.flatMap((candidate) => candidate?.content?.parts ?? []).map((part) => part?.text ?? "").join("\n").trim();
    let reply = "";
    try { reply = JSON.parse(text || "{}").reply || ""; } catch { reply = ""; }
    results.push({ nomor: index + 1, ok: response.ok && Boolean(reply), status: response.status, ms: Date.now() - startedAt, reply: reply.slice(0, 120), error: payload?.error?.message ?? null });
  }
  console.log(JSON.stringify({ total: results.length, berhasil: results.filter((item) => item.ok).length, gagal: results.filter((item) => !item.ok).length, results }, null, 2));
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
