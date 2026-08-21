import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("kebijakan CORS", () => {
  it("tidak lagi memantulkan semua origin dengan kredensial", () => {
    const source = readFileSync(`${process.cwd()}/server/_core/index.ts`, "utf8");
    expect(source).toContain("CORS_ALLOWED_ORIGINS");
    expect(source).toContain("isAllowedBrowserOrigin(origin)");
    expect(source).toContain("res.sendStatus(403)");
    expect(source).not.toContain("res.header(\"Access-Control-Allow-Origin\", origin);\n    }\n    res.header(\"Access-Control-Allow-Methods\"");
  });
});
