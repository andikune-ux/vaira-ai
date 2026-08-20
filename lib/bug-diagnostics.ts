import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "airax.last-bug-diagnostic";
export type BugDiagnostic = { message: string; stack?: string; createdAt: string };
export async function captureBugDiagnostic(error: unknown, componentStack?: string) {
  const source = error instanceof Error ? error : new Error(String(error));
  const diagnostic: BugDiagnostic = { message: source.message, stack: `${source.stack || ""}${componentStack ? `\nComponent stack:\n${componentStack}` : ""}`.slice(0, 7000), createdAt: new Date().toISOString() };
  await AsyncStorage.setItem(KEY, JSON.stringify(diagnostic));
}
export async function getLastBugDiagnostic(): Promise<BugDiagnostic | null> { try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) as BugDiagnostic : null; } catch { return null; } }
