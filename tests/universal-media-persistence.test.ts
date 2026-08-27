import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("Universal Media Persistence", () => {
  it("menyimpan foto dan voice note Room Global dengan storageKey", () => {
    const screen = read("app/global-room-chat.tsx");
    const server = read("server/db.ts");
    expect(screen).toContain("[Room photo key=${ticket.storageKey}]");
    expect(screen).toContain("[Voice note key=${ticket.storageKey}");
    expect(screen).toContain("mediaStorageKey: ticket.storageKey");
    expect(server).toContain("const mediaUrl = row.mediaStorageKey ? await refreshMediaReference(row.mediaStorageKey) : null");
    expect(screen).toContain("item.mediaUrl");
  });

  it("menyimpan media grup privat dengan marker yang dapat di-hydrate server", () => {
    const screen = read("app/private-group-chat.tsx");
    const server = read("server/private-groups.ts");
    const router = read("server/routers.ts");
    expect(screen).toContain("[Group photo key=${ticket.storageKey}]");
    expect(screen).toContain("[Group voice key=${ticket.storageKey}");
    expect(screen).toContain("mediaStorageKey: ticket.storageKey");
    expect(server).toContain("const mediaUrl = message.mediaStorageKey ? await refreshMediaReference(message.mediaStorageKey) : null");
    expect(screen).toContain("mediaUrl ?? photo[1]");
    expect(server).toContain('refreshMediaMarker(content, "Group photo", null)');
    expect(server).toContain('refreshMediaMarker(content, "Private group photo", null)');
    expect(router).toContain("private-groups/${input.groupId}/${account.id}-");
  });

  it("mengikat lampiran Aira ke accountId dan merefresh profil saat finance.pull", () => {
    const router = read("server/routers.ts");
    const storage = read("server/media-storage.ts");
    expect(router).toContain("aira-media/${account.id}/");
    expect(router).toContain("aira-transcribe/${account.id}/");
    expect(router).toContain("aira-media/${account.id}/voice-");
    expect(router).toContain("refreshMediaReferences(parsed.profile?.featuredPhotoUris ?? [])");
    expect(router).toContain("generatedResults");
    expect(router).toContain("storageKey: result.storageKey ?? reference");
    expect(router).not.toContain("storagePut(`global-room/voice/${Date.now()}");
    expect(storage).toContain("normalizeAiraMessagesForStorage");
    expect(storage).toContain("refreshAiraAttachment");
  });

  it("memigrasikan media lokal pada login manual", () => {
    const login = read("app/login.tsx");
    const migration = read("lib/media-migration.ts");
    expect(login).toContain("migrateAccountLocalMedia");
    expect(login).toContain("createAiraMediaUpload.mutateAsync");
    expect(login).toContain("uploadProfileMedia.mutateAsync");
    expect(migration).toContain("isLocalMediaReference");
    expect(migration).toContain("migrateOne");
    expect(migration).toContain("featuredPhotoUris");
    expect(migration).toContain("conversation.messages");
  });
});
