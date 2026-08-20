import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "app/global-room-chat.tsx"), "utf8");

describe("Room Global message gestures", () => {
  it("animates a pulled bubble before triggering swipe-to-reply", () => {
    expect(source).toContain("swipeReplyX");
    expect(source).toContain("swipeReplyActiveId");
    expect(source).toContain("Animated.spring(swipeReplyX");
    expect(source).toContain("distance >= 52");
    expect(source).toContain("triggerReply(item)");
    expect(source).toContain("swipeReplyHint");
  });

  it("keeps long-press actions available and suppresses accidental profile navigation", () => {
    expect(source).toContain("onLongPress={() => openMessageActions(item)}");
    expect(source).toContain("suppressNextBubblePress.current = true");
    expect(source).toContain('accessibilityLabel="Balas pesan"');
    expect(source).toContain('accessibilityLabel="Pilih teks pesan"');
    expect(source).toContain('accessibilityLabel="Laporkan pesan"');
  });
});
