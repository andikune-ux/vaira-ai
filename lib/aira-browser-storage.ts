import AsyncStorage from "@react-native-async-storage/async-storage";

export type BrowserBookmark = { id: string; title: string; url: string; createdAt: string };
export type BrowserHistoryItem = { id: string; title: string; url: string; visitedAt: string };
export type BrowserDownload = { id: string; url: string; filename: string; mode: "normal" | "super"; status: "queued" | "opened"; createdAt: string };

const BOOKMARKS_KEY = "vaira.aira-browser.bookmarks.v1";
const HISTORY_KEY = "vaira.aira-browser.history.v1";
const DOWNLOADS_KEY = "vaira.aira-browser.downloads.v1";
const cap = <T>(items: T[], limit: number) => items.slice(0, limit);
const safeRead = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = async <T>(key: string, value: T) => { await AsyncStorage.setItem(key, JSON.stringify(value)); };

export const readBrowserBookmarks = () => safeRead<BrowserBookmark[]>(BOOKMARKS_KEY, []);
export const readBrowserHistory = () => safeRead<BrowserHistoryItem[]>(HISTORY_KEY, []);
export const readBrowserDownloads = () => safeRead<BrowserDownload[]>(DOWNLOADS_KEY, []);

export async function saveBrowserBookmark(item: Omit<BrowserBookmark, "id" | "createdAt">) {
  const current = await readBrowserBookmarks();
  const nextItem = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString() };
  const next = [nextItem, ...current.filter((entry) => entry.url !== item.url)];
  await write(BOOKMARKS_KEY, cap(next, 100));
  return nextItem;
}

export async function removeBrowserBookmark(url: string) {
  const current = await readBrowserBookmarks();
  await write(BOOKMARKS_KEY, current.filter((entry) => entry.url !== url));
}

export async function addBrowserHistory(item: Omit<BrowserHistoryItem, "id" | "visitedAt">) {
  if (!item.url || item.url === "about:blank") return;
  const current = await readBrowserHistory();
  const nextItem = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, visitedAt: new Date().toISOString() };
  const next = [nextItem, ...current.filter((entry) => entry.url !== item.url)];
  await write(HISTORY_KEY, cap(next, 200));
}

export async function addBrowserDownload(item: Omit<BrowserDownload, "id" | "createdAt" | "status">) {
  const current = await readBrowserDownloads();
  const nextItem = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, status: "queued" as const, createdAt: new Date().toISOString() };
  await write(DOWNLOADS_KEY, cap([nextItem, ...current], 100));
  return nextItem;
}

export async function clearBrowserHistory() { await AsyncStorage.removeItem(HISTORY_KEY); }
export async function clearBrowserDownloads() { await AsyncStorage.removeItem(DOWNLOADS_KEY); }
export const browserStorageKeys = { BOOKMARKS_KEY, HISTORY_KEY, DOWNLOADS_KEY };
