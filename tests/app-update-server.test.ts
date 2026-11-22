import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("pembaruan aplikasi melalui GitHub Releases", () => {
  it("memeriksa rilis publik terbaru dari repository VAIRA AI", () => {
    const prompt = read("components/app-update-prompt.tsx");
    expect(prompt).toContain("https://api.github.com/repos/andikune-ux/vaira-ai/releases/latest");
    expect(prompt).toContain("browser_download_url");
    expect(prompt).toContain('asset.name?.toLowerCase().endsWith(".apk")');
    expect(prompt).not.toContain("trpc.appUpdate.latest.useQuery");
    expect(prompt).not.toContain("manus.space/download");
  });

  it("menyimpan cache GitHub sementara dan mempertahankan Skip per versi", () => {
    const prompt = read("components/app-update-prompt.tsx");
    expect(prompt).toContain("RELEASE_CACHE_TTL_MS");
    expect(prompt).toContain("vaira:github-latest-release");
    expect(prompt).toContain("vaira:skipped-update:");
    expect(prompt).toContain("WebBrowser.openBrowserAsync(release.downloadUrl)");
  });

  it("menggunakan versi aplikasi yang sama untuk Expo dan native Android", () => {
    const config = read("app.config.ts");
    const gradle = read("android/app/build.gradle");
    expect(config).toContain('version: process.env.APP_VERSION ?? "1.0.36"');
    expect(gradle).toContain('System.getenv("APP_VERSION") ?: "1.0.36"');
    expect(gradle).toContain("versionCode appVersionCode");
  });
});
