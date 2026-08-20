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
    expect(settings).toContain('label="Aira Setting"');
    expect(settings).toContain('router.push("/aira-setting"');
    expect(setting).toContain("Pengaturan khusus Aira Default");
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

  it("menyediakan sakelar eksplisit untuk mengaktifkan mode khusus", () => {
    const studio = source("app/developer-studio.tsx");
    expect(studio).toContain("setSpecialModeActive");
    expect(studio).toContain("Mode aktif saat ini");
    expect(studio).toContain('aiMode: enabled ? mode : "aira"');
  });

  it("membatasi menu dan kunci PIN riwayat pada dua mode khusus", () => {
    const settings = source("app/settings.tsx");
    const privacy = source("app/chat-privacy.tsx");
    const chat = source("components/aira-chat-screen.tsx");
    expect(settings).toContain('profile.aiMode === "hot_pro" || profile.aiMode === "scientist"');
    expect(privacy).toContain('state.profile.aiMode === "hot_pro" || state.profile.aiMode === "scientist"');
    expect(privacy).toContain("PIN tidak diperlukan");
    expect(chat).toContain("usesPrivateAiraMode ? <Pressable onPress={() => togglePrivate(conversation)}");
    expect(chat).toContain("Aira Default aktif");
  });
});
