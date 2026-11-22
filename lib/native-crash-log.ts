import { NativeModules, Platform } from "react-native";

type NativeCrashLogBridge = {
  getPendingCrash: () => Promise<string | null>;
  clearPendingCrash: () => Promise<boolean>;
};
const bridge = NativeModules.VairaNativeCrashLog as NativeCrashLogBridge | undefined;

export async function getPendingNativeCrashLog(): Promise<string | null> {
  if (Platform.OS !== "android" || !bridge) return null;
  try { return await bridge.getPendingCrash(); } catch { return null; }
}
export async function clearPendingNativeCrashLog(): Promise<void> {
  if (Platform.OS !== "android" || !bridge) return;
  try { await bridge.clearPendingCrash(); } catch { /* Keep diagnostics if native storage is unavailable. */ }
}
