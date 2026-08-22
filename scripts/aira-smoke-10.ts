import { invokeLLM, listLLMModels } from "../server/_core/llm";

async function main() {
const catalog = await listLLMModels();
const model = catalog.data.find((item) => item.id === "gpt-5-mini")?.id ?? catalog.data[0]?.id;
if (!model) throw new Error("Tidak ada model fallback yang tersedia.");

const prompts = [
  "Halo Aira, jawab singkat: apakah kamu aktif?",
  "Aira, sebutkan satu manfaat membuat daftar tugas.",
  "Aira, buat satu kalimat motivasi pagi.",
  "Aira, apa arti menabung secara sederhana?",
  "Aira, sebutkan satu cara mengatur waktu.",
  "Aira, jawab singkat dalam bahasa Indonesia: apa itu prioritas?",
  "Aira, buat satu contoh catatan pengeluaran.",
  "Aira, sebutkan satu langkah menjaga keamanan akun.",
  "Aira, ringkas manfaat mencatat transaksi dalam satu kalimat.",
  "Aira, tutup percakapan dengan salam singkat.",
];

const results: Array<Record<string, unknown>> = [];
for (const [index, prompt] of prompts.entries()) {
  const startedAt = Date.now();
  try {
    const response = await invokeLLM({
      model,
      messages: [
        { role: "system", content: "Kamu adalah Aira, asisten singkat dan ramah. Jawab dalam bahasa Indonesia." },
        { role: "user", content: prompt },
      ],
      maxTokens: 120,
    });
    const content = response.choices[0]?.message?.content;
    results.push({ nomor: index + 1, ok: Boolean(content), ms: Date.now() - startedAt, model: response.model, response: typeof content === "string" ? content.slice(0, 180) : "" });
  } catch (error) {
    results.push({ nomor: index + 1, ok: false, ms: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) });
  }
}

console.log(JSON.stringify({ model, total: results.length, berhasil: results.filter((item) => item.ok).length, gagal: results.filter((item) => !item.ok).length, results }, null, 2));
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
