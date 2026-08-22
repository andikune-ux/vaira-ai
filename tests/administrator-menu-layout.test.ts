import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "app/administrator.tsx"), "utf8");

describe("tata letak menu administrator mobile", () => {
  it("menggunakan tombol ringkas empat kolom tanpa teks detail", () => {
    const menuComponent = source.slice(source.indexOf("function AdminMenuButton"), source.indexOf("export default function AdministratorScreen"));
    expect(menuComponent).toContain("numberOfLines={3}");
    expect(menuComponent).not.toContain("<Text style={styles.adminMenuDetail}");
    expect(source).toContain('adminMenuButton: { alignItems: "center"');
    expect(source).toContain('flexDirection: "row"');
    expect(source).toContain('width: "23.5%"');
    expect(source).toContain('fontSize: 8');
  });
});
