import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("responsive mobile layout safeguards", () => {
  it("allows the home header to wrap and its title to shrink", () => {
    const source = projectFile("app/(tabs)/index.tsx");
    expect(source).toContain('flexWrap: "wrap"');
    expect(source).toContain('title: { flexShrink: 1');
  });

  it("uses compact clock text and bounded network status on narrow screens", () => {
    const clock = projectFile("components/realtime-clock.tsx");
    const network = projectFile("components/network-status.tsx");
    expect(clock).toContain("width < 420");
    expect(clock).toContain("compactBox");
    expect(network).toContain("maxWidth: 116");
    expect(network).toContain("numberOfLines={1}");
  });

  it("wraps backup and settings labels instead of clipping them", () => {
    const backup = projectFile("app/local-backup.tsx");
    const settings = projectFile("app/settings.tsx");
    expect(backup).toContain("numberOfLines={2}");
    expect(backup).toContain("headerText: { flex: 1, minWidth: 0");
    expect(settings).toContain("settingLabel: { flexShrink: 1");
  });
});
