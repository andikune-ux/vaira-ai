import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "airax.finance.sync-errors";
const MAX_ITEMS = 30;

export type FinanceSyncError = { id: string; message: string; source: string; createdAt: string };

export async function recordFinanceSyncError(message: string, source = "Sinkronisasi data") {
  const current = await readFinanceSyncErrors();
  const entry: FinanceSyncError = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, message: message.slice(0, 240), source: source.slice(0, 80), createdAt: new Date().toISOString() };
  await AsyncStorage.setItem(KEY, JSON.stringify([entry, ...current].slice(0, MAX_ITEMS)));
}

export async function readFinanceSyncErrors(): Promise<FinanceSyncError[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.message && item?.createdAt).slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

export async function clearFinanceSyncErrors() {
  await AsyncStorage.removeItem(KEY);
}
