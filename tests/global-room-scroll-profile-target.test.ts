import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "app/global-room-chat.tsx"), "utf8");

describe("Room Global profile targets and manual scroll", () => {
  it("opens profile from the message name/avatar header", () => {
    expect(source).toContain('accessibilityLabel={`Buka profil ${item.displayName}`}');
    expect(source).toContain("style={styles.messageHeader}");
    expect(source).toContain('pathname: "/global-room-public-profile"');
    expect(source).not.toContain('onPress={() => { if (suppressNextBubblePress.current) return; router.push({ pathname: "/global-room-public-profile"');
  });

  it("does not force the list to the bottom while the reader is away from latest", () => {
    expect(source).toContain("const wasAtLatestRef = useRef(true)");
    expect(source).toContain("wasAtLatestRef.current = atLatest");
    expect(source).toContain("const hasNewMessages = previousCount > 0 && nextCount > previousCount");
    expect(source).toContain("if (nextCount && (previousCount === 0 || wasAtLatestRef.current))");
    expect(source).toContain('accessibilityLabel="Lompat ke pesan terbaru"');
  });
});
