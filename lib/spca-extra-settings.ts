import AsyncStorage from "@react-native-async-storage/async-storage";

export type SpcaExtraSettings = {
  passiveMaxAppearances: number;
  landscapeAdaptiveEnabled: boolean;
  manualOrientation: "portrait" | "landscape";
  scannerColor: "blue" | "violet" | "green" | "gold";
  radarTrailEnabled: boolean;
  radarTrailColor: "blue" | "violet" | "green" | "gold";
};

const SETTINGS_KEY = "airax.spca.extra-settings.v1";
export const DEFAULT_SPCA_EXTRA_SETTINGS: SpcaExtraSettings = { passiveMaxAppearances: 3, landscapeAdaptiveEnabled: true, manualOrientation: "portrait", scannerColor: "blue", radarTrailEnabled: true, radarTrailColor: "blue" };

export async function getSpcaExtraSettings(): Promise<SpcaExtraSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_SPCA_EXTRA_SETTINGS, ...(parsed && typeof parsed === "object" ? parsed : {}) };
  } catch {
    return DEFAULT_SPCA_EXTRA_SETTINGS;
  }
}

export async function saveSpcaExtraSettings(next: SpcaExtraSettings) {
  const normalized = { passiveMaxAppearances: Math.max(0, Math.min(20, Math.round(next.passiveMaxAppearances))), landscapeAdaptiveEnabled: Boolean(next.landscapeAdaptiveEnabled), manualOrientation: next.manualOrientation === "landscape" ? "landscape" as const : "portrait" as const, scannerColor: (["blue", "violet", "green", "gold"] as string[]).includes(next.scannerColor) ? next.scannerColor : "blue" as const, radarTrailEnabled: Boolean(next.radarTrailEnabled), radarTrailColor: (["blue", "violet", "green", "gold"] as string[]).includes(next.radarTrailColor) ? next.radarTrailColor : "blue" as const };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
  return normalized;
}
