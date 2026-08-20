import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("greeting card editor and responsive layout", () => {
  const source = readFileSync(resolve(process.cwd(), "app/(tabs)/index.tsx"), "utf8");

  it("keeps the home widget text within a flexible clipped layout", () => {
    expect(source).toContain('overflow: "hidden"');
    expect(source).toContain('flexShrink: 1');
    expect(source).toContain('numberOfLines={2} style={styles.aiHeroTitle}');
  });

  it("provides editable copy and selectable fonts before capture", () => {
    expect(source).toContain('accessibilityLabel="Edit teks kartu ucapan"');
    expect(source).toContain("GREETING_FONTS");
    expect(source).toContain("setGreetingFont(font.id)");
    expect(source).toContain("greetingMessageDraft || greetingFinalMessage");
  });

  it("places the VAIRA AI credit in the bottom-right corner", () => {
    expect(source).toContain('position: "absolute"');
    expect(source).toContain('bottom: 8');
    expect(source).toContain('right: 10');
    expect(source).toContain("Dibuat oleh : VAIRA AI");
  });
});
