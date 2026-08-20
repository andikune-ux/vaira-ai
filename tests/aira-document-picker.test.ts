import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const chat = fs.readFileSync(path.resolve(__dirname, "../components/aira-chat-screen.tsx"), "utf8");

describe("pemilih dokumen Aira", () => {
  it("menyediakan pemilih file perangkat untuk dokumen dan media umum", () => {
    expect(chat).toContain("DocumentPicker.getDocumentAsync");
    expect(chat).toContain("application/vnd.openxmlformats-officedocument.presentationml.presentation");
    expect(chat).toContain("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    expect(chat).toContain("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(chat).toContain("image/*");
    expect(chat).toContain("video/*");
  });
});
