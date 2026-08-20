import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "app/(tabs)/index.tsx"), "utf8");

describe("greeting widget and final card layout", () => {
  it("keeps the home widget compact while retaining luxury decorations for preview", () => {
    expect(source).toContain("simpleGreetingHeader");
    expect(source).toContain("simpleGreetingAccent");
    expect(source).toContain("<ScrapbookDecorations");
    expect(source).toContain("greetingPreviewRef");
  });

  it("keeps the final card copyright visible", () => {
    expect(source).toContain("Dibuat oleh : VAIRA AI");
  });
});

