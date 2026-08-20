import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

describe("Aira AI Browser internal", () => {
  it("menyediakan WebView internal dan fallback iframe tanpa membuka browser eksternal", () => {
    const screen = source("app/aira-browser.tsx");
    expect(screen).toContain('import { WebView } from "react-native-webview"');
    expect(screen).toContain("NativeWebView");
    expect(screen).toContain('const WebFrame = "iframe"');
    expect(screen).toContain('Platform.OS === "web"');
    expect(screen).toContain('source={{ uri: activeTab?.url || HOME_URL }}');
    expect(screen).toContain('const HOME_URL = "https://www.google.com"');
    expect(screen).toContain('const GOOGLE_FALLBACK_URL = "https://www.google.com/search?q=Google&igu=1"');
    expect(screen).toContain('userAgent={compatibilityMode === "mobile" ? MOBILE_CHROME_USER_AGENT : DESKTOP_CHROME_USER_AGENT}');
    expect(screen).toContain('const DESKTOP_CHROME_USER_AGENT');
    expect(screen).toContain("setTimeout(() =>");
  });

  it("menyediakan tab, address bar, navigasi, mode privat, bookmark, riwayat, dan unduhan", () => {
    const screen = source("app/aira-browser.tsx");
    expect(screen).toContain("type BrowserTab");
    expect(screen).toContain("newTab");
    expect(screen).toContain("HOME_URL");
    expect(screen).toContain('const HOME_URL = "https://www.google.com"');
    expect(screen).toContain('accessibilityLabel="Beranda browser"');
    expect(screen).toContain("GOOGLE_FALLBACK_URL");
    expect(screen).toContain('onNavigationStateChange');
    expect(screen).toContain("handleWebViewError");
    expect(screen).toContain("compatibilityMode");
    expect(screen).toContain("DESKTOP_CHROME_USER_AGENT");
    expect(screen).toContain("isNativeMobileAttempt");
    expect(screen).toContain("setCompatibilityMode(\"desktop\")");
    expect(screen).toContain("onShouldStartLoadWithRequest");
    expect(screen).toContain("isForMainFrame");
    expect(screen).toContain("openExternal");
    expect(screen).toContain("sharedCookiesEnabled={!incognito}");
    expect(screen).toContain("thirdPartyCookiesEnabled={!incognito}");
    expect(screen).toContain("cacheMode={incognito ? \"LOAD_NO_CACHE\" : \"LOAD_DEFAULT\"}");
    expect(screen).toContain("describeNavigationFailure");
    expect(screen).toContain("hostFromUrl");
    expect(screen).toContain('Situs ${host} menolak respons untuk WebView internal.');
    expect(screen).toContain("Buka dalam tab aman VAIRA");
    expect(screen).toContain("setIncognito");
    expect(screen).toContain("toggleBookmark");
    expect(screen).toContain("startDownload");
    expect(screen).toContain('mode === "super"');
  });

  it("menyimpan data browser secara lokal dan membatasi riwayat", () => {
    const storage = source("lib/aira-browser-storage.ts");
    expect(storage).toContain("AsyncStorage");
    expect(storage).toContain("vaira.aira-browser.bookmarks.v1");
    expect(storage).toContain("vaira.aira-browser.history.v1");
    expect(storage).toContain("vaira.aira-browser.downloads.v1");
    expect(storage).toContain("cap(next, 200)");
  });

  it("menghubungkan browser ke Beranda dan Rencana Cepat", () => {
    const home = source("app/(tabs)/index.tsx");
    const plans = source("app/(tabs)/plans.tsx");
    const browser = source("app/aira-browser.tsx");
    const quickActionsLine = home.split("\n").find((line) => line.includes("const quickActions")) ?? "";
    expect(quickActionsLine).not.toContain('id: "browser", label: "Aira AI Browser"');
    expect(quickActionsLine).not.toContain('router.push("/aira-browser" as never)');
    expect(plans).toContain('label="Aira AI Browser"');
    expect(plans).toContain('icon="travel-explore"');
    expect(plans).toContain('router.push("/aira-browser" as never)');
    expect(browser).toContain('panel === "settings"');
    expect(browser).toContain('accessibilityLabel="Pengaturan browser"');
    expect(browser).toContain('styles.addressRow');
    expect(browser).toContain('styles.topIconButton');
  });
});
