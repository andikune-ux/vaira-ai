import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (filePath: string) => fs.readFileSync(path.resolve(process.cwd(), filePath), "utf8");

describe("deep link grup privat", () => {
  it("uses the public HTTPS invite URL and keeps the token encoded", () => {
    const links = read("lib/private-group-links.ts");
    expect(links).toContain("https://vairaiapp-n9sw5cvx.manus.space");
    expect(links).toContain("encodeURIComponent(token)");
    expect(read("app/private-group-chat.tsx")).toContain("Clipboard.setStringAsync(url)");
    expect(read("app/private-group-chat.tsx")).toContain("createPrivateGroupInviteUrl(created.token)");
  });

  it("falls back to the download page in web and joins by token in native", () => {
    const join = read("app/private-group-join.tsx");
    expect(join).toContain('Platform.OS === "web"');
    expect(join).toContain("GROUP_DOWNLOAD_URL");
    expect(join).toContain("join.mutateAsync({ token })");
  });

  it("declares Android HTTPS app links and iOS associated domains", () => {
    const config = read("app.config.ts");
    expect(config).toContain('associatedDomains: ["applinks:vairaiapp-n9sw5cvx.manus.space"]');
    expect(config).toContain('scheme: "https"');
    expect(config).toContain('host: "vairaiapp-n9sw5cvx.manus.space"');
    expect(config).toContain('pathPrefix: "/private-group-join"');
  });

  it("keeps the exact original brand spacing", () => {
    expect(read("app.config.ts")).toContain('appName: "V A I R A  A I"');
    expect(read("components/app-update-prompt.tsx")).toContain("V A I R A  A I");
  });
});
