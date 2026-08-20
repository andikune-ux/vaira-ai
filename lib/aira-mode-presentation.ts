import type { ThemeColorPalette } from "@/constants/theme";
import type { AiraResponseMode } from "@/lib/finance/types";

export type AiraModePresentation = { label: string; greeting: string; historyLabel: string; inputPlaceholder: string; thinkingLabel: string; palette: ThemeColorPalette };

function withModePalette(base: ThemeColorPalette, overrides: Pick<ThemeColorPalette, "primary" | "background" | "surface" | "foreground" | "muted" | "border" | "success" | "warning" | "error">): ThemeColorPalette {
  return { ...base, ...overrides, tint: overrides.primary, icon: overrides.muted, tabIconDefault: overrides.muted, tabIconSelected: overrides.primary };
}

function withAccent(palette: ThemeColorPalette, accent?: string): ThemeColorPalette {
  return accent ? { ...palette, primary: accent, tint: accent, tabIconSelected: accent } : palette;
}

export function getAiraModePresentation(mode: AiraResponseMode, base: ThemeColorPalette, accent?: string): AiraModePresentation {
  if (mode === "hot_pro") return { label: "Aira Hot Pro 18+", greeting: "Sayang, mau ngobrol apa kita hari ini?", historyLabel: "Riwayat Aira Hot Pro 18+", inputPlaceholder: "Tulis pesan untuk Aira Hot Pro…", thinkingLabel: "Aira Hot Pro sedang berpikir…", palette: withAccent(withModePalette(base, { primary: "#DB2777", background: "#FFF1F2", surface: "#FFE4E6", foreground: "#4C0519", muted: "#9F1239", border: "#FDA4AF", success: "#BE185D", warning: "#C2410C", error: "#BE123C" }), accent) };
  if (mode === "scientist") return { label: "Aira Ahli Ilmuan", greeting: "Apa yang mau ditanyakan? Ada para ahli di sini.", historyLabel: "Riwayat Aira Ahli Ilmuan", inputPlaceholder: "Tulis pertanyaan untuk para ahli…", thinkingLabel: "Para ahli sedang menganalisis…", palette: withAccent(withModePalette(base, { primary: "#15803D", background: "#F0FDF4", surface: "#DCFCE7", foreground: "#052E16", muted: "#166534", border: "#86EFAC", success: "#15803D", warning: "#B45309", error: "#B91C1C" }), accent) };
  if (!accent) return { label: "Aira", greeting: "Halo, saya Aira. Anda dapat mengirim teks, foto, video, atau pesan suara.", historyLabel: "Riwayat percakapan", inputPlaceholder: "Tulis pesan untuk Aira…", thinkingLabel: "Aira sedang berpikir…", palette: base };
  return { label: "Aira", greeting: "Halo, saya Aira. Anda dapat mengirim teks, foto, video, atau pesan suara.", historyLabel: "Riwayat percakapan", inputPlaceholder: "Tulis pesan untuk Aira…", thinkingLabel: "Aira sedang berpikir…", palette: withAccent(base, accent) };
}
