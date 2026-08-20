import AsyncStorage from "@react-native-async-storage/async-storage";

export type SpcaPassiveHistoryEntry = {
  id: string;
  kind: "appearance" | "tap" | "evasion" | "scan-report";
  detail: string;
  createdAt: string;
};

const HISTORY_KEY = "airax.spca.passive-history.v1";
const MAX_ENTRIES = 40;

export async function getSpcaPassiveHistory(): Promise<SpcaPassiveHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

export async function recordSpcaPassiveHistory(kind: SpcaPassiveHistoryEntry["kind"], detail: string) {
  const entry: SpcaPassiveHistoryEntry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, kind, detail, createdAt: new Date().toISOString() };
  const next = [entry, ...(await getSpcaPassiveHistory())].slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return entry;
}

export async function clearSpcaPassiveHistory() {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
