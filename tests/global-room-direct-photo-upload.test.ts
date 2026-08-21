import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const client = readFileSync(resolve(process.cwd(), "app/global-room-chat.tsx"), "utf8");
const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("unggah foto langsung Room Global", () => {
  it("menggunakan ticket storage langsung tanpa payload foto base64 di aplikasi", () => {
    expect(router).toContain("createPhotoUpload:");
    expect(router).toContain("storageCreateUploadUrl");
    expect(router).toContain("readUrl: await storageGetSignedUrl(ticket.key)");
    expect(client).toContain("createPhotoUpload.mutateAsync");
    expect(client).toContain("FileSystem.createUploadTask(ticket.uploadUrl");
    expect(client).toContain("sessionType: FileSystem.FileSystemSessionType.BACKGROUND");
    expect(router).toContain("createVoiceUpload:");
    expect(client).toContain("createVoiceUpload.mutateAsync");
    expect(client).toContain("Voice note besar tetap dikirim");
  });
});
