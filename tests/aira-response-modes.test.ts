import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

describe("sistem respons Aira", () => {
  it("menggunakan tiga identitas mode baru dengan Aira sebagai default", () => {
    const types = source("lib/finance/types.ts");
    const studio = source("app/developer-studio.tsx");
    expect(types).toContain('"aira" | "hot_pro" | "scientist"');
    expect(types).toContain('aiMode: "aira"');
    expect(studio).toContain("Aira Hot Pro 18+");
    expect(studio).toContain("Aira Ahli Ilmuan");
  });

  it("mengembalikan mode ke Aira Default ketika aplikasi kembali aktif", () => {
    const context = source("lib/finance/finance-context.tsx");
    expect(context).toContain('AppState.addEventListener("change"');
    expect(context).toContain('aiMode: "aira"');
    expect(context).toContain("normalizeModeScopes");
  });

  it("memisahkan pengaturan Aira Default ke Profil", () => {
    const settings = source("app/settings.tsx");
    const setting = source("app/aira-setting.tsx");
    expect(settings).toContain('label="Referensi Aira"');
    expect(settings).toContain('router.push("/aira-setting"');
    expect(setting).toContain("Pengaturan Referensi Aira");
    expect(setting).toContain('modeScopes: ["aira"]');
  });

  it("mengembalikan hanya ahli relevan dalam bubble terpisah tanpa meniru individu nyata", () => {
    const router = source("server/routers.ts");
    const chat = source("components/aira-chat-screen.tsx");
    expect(router).toContain("SCIENTIST_EXPERTS");
    expect(router).toContain("omit unrelated experts");
    expect(router).toContain("Do not imitate, claim to represent");
    expect(router).toContain("expertResponses");
    expect(chat).toContain("replaceCoordinatorWithExperts");
    expect(chat).toContain("expertMessages");
  });

  it("meminta respons JSON yang valid dan memakai model cadangan bila kandidat utama gagal", () => {
    const router = source("server/routers.ts");
    expect(router).toContain('response_format: { type: "json_object" as const }');
    expect(router).toContain("modelCandidates");
    expect(router).toContain("Model mengembalikan respons tanpa isi.");
    expect(router).toContain("Model candidate failed");
  });

  it("membuka mode khusus melalui pemilih PIN tersembunyi pada Daftar Riwayat Aira", () => {
    const studio = source("app/developer-studio.tsx");
    const selector = source("components/aira-mode-selector.tsx");
    const chat = source("components/aira-chat-screen.tsx");
    const navigation = source("components/aira-chat-navigation.tsx");
    expect(studio).not.toContain("setSpecialModeActive");
    expect(selector).toContain("createAiraModePin");
    expect(selector).toContain("verifyAiraModePin");
    expect(selector).toContain("Ubah PIN");
    expect(navigation).toContain("AiraModeSelector");
    expect(navigation).toContain("revealModeSelector");
    expect(navigation).toContain('accessibilityLabel="Pemicu rahasia mode Aira"');
    expect(navigation).toContain("next >= 11");
    expect(navigation).toContain("next >= 20");
    expect(chat).not.toContain("AiraModeSelector");
    expect(chat).not.toContain('accessibilityLabel="Buka pemilih mode Aira"');
  });

  it("membatasi PIN hanya untuk pemilih mode tersembunyi, bukan tindakan riwayat", () => {
    const settings = source("app/settings.tsx");
    const selector = source("components/aira-mode-selector.tsx");
    const chat = source("components/aira-chat-screen.tsx");
    expect(settings).not.toContain('router.push("/chat-privacy"');
    expect(selector).toContain("verifyAiraModePin");
    expect(chat).toContain("usesPrivateAiraMode ? <Pressable onPress={() => togglePrivate(conversation)}");
    expect(chat).toContain("void saveConversation({ ...conversation, isPrivate: !conversation.isPrivate");
    expect(chat).not.toContain("verifyChatPrivacyPin");
    expect(chat).toContain("Aira Default aktif");
  });
});
