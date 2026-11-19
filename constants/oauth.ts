import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as ReactNative from "react-native";
import Constants from "expo-constants";

// Extract scheme from bundle ID (last segment timestamp, prefixed with "manus")
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
const bundleId = "dev.andikune.vairaio";
const PRODUCTION_API_BASE_URL = "https://vairaiapp-n9sw5cvx.manus.space";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

function isManagedPreviewApiBaseUrl(value: string) {
  try {
    const hostname = new URL(value).hostname;
    return hostname.endsWith(".manus.computer") && /^\d+-/.test(hostname);
  } catch {
    return false;
  }
}

function getNativeExpoHost() {
  const config = Constants.expoConfig as (typeof Constants.expoConfig & { hostUri?: string }) | null;
  const expoGo = Constants.expoGoConfig as (typeof Constants.expoGoConfig & { debuggerHost?: string; hostUri?: string }) | null;
  return config?.hostUri ?? expoGo?.hostUri ?? expoGo?.debuggerHost ?? null;
}

const env = {
  portal: process.env.EXPO_PUBLIC_OAUTH_PORTAL_URL ?? "",
  server: process.env.EXPO_PUBLIC_OAUTH_SERVER_URL ?? "",
  appId: process.env.EXPO_PUBLIC_APP_ID ?? "",
  ownerId: process.env.EXPO_PUBLIC_OWNER_OPEN_ID ?? "",
  ownerName: process.env.EXPO_PUBLIC_OWNER_NAME ?? "",
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  deepLinkScheme: schemeFromBundleId,
};

export const OAUTH_PORTAL_URL = env.portal;
export const OAUTH_SERVER_URL = env.server;
export const APP_ID = env.appId;
export const OWNER_OPEN_ID = env.ownerId;
export const OWNER_NAME = env.ownerName;
export const API_BASE_URL = env.apiBaseUrl;

/**
 * Get the API base URL, deriving from current hostname if not set.
 * Metro runs on 8081, API server runs on 3000.
 * URL pattern: https://PORT-sandboxid.region.domain
 */
export function getApiBaseUrl(): string {
  // Produksi web menyajikan frontend dan backend dari domain yang sama.
  // Gunakan origin aktif agar bundle publik tidak menunjuk ke URL preview sandbox.
  if (ReactNative.Platform.OS === "web" && typeof window !== "undefined" && window.location?.hostname.endsWith(".manus.space")) {
    return window.location.origin;
  }

  const nativeHost = ReactNative.Platform.OS !== "web" ? getNativeExpoHost() : null;

  // Paket standalone tidak membawa host Expo. Jangan gunakan URL preview sandbox yang
  // mungkin ikut ter-embed saat build karena host tersebut tidak tersedia di perangkat.
  if (API_BASE_URL && !(ReactNative.Platform.OS !== "web" && !nativeHost && isManagedPreviewApiBaseUrl(API_BASE_URL))) {
    return API_BASE_URL.replace(/\/$/, "");
  }

  // On web, derive from current hostname by replacing port 8081 with 3000
  if (ReactNative.Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { protocol, hostname } = window.location;
    // Pattern: 8081-sandboxid.region.domain -> 3000-sandboxid.region.domain
    const apiHostname = hostname.replace(/^8081-/, "3000-");
    if (apiHostname !== hostname) {
      return `${protocol}//${apiHostname}`;
    }
  }

  // Expo Go maupun development build di perangkat tidak dapat melakukan fetch ke URL relatif.
  // Ambil host Metro yang aktif lalu ganti port preview 8081 menjadi API 3000.
  if (ReactNative.Platform.OS !== "web") {
    if (nativeHost) {
      const normalized = nativeHost.includes("://") ? nativeHost : `https://${nativeHost}`;
      try {
        const url = new URL(normalized);
        const hostname = url.hostname.replace(/^8081-/, "3000-");
        return `${url.protocol}//${hostname}`;
      } catch {
        // Gunakan fallback relatif hanya bila Expo tidak memberikan host yang dapat dipakai.
      }
    }
  }

  // Standalone APK builds do not expose Expo hostUri. Use the published backend
  // as a safe fallback so Aira remains reachable when public env injection is absent.
  return PRODUCTION_API_BASE_URL;
}

export const SESSION_TOKEN_KEY = "app_session_token";
export const USER_INFO_KEY = "manus-runtime-user-info";
export const MANUAL_SESSION_TOKEN_KEY = "airax-manual-account-session";

export function sanitizeOAuthError(value: string | null | undefined): string {
  const text = (value ?? "").trim();
  if (!text) return "Autentikasi tidak dapat diselesaikan. Silakan coba lagi.";
  if (/<!doctype|<html|<head|<body/i.test(text)) {
    return "Layanan autentikasi mengembalikan halaman yang tidak valid. Silakan tutup halaman ini lalu coba masuk kembali.";
  }
  return text.length > 180 ? "Autentikasi tidak dapat diselesaikan. Silakan coba lagi." : text;
}

const encodeState = (value: string) => {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(value);
  }
  const BufferImpl = (globalThis as Record<string, any>).Buffer;
  if (BufferImpl) {
    return BufferImpl.from(value, "utf-8").toString("base64");
  }
  return value;
};

/**
 * Get the redirect URI for OAuth callback.
 * - Web: uses API server callback endpoint
 * - Native: uses deep link scheme
 */
export const getRedirectUri = () => {
  if (ReactNative.Platform.OS === "web") {
    return `${getApiBaseUrl()}/api/oauth/callback`;
  } else {
    // Biarkan Expo memilih URL aktif: exp:// pada Expo Go, atau skema aplikasi
    // pada development build dan APK terpasang. Memaksa skema custom membuat
    // callback tidak kembali ke Expo Go pada perangkat.
    return Linking.createURL("/oauth/callback");
  }
};

export const getLoginUrl = () => {
  if (!APP_ID) {
    throw new Error("Konfigurasi autentikasi aplikasi belum lengkap. Hubungi pemilik aplikasi untuk mengaktifkan login email.");
  }
  const redirectUri = getRedirectUri();
  const state = encodeState(redirectUri);

  const url = new URL(`${OAUTH_PORTAL_URL}/app-auth`);
  url.searchParams.set("appId", APP_ID);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

/**
 * Start OAuth login flow.
 *
 * On native platforms (iOS/Android), open the system browser directly so
 * the OAuth callback returns via deep link to the app.
 *
 * On web, this simply redirects to the login URL.
 *
 * @returns Always null, the callback is handled via deep link.
 */
export async function startOAuthLogin(): Promise<string | null> {
  const loginUrl = getLoginUrl();

  if (ReactNative.Platform.OS === "web") {
    // On web, just redirect
    if (typeof window !== "undefined") {
      window.location.href = loginUrl;
    }
    return null;
  }

  const result = await WebBrowser.openAuthSessionAsync(loginUrl, getRedirectUri());
  return result.type === "success" ? result.url : null;
}
