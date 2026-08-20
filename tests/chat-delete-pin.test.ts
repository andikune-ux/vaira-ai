import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.resolve(__dirname, "../components/aira-chat-screen.tsx"), "utf8");

describe("penghapusan percakapan MANU AIRA", () => {
  it("memerlukan tindakan PIN sebelum penghapusan riwayat disimpan", () => {
    expect(source).toContain('setPinAction("delete")');
    expect(source).toContain('pinAction === "delete"');
    expect(source).toContain("removeStoredConversation(next.id)");
    expect(source).toContain("if (next.id === conversationId) newChat()");
    expect(source).toContain("Percakapan dipindahkan ke Sampah setelah PIN terverifikasi.");
  });
});
