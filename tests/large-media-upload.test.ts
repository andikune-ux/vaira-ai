import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("unggahan media besar Aira", () => {
  it("membuat tiket unggahan langsung hingga 200 MB", () => {
    const router = read("server/routers.ts");
    const storage = read("server/storage.ts");
    expect(router).toContain("createUpload");
    expect(router).toContain("200 * 1024 * 1024");
    expect(storage).toContain("storageCreateUploadUrl");
  });

  it("menampilkan progres dan memakai sesi unggahan latar belakang", () => {
    const chat = read("components/aira-chat-screen.tsx");
    expect(chat).toContain("FileSystem.FileSystemSessionType.BACKGROUND");
    expect(chat).toContain("totalBytesSent / progress.totalBytesExpectedToSend");
    expect(chat).toContain("hingga 200 MB");
    expect(chat).toContain("uploadStatus: \"retrying\"");
  });
});
