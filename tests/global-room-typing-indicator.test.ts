import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const clientSource = readFileSync(resolve(process.cwd(), "app/global-room-chat.tsx"), "utf8");
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

describe("Room Global typing indicator", () => {
  it("shows only an anonymous typing label and polls it briefly", () => {
    expect(clientSource).toContain("typingStatus");
    expect(clientSource).toContain("refetchInterval: 2000");
    expect(clientSource).toContain("Seseorang sedang mengetik…");
    expect(clientSource).not.toContain("typingDisplayName");
  });

  it("debounces typing state and clears it on send or empty input", () => {
    expect(clientSource).toContain("setTyping.mutateAsync({ typing: true })");
    expect(clientSource).toContain("setTyping.mutateAsync({ typing: false })");
    expect(clientSource).toContain("typingTimerRef");
    expect(clientSource).toContain("if (!isAdminMode) void setTyping.mutateAsync({ typing: false })");
  });

  it("exposes a server-side TTL status without persisting message content", () => {
    expect(routerSource).toContain("typingStatus:");
    expect(routerSource).toContain("setTyping:");
    expect(dbSource).toContain("GLOBAL_ROOM_TYPING_TTL_MS = 4_000");
    expect(dbSource).toContain("globalRoomTypingUntil");
    expect(dbSource).not.toContain("typingContent");
  });
});
