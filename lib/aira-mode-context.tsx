import { createContext, useContext, useMemo, type PropsWithChildren } from "react";

import { useColors } from "@/hooks/use-colors";
import { getAiraModePresentation } from "@/lib/aira-mode-presentation";
import { useFinance } from "@/lib/finance/finance-context";
import type { ThemeColorPalette } from "@/constants/theme";

const AiraModePaletteContext = createContext<ThemeColorPalette | null>(null);

export function AiraModeProvider({ children }: PropsWithChildren) {
  const baseColors = useColors();
  const { state } = useFinance();
  const accent = state.profile.uiPreferences.modeAccentColors?.[state.profile.aiMode];
  const colors = useMemo(() => getAiraModePresentation(state.profile.aiMode, baseColors, accent).palette, [accent, baseColors, state.profile.aiMode]);
  return <AiraModePaletteContext.Provider value={colors}>{children}</AiraModePaletteContext.Provider>;
}

export function useAiraModeColors() {
  const fallback = useColors();
  return useContext(AiraModePaletteContext) ?? fallback;
}
