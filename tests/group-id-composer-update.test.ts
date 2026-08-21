import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(`${process.cwd()}/${path}`, "utf8");

describe("penyempurnaan grup, komposer, dan update", () => {
  it("menampilkan pencarian dan join dengan ID grup", () => {
    const screen = read("app/private-groups.tsx");
    expect(screen).toContain("searchByPublicId.useQuery");
    expect(screen).toContain("joinByPublicId.useMutation");
    expect(screen).toContain("ID: {item.publicGroupId}");
    expect(screen).toContain("Cari grup dengan ID");
  });

  it("menggunakan Enter untuk baris baru pada Room Global dan grup privat", () => {
    const globalRoom = read("app/global-room-chat.tsx");
    const groupChat = read("app/private-group-chat.tsx");
    expect(globalRoom).toContain('multiline blurOnSubmit={false} returnKeyType="default"');
    expect(groupChat).toContain('multiline maxLength={4_000} returnKeyType="default" blurOnSubmit={false}');
    expect(globalRoom).not.toContain('onSubmitEditing={send} returnKeyType="send"');
    expect(groupChat).not.toContain('returnKeyType="send" onSubmitEditing={sendText}');
  });

  it("menyediakan dialog update dengan Skip per versi dan detail perubahan", () => {
    const prompt = read("components/app-update-prompt.tsx");
    const layout = read("app/_layout.tsx");
    expect(prompt).toContain("vaira:skipped-update");
    expect(prompt).toContain("Lihat selengkapnya");
    expect(prompt).toContain("Update");
    expect(prompt).toContain("Skip");
    expect(layout).toContain("<AppUpdatePrompt />");
  });
});
