import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url).pathname, "utf8");

describe("generasi konten Aira dari server Manus", () => {
  it("menyediakan endpoint gambar dan dokumen dengan sesi manual yang wajib", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("generateAsset: publicProcedure");
    expect(router).toContain('z.enum(["image", "pdf", "word", "powerpoint", "excel", "markdown", "text"])');
    expect(router).toContain("await requireManualAccount(ctx.req)");
    expect(router).toContain("generateImage({ prompt");
    expect(router).toContain('quality: z.enum(["medium", "high"])');
    expect(router).toContain("quality: input.quality");
    expect(router).toContain("generateAiraDocument");
  });

  it("membangun PDF, Word, PowerPoint, Excel, Markdown, dan teks sebelum menyimpan hasil", () => {
    const generator = read("server/aira-generation.ts");
    ["buildPdf", "buildWord", "buildPowerPoint", "buildExcel", "storagePut", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].forEach((token) => expect(generator).toContain(token));
  });

  it("menampilkan panel buat konten dan memasukkan hasilnya ke percakapan aktif", () => {
    const panel = read("components/aira-generation-panel.tsx");
    const chat = read("components/aira-chat-screen.tsx");
    expect(panel).toContain("trpc.ai.generateAsset.useMutation");
    expect(panel).toContain("Buat dengan Aira");
    expect(chat).toContain("subscribeAiraGeneratedAssets");
    expect(panel).toContain("Hasil buatan Aira sudah selesai dan masuk ke percakapan");
    expect(panel).toContain("Resolusi gambar");
    expect(panel).toContain("quality, setQuality");
    expect(panel).toContain("Menyiapkan permintaan");
    expect(panel).toContain("Membuat hasil");
    expect(panel).toContain("Progres bersifat perkiraan");
    expect(panel).toContain("Coba buat lagi");
    expect(panel).toContain("Estimasi sisa waktu");
    expect(panel).toContain("Riwayat Proses Aira");
    expect(panel).toContain("notifyAiraGenerationCompletion");
  });

  it("mengembalikan signed URL storage untuk hasil gambar agar dapat dirender klien", () => {
    const generator = read("server/_core/imageGeneration.ts");
    expect(generator).toContain("storageGetSignedUrl");
    expect(generator).toContain("const stored = await storagePut");
    expect(generator).toContain("const url = await storageGetSignedUrl(stored.key)");
  });

  it("menghasilkan konten langsung dari text box dan menyimpan bubble hasil pada riwayat", () => {
    const router = read("server/routers.ts");
    const chat = read("components/aira-chat-screen.tsx");
    expect(router).toContain("toPublicAssetUrl(ctx.req, result.url)");
    expect(chat).toContain("detectGenerationRequest");
    expect(chat).toContain("Aira sedang membuat");
    expect(chat).toContain("generateAsset.mutateAsync");
    expect(chat).toContain("saveQueue.current");
    expect(chat).toContain("Hasil belum dapat dibuat");
  });

  it("menjaga akses signed URL untuk hasil dokumen", () => {
    const generator = read("server/aira-generation.ts");
    expect(generator).toContain("storageGetSignedUrl");
    expect(generator).toContain("const url = await storageGetSignedUrl(stored.key)");
    expect(generator).toContain("return { ...meta, url");
  });

  it("menampilkan fallback dan tombol muat ulang ketika gambar bubble gagal dimuat", () => {
    const preview = read("components/chat-media-preview.tsx");
    expect(preview).toContain("Gambar belum dapat dimuat");
    expect(preview).toContain("Muat ulang gambar hasil Aira");
    expect(preview).toContain("setAttempt((value) => value + 1)");
    expect(preview).toContain('onError={() => setFailed(true)}');
  });

  it("membuat nama unduhan dokumen berdasarkan MIME type", () => {
    const actions = read("lib/aira-generated-result-actions.ts");
    expect(actions).toContain("safeFileName(label, mimeType)");
    expect(actions).toContain("mimeType.includes(\"word\") ? \"docx\"");
    expect(actions).toContain("mimeType.includes(\"presentation\") ? \"pptx\"");
    expect(actions).toContain("mimeType.includes(\"spreadsheet\") ? \"xlsx\"");
  });

  it("menampilkan pratinjau, unduh, dan generate ulang dari metadata hasil", () => {
    const preview = read("components/chat-media-preview.tsx");
    const panel = read("components/aira-generation-panel.tsx");
    expect(preview).toContain("Pratinjau");
    expect(preview).toContain("Unduh");
    expect(preview).toContain("Bagikan");
    expect(preview).toContain("generate.mutateAsync");
    expect(preview).toContain("generationPrompt");
    expect(panel).toContain("generationKind: kind");
  });

  it("menyimpan galeri terpisah menurut scope akun dan menyediakan tindakan hasil", () => {
    const types = read("lib/finance/types.ts");
    const context = read("lib/finance/finance-context.tsx");
    const gallery = read("components/aira-results-gallery.tsx");
    const panel = read("components/aira-generation-panel.tsx");
    const chat = read("components/aira-chat-screen.tsx");
    const exports = read("lib/finance/report-export.ts");
    const cloud = read("app/airax-cloud.tsx");
    const settings = read("app/settings.tsx");
    const templates = read("components/aira-prompt-templates.tsx");
    const comparison = read("components/aira-ab-compare.tsx");
    const preview = read("components/chat-media-preview.tsx");
    const reminders = read("lib/reminders.ts");
    const queueControl = read("components/aira-generation-queue-control.tsx");
    const modePalette = read("lib/aira-mode-presentation.ts");
    const modeContext = read("lib/aira-mode-context.tsx");
    const home = read("app/(tabs)/index.tsx");
    const modePreview = read("components/aira-mode-theme-preview.tsx");
    const modeStatus = read("components/aira-mode-status-card.tsx");
    const airaUi = read("components/aira-ui.tsx");
    const developerStudio = read("app/developer-studio.tsx");
    const tabLayout = read("app/(tabs)/_layout.tsx");
    expect(types).toContain("AiraGeneratedResult");
    expect(types).toContain("generatedResults: AiraGeneratedResult[]");
    expect(context).toContain("saveGeneratedResult");
    expect(context).toContain("storageKeyFor(scope)");
    expect(context).toContain("retainedGeneratedResults");
    expect(gallery).toContain("Galeri Hasil Aira");
    expect(gallery).toContain("shareGeneratedResult");
    expect(gallery).toContain("Cari prompt, koleksi, atau nama hasil");
    expect(gallery).toContain('label: "Gambar"');
    expect(gallery).toContain("Maksimum {AIRAX_GENERATED_RESULTS_MAX} hasil per akun");
    expect(gallery).toContain('label: "Favorit"');
    expect(gallery).toContain('label: "Terbaru"');
    expect(gallery).toContain("Pilih semua");
    expect(gallery).toContain("shareGeneratedResults");
    expect(types).toContain("AIRAX_GENERATED_RESULTS_RETENTION_DAYS = 90");
    expect(types).toContain("AIRAX_GENERATED_RESULTS_MAX = 200");
    expect(types).toContain("isFavorite?: boolean");
    expect(context).toContain("updateGeneratedResult");
    expect(context).toContain("removeGeneratedResults");
    expect(context).toContain("addGeneratedResultCollection");
    expect(context).toContain("assignGeneratedResultsToCollection");
    expect(context).toContain("recordGenerationActivity");
    expect(context).toContain("clearGenerationActivities");
    expect(types).toContain("AiraGeneratedResultCollection");
    expect(types).toContain("AiraGenerationActivity");
    expect(types).toContain("generationNotificationsEnabled: boolean");
    expect(settings).toContain("Notifikasi hasil generasi Aira");
    expect(panel).toContain("state.profile.generationNotificationsEnabled");
    expect(templates).toContain("Template prompt Aira");
    expect(comparison).toContain("Perbandingan hasil A/B");
    expect(preview).toContain("Edit cepat gambar");
    expect(preview).toContain("ImageManipulator.manipulateAsync");
    expect(reminders).toContain("GENERATION_NOTIFICATION_CATEGORY");
    expect(reminders).toContain("configureGenerationNotificationActions");
    expect(context).toContain("enqueueGeneration");
    expect(context).toContain("removeQueuedGeneration");
    expect(panel).toContain("Permintaan dimasukkan ke antrean");
    expect(panel).toContain("generationCancelled");
    expect(queueControl).toContain("Batalkan");
    expect(queueControl).toContain("Antrean Generasi Aira");
    expect(home).toContain("generasi menunggu");
    expect(modeContext).toContain("AiraModeProvider");
    expect(modePalette).toContain("palette: base");
    expect(modePalette).toContain('primary: "#DB2777"');
    expect(modePalette).toContain('primary: "#15803D"');
    expect(modePreview).toContain("Pratinjau tema Aira");
    expect(modePreview).toContain("Aksen");
    expect(modeStatus).toContain("aktif");
    expect(modeStatus).toContain("Target terdekat");
    expect(modeStatus).toContain("Tagihan terdekat");
    expect(modeStatus).toContain("modeBadge");
    expect(modeStatus).toContain("psychology");
    expect(airaUi).toContain("minHeight: 86");
    expect(home).toContain('kicker: "AIRA HOT PRO 18+"');
    expect(home).toContain('kicker: "AIRA AHLI ILMUAN"');
    expect(home).toContain('kicker: "AIRA SIAP MEMBANTU"');
    expect(home).toContain("hero.icon");
    expect(home).toContain("modeHeroDetails");
    expect(developerStudio).toContain("Keterangan kartu utama Aira");
    expect(modeStatus).toContain("LayoutAnimation");
    expect(tabLayout).toContain("airaTabLabel");
    expect(gallery).toContain("collectionAccents");
    expect(gallery).toContain("aksen visual khusus");
    expect(home).toContain("AiraModeStatusCard");
    expect(gallery).toContain("Koleksi Galeri");
    expect(gallery).toContain("exportExcelGeneratedResults");
    expect(gallery).toContain("exportPdfGeneratedResults");
    expect(exports).toContain("exportExcelGeneratedResults");
    expect(exports).toContain("exportPdfGeneratedResults");
    expect(cloud).toContain("Galeri Hasil Aira termasuk favorit dan koleksi");
    expect(chat).toContain("saveGeneratedResult");
  });
});
