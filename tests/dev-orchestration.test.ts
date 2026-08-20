import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const packageJson = () => JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8")) as { scripts?: Record<string, string> };

describe("orchestrasi pengembangan standby", () => {
  it("hanya menghentikan proses lain saat salah satunya gagal", () => {
    const dev = packageJson().scripts?.dev ?? "";

    expect(dev).toContain("concurrently --kill-others-on-fail");
    expect(dev).not.toContain("concurrently -k");
  });
});
