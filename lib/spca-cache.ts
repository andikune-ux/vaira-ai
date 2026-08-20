import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

async function measure(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) return 0;
  if (!info.isDirectory) return info.size ?? 0;
  const names = await FileSystem.readDirectoryAsync(uri);
  const sizes = await Promise.all(names.map((name) => measure(`${uri}${name}`)));
  return sizes.reduce((total, size) => total + size, 0);
}

export function formatCacheSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function getTemporaryCacheSize() {
  if (Platform.OS === "web" || !FileSystem.cacheDirectory) return 0;
  try { return await measure(FileSystem.cacheDirectory); } catch { return 0; }
}

export async function clearTemporaryCache() {
  if (Platform.OS === "web" || !FileSystem.cacheDirectory) return 0;
  const root = FileSystem.cacheDirectory;
  const released = await getTemporaryCacheSize();
  try {
    const names = await FileSystem.readDirectoryAsync(root);
    await Promise.all(names.map((name) => FileSystem.deleteAsync(`${root}${name}`, { idempotent: true })));
  } catch {
    return 0;
  }
  return released;
}
