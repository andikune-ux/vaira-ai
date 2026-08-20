import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const source = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("alur login OAuth", () => {
  it("menggunakan sesi autentikasi Expo dan callback URL aktif", () => {
    const oauth = source("constants/oauth.ts");
    expect(oauth).toContain("WebBrowser.openAuthSessionAsync");
    expect(oauth).toContain('Linking.createURL("/oauth/callback")');
    expect(oauth).not.toContain("Linking.openURL(loginUrl)");
  });

  it("menyaring respons HTML sebelum tampil sebagai kegagalan login", () => {
    const oauth = source("constants/oauth.ts");
    const callback = source("app/oauth/callback.tsx");
    expect(oauth).toContain("sanitizeOAuthError");
    expect(callback).toContain("setErrorMessage(sanitizeOAuthError(error))");
  });
});
