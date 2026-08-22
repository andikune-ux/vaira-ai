import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("tawaran pembaruan dari server", () => {
  it("menerbitkan metadata update publik dengan versi, catatan perubahan, dan URL unduhan", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("appUpdate: router");
    expect(router).toContain('version: "1.0.23"');
    expect(router).toContain("downloadUrl");
    expect(router).toContain("changes:");
  });

  it("memeriksa tawaran server saat aplikasi dibuka dan menyimpan Skip per versi", () => {
    const prompt = read("components/app-update-prompt.tsx");
    expect(prompt).toContain("trpc.appUpdate.latest.useQuery");
    expect(prompt).toContain('refetchOnMount: "always"');
    expect(prompt).toContain("vaira:skipped-update");
    expect(prompt).toContain("WebBrowser.openBrowserAsync(release.downloadUrl)");
  });

  it("menaikkan versi aplikasi agar rilis server memiliki target pembaruan", () => {
    expect(read("app.config.ts")).toContain('version: "1.0.23"');
  });
});
