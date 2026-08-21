import { describe, expect, it } from "vitest";

import { canEnableGlobalRoomAudio, createUnavailableGlobalRoomAudioAdapter } from "../lib/global-room-audio";

describe("Global Room audio safety adapter", () => {
  it("remains unavailable without a provider", async () => {
    const adapter = createUnavailableGlobalRoomAudioAdapter();
    expect(adapter.provider).toBeNull();
    expect(adapter.state).toBe("unavailable");
    await adapter.join();
    expect(adapter.state).toBe("unavailable");
  });

  it("requires a non-empty provider name", () => {
    expect(canEnableGlobalRoomAudio(null)).toBe(false);
    expect(canEnableGlobalRoomAudio("  ")).toBe(false);
    expect(canEnableGlobalRoomAudio("reviewed-provider")).toBe(true);
  });
});


describe("Room Obrolan Global baru", () => {
  it("memusatkan kontrol audio dan tidak memuat media room", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("app/global-room-chat.tsx", "utf8"));
    expect(source).toContain("Matikan mic Room Global");
    expect(source).toContain("Nyalakan speaker Room Global");
    expect(source).not.toContain(">Mikrofon saya</Text>");
    expect(source).not.toContain(">Speaker global</Text>");
    expect(source).not.toContain("Percakapan publik server-side");
    expect(source).toContain("Room Obrolan Global");
    expect(source).toContain("compactStatus");
    expect(source).toContain("statusAudioControls");
    expect(source).toContain("statusAudioButton");
    expect(source).not.toContain("Mic aktif");
    expect(source).not.toContain("Mic mati");
    expect(source).not.toContain(">Peserta audio</Text>");
    expect(source).toContain("meet.jit.si/VAIRA-AI-Global-");
    expect(source).toContain("Buka uji Jitsi publik");
    expect(source).toContain("Provider audio belum aktif, coba periksa ulang");
    expect(source).toContain("requestRecordingPermissionsAsync");
    expect(source).toContain("Izin mikrofon diperlukan");
    expect(source).not.toContain("launchCameraAsync");
    expect(source).toContain("launchImageLibraryAsync");
    expect(source).not.toContain("screenShare");
  });
});


describe("Room Global audio interaction", () => {
  it("menangani izin mikrofon ditolak dan rekaman tanpa URI", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("app/global-room-chat.tsx", "utf8"));
    expect(source).toContain("if (!permission.granted)");
    expect(source).toContain("if (!uri) throw new Error");
    expect(source).toContain("recordingDuration");
    expect(source).toContain("Voice note audio=");
    expect(source).toContain("createVoiceUpload");
    expect(source).toContain("TRANSCRIBE_INLINE_MAX_BYTES");
    expect(source).toContain("Laporkan pesan?");
  });
});


describe("Room Global compact chat layout", () => {
  it("menjaga komposer, peserta ringkas, dan pengaturan bubble tetap terhubung", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("app/global-room-chat.tsx", "utf8"));
    expect(source).toContain("Kirim pesan Room Global");
    expect(source).toContain("Rekam voice note");
    expect(source).toContain("compactSpeakerTile");
    expect(source).toContain("audioPresenceRow");
    expect(source).toContain("power-settings-new");
    expect(source).toContain("Keluar dari Room Global");
    expect(source).toContain("messageListFlex");
    expect(source).toContain("effectiveBubbleScale");
    expect(source).toContain("effectiveBubbleGap");
    expect(source).toContain("Geser ukuran bubble");
    expect(source).toContain("Geser jarak antar bubble");
    expect(source).toContain("people");
    expect(source).toContain("Pesan terbaru");
    expect(source).toContain("Reset pengaturan tampilan pesan");
    expect(source).toContain("saveUserRoomSettings");
    expect(source).toContain("vaira.global-room.bubble.${settingsMode}");
    expect(source).toContain("Tampilan pesan · {isAdminMode ? \"Administrator\" : \"Pengguna\"}");
  });
});

describe("Room Global synced preferences", () => {
  it("memiliki endpoint penyimpanan preferensi per akun", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("server/routers.ts", "utf8"));
    expect(source).toContain("userSettings:");
    expect(source).toContain("saveUserSettings:");
    expect(source).toContain("audioLabelsVisible");
  });
});

describe("Room Global safe defaults", () => {
  it("memulai mic dan speaker dalam keadaan off serta mengekspos durasi voice note", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("app/global-room-chat.tsx", "utf8"));
    expect(source).toContain("useState(false)");
    expect(source).toContain("Merekam ${recordingDuration}s");
  });
});

describe("Room Global social communication additions", () => {
  it("keeps native audio upload, playback, and message search connected", async () => {
    const chat = await import("node:fs/promises").then((fs) => fs.readFile("app/global-room-chat.tsx", "utf8"));
    const router = await import("node:fs/promises").then((fs) => fs.readFile("server/routers.ts", "utf8"));
    expect(chat).toContain("VoiceNotePlayer");
    expect(chat).toContain("searchQuery");
    expect(chat).toContain("visibleMessages");
    expect(router).toContain("upload: publicProcedure");
    expect(router).toContain("global-room/voice/");
  });
});

describe("Room Global photo posts and mention widget", () => {
  it("keeps photo posting and unread mention indicator connected", async () => {
    const chat = await import("node:fs/promises").then((fs) => fs.readFile("app/global-room-chat.tsx", "utf8"));
    const home = await import("node:fs/promises").then((fs) => fs.readFile("app/(tabs)/index.tsx", "utf8"));
    const router = await import("node:fs/promises").then((fs) => fs.readFile("server/routers.ts", "utf8"));
    expect(chat).toContain("postRoomPhoto");
    expect(chat).toContain("Room photo url=");
    expect(home).toContain("unreadMentionCount");
    expect(home).toContain("widgetMentionBadge");
    expect(router).toContain("mentionSummary");
    expect(router).toContain("uploadPhoto");
  });
});

describe("Room Global social controls without DM", () => {
  it("exposes photo, reactions, and short status while keeping DM out", async () => {
    const chat = await import("node:fs/promises").then((fs) => fs.readFile("app/global-room-chat.tsx", "utf8"));
    const profile = await import("node:fs/promises").then((fs) => fs.readFile("app/global-room-public-profile.tsx", "utf8"));
    const router = await import("node:fs/promises").then((fs) => fs.readFile("server/routers.ts", "utf8"));
    const schema = await import("node:fs/promises").then((fs) => fs.readFile("drizzle/schema.ts", "utf8"));
    expect(chat).toContain("Bagikan foto di Room Global");
    expect(chat).toContain("reactionOptions");
    expect(chat).toContain("Atur status singkat Room Global");
    expect(profile).toContain("statusPill");
    expect(router).toContain("saveUserStatus");
    expect(router).toContain("reactions:");
    expect(schema).toContain("globalRoomMessageReactions");
    expect(schema).toContain("globalRoomUserStatus");
  });
});

describe("Room Global administrator pinned message", () => {
  it("keeps pinning protected and visible as a pinned card", async () => {
    const chat = await import("node:fs/promises").then((fs) => fs.readFile("app/global-room-chat.tsx", "utf8"));
    const router = await import("node:fs/promises").then((fs) => fs.readFile("server/routers.ts", "utf8"));
    const schema = await import("node:fs/promises").then((fs) => fs.readFile("drizzle/schema.ts", "utf8"));
    expect(chat).toContain("Sematkan pesan");
    expect(chat).toContain("Buka pesan yang disematkan");
    expect(chat).toContain("isAdminMode ? <Pressable");
    expect(router).toContain("adminPinMessage");
    expect(router).toContain("Verifikasi administrator diperlukan.");
    expect(schema).toContain("pinnedAt");
    expect(schema).toContain("pinnedBy");
  });
});

describe("Room Global mass delete and wallet catalog", () => {
  it("keeps mass deletion administrator-only with confirmation and audit", async () => {
    const router = await import("node:fs/promises").then((fs) => fs.readFile("server/routers.ts", "utf8"));
    const settings = await import("node:fs/promises").then((fs) => fs.readFile("app/administrator-room-settings.tsx", "utf8"));
    const db = await import("node:fs/promises").then((fs) => fs.readFile("server/db.ts", "utf8"));
    expect(router).toContain("adminDeleteAllMessages");
    expect(router).toContain("HAPUS SEMUA PESAN");
    expect(router).toContain("Semua pesan Room Global dihapus");
    expect(settings).toContain("Hapus semua pesan");
    expect(db).toContain("deleteAllGlobalRoomMessagesByAdmin");
  });

  it("keeps the wallet catalog additive and supports manual selection", async () => {
    const wallets = await import("node:fs/promises").then((fs) => fs.readFile("app/wallets.tsx", "utf8"));
    expect(wallets).toContain("Bank Sinarmas");
    expect(wallets).toContain("Superbank");
    expect(wallets).toContain("Pilih manual / isi sendiri");
    expect(wallets).toContain("Saldo awal");
    expect(wallets).toContain("Nomor rekening/akun");
  });
});
