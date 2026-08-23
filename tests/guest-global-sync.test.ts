import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("penghapusan sinkronisasi snapshot global", () => {
  it("tidak memasang pemuatan snapshot lintas pengguna pada aplikasi", () => {
    expect(source("app/_layout.tsx")).not.toContain("<GlobalTestSync />");
    expect(source("components/global-test-sync.tsx")).toContain("return null;");
  });
});
