import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("final greeting card copy", () => {
  const source = readFileSync(resolve(process.cwd(), "app/(tabs)/index.tsx"), "utf8");

  it("defines a declarative final message for saved and shared cards", () => {
    expect(source).toContain("const greetingFinalMessage =");
    expect(source).toContain("Semoga peringatan");
  });

  it("uses final copy in the preview card", () => {
    expect(source).toContain("greetingPreviewPrompt");
    expect(source).toContain("greetingFinalMessage");
  });

  it("selects event decorations for Islamic and Independence themes", () => {
    expect(source).toContain("☾  ✦  🏮  ✦  ☽");
    expect(source).toContain("🇮🇩  ✦  🎈  🏃  🏆  🪁  ✦  🇮🇩");
    expect(source).toContain("greetingDecorativeLine");
  });
});
