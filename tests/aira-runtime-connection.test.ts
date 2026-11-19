import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

describe("koneksi runtime layanan Aira", () => {
  it("mengizinkan header sesi manual pada preflight CORS", () => {
    expect(source("server/_core/index.ts")).toContain("X-AiraX-Session");
  });

  it("memakai endpoint asal yang sama saat web publik dibuka", () => {
    const oauth = source("constants/oauth.ts");
    expect(oauth).toContain('window.location?.hostname.endsWith(".manus.space")');
    expect(oauth).toContain("return window.location.origin");
  });

  it("memiliki fallback backend produksi untuk APK standalone", () => {
    const oauth = source("constants/oauth.ts");
    expect(oauth).toContain('const PRODUCTION_API_BASE_URL = "https://vairaiapp-n9sw5cvx.manus.space"');
    expect(oauth).toContain("isManagedPreviewApiBaseUrl");
    expect(oauth).toContain("!nativeHost && isManagedPreviewApiBaseUrl(API_BASE_URL)");
    expect(oauth).toContain("return PRODUCTION_API_BASE_URL");
  });

  it("memetakan API base URL ke Expo public config untuk build native", () => {
    const loader = source("scripts/load-env.js");
    expect(loader).toContain('API_BASE_URL: "EXPO_PUBLIC_API_BASE_URL"');
    expect(loader).toContain('VITE_API_BASE_URL: "EXPO_PUBLIC_API_BASE_URL"');
  });

  it("membatasi request tRPC agar status Aira tidak menggantung tanpa batas", () => {
    const trpc = source("lib/trpc.ts");
    expect(trpc).toContain("new AbortController()");
    expect(trpc).toContain("controller.abort()");
    expect(trpc).toContain("35_000");
    expect(trpc).toContain("finally(() => clearTimeout(timeout))");
  });

  it("membedakan keterbatasan upstream dari masalah koneksi pengguna", () => {
    const router = source("server/routers.ts");
    expect(router).toContain("usage exhausted|quota|insufficient funds|payment required");
    expect(router).toContain("batas penggunaan layanan tercapai");
    expect(router).toContain("Ini bukan masalah koneksi HP");
    expect(router).toContain("sesi login kedaluwarsa");
    expect(router).toContain("tekan Ulang");
    expect(router).toContain('errorCode: upstreamUnavailable ? "UPSTREAM_LIMIT"');
  });

  it("memberi pesan yang jelas ketika sesi akun diperlukan", () => {
    expect(source("components/aira-chat-screen.tsx")).toContain("Masuk akun V A I R A  A I diperlukan agar Aira dapat merespons");
  });
});

describe("detail kegagalan layanan Aira", () => {
  it("menjelaskan generator terkunci karena token dan prompt tetap aman", () => {
    const chat = source("components/aira-chat-screen.tsx");
    expect(chat).toContain("Generator terkunci. Akses ini memerlukan token Premium atau Admin");
    expect(chat).toContain("Prompt tetap disimpan");
  });
});
