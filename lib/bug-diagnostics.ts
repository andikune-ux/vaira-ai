import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "airax.last-bug-diagnostic";
export type BugDiagnostic = { message: string; stack?: string; nativeCrashLog?: string; createdAt: string };

/** Menghapus pola rahasia dan data percakapan dari data diagnostik yang boleh disimpan lokal. */
export function redactDiagnosticText(value: string) {
  return value
    .replace(/(authorization\s*[:=]\s*bearer\s+)[^\s,;]+/gi, "$1[DIHAPUS]")
    .replace(/\b(?:AIza|sk-|AQ\.)[A-Za-z0-9_\-.]{12,}\b/g, "[TOKEN_DIREDaksi]")
    .replace(/(password|kata\s*sandi|token|api[_ -]?key)\s*[:=]\s*[^\s,;]+/gi, "$1=[DIHAPUS]")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[EMAIL_DIREDaksi]")
    .replace(/\b(?:\+?62|0)8\d{7,12}\b/g, "[TELEPON_DIREDaksi]")
    .slice(0, 1200);
}

export async function captureBugDiagnostic(error: unknown, componentStack?: string) {
  const source = error instanceof Error ? error : new Error(String(error));
  const diagnostic: BugDiagnostic = {
    message: redactDiagnosticText(source.message),
    stack: redactDiagnosticText(`${source.stack || ""}${componentStack ? `\nComponent stack:\n${componentStack}` : ""}`),
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(diagnostic));
}

export async function saveNativeCrashDiagnostic(nativeCrashLog: string) {
  const previous = await getLastBugDiagnostic();
  const diagnostic: BugDiagnostic = {
    message: previous?.message ?? "Native Android crash terdeteksi.",
    stack: previous?.stack,
    nativeCrashLog,
    createdAt: previous?.createdAt ?? new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(diagnostic));
}

export async function getLastBugDiagnostic(): Promise<BugDiagnostic | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as BugDiagnostic : null;
  } catch {
    return null;
  }
}
