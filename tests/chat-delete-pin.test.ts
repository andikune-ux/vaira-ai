import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.resolve(__dirname, "../components/aira-chat-screen.tsx"), "utf8");

describe("penghapusan percakapan Aira", () => {
  it("menghapus riwayat langsung tanpa PIN pada seluruh mode Aira", () => {
    expect(source).toContain("const deleteConversation = async (id: string)");
    expect(source).toContain("await removeStoredConversation(target.id)");
    expect(source).toContain("if (target.id === conversationId) newChat()");
    expect(source).toContain("Percakapan dipindahkan ke Sampah.");
    expect(source).not.toContain('setPinAction("delete")');
    expect(source).not.toContain("verifyChatPrivacyPin");
  });
});
