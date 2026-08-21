import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("grid menu Administrator", () => {
  it("menampilkan delapan layanan sebagai grid empat kolom tanpa tombol database terselip", () => {
    const source = readFileSync(`${process.cwd()}/app/administrator.tsx`, "utf8");
    const grid = source.slice(source.indexOf('<View style={styles.adminMenuGrid}>'), source.indexOf('</View><View style={styles.terminalPanel}>'));
    expect((grid.match(/<AdminMenuButton/g) ?? []).length).toBe(8);
    expect(grid).toContain('label="SERVER DATABASE 2"');
    expect(source).toContain('width: "23.5%"');
    expect(source).not.toContain('label === "AiraXCloud" ? <Pressable');
  });
});
