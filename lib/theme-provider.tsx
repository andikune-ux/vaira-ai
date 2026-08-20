import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

type ColorVisionMode = "standard" | "accessible";
type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  colorVisionMode: ColorVisionMode;
  setColorVisionMode: (mode: ColorVisionMode) => void;
};

const THEME_STORAGE_KEY = "airax-ai.theme-preference";
const VISION_STORAGE_KEY = "airax-ai.color-vision-preference";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function paletteFor(scheme: ColorScheme, vision: ColorVisionMode) {
  const base = SchemeColors[scheme];
  if (vision === "standard") return base;
  // Okabe-Ito derived accents: distinguishable for common red/green color vision differences.
  return {
    ...base,
    primary: scheme === "light" ? "#0072B2" : "#56B4E9",
    success: scheme === "light" ? "#009E73" : "#56D5AD",
    warning: scheme === "light" ? "#D55E00" : "#FFB45F",
    error: scheme === "light" ? "#CC79A7" : "#F0A7D1",
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);
  const [colorVisionMode, setColorVisionModeState] = useState<ColorVisionMode>("standard");

  const applyTheme = useCallback((scheme: ColorScheme, vision: ColorVisionMode) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    const palette = paletteFor(scheme, vision);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      Object.entries(palette).forEach(([token, value]) => root.style.setProperty(`--color-${token}`, value));
    }
  }, []);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(THEME_STORAGE_KEY), AsyncStorage.getItem(VISION_STORAGE_KEY)]).then(([storedScheme, storedVision]) => {
      if (storedScheme === "dark" || storedScheme === "light") setColorSchemeState(storedScheme);
      if (storedVision === "accessible" || storedVision === "standard") setColorVisionModeState(storedVision);
    }).catch(() => undefined);
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    applyTheme(scheme, colorVisionMode);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
  }, [applyTheme, colorVisionMode]);
  const setColorVisionMode = useCallback((mode: ColorVisionMode) => {
    setColorVisionModeState(mode);
    applyTheme(colorScheme, mode);
    void AsyncStorage.setItem(VISION_STORAGE_KEY, mode);
  }, [applyTheme, colorScheme]);

  useEffect(() => { applyTheme(colorScheme, colorVisionMode); }, [applyTheme, colorScheme, colorVisionMode]);
  const palette = paletteFor(colorScheme, colorVisionMode);
  const themeVariables = useMemo(() => vars({ "color-primary": palette.primary, "color-background": palette.background, "color-surface": palette.surface, "color-foreground": palette.foreground, "color-muted": palette.muted, "color-border": palette.border, "color-success": palette.success, "color-warning": palette.warning, "color-error": palette.error }), [palette]);
  const value = useMemo(() => ({ colorScheme, setColorScheme, colorVisionMode, setColorVisionMode }), [colorScheme, setColorScheme, colorVisionMode, setColorVisionMode]);

  return <ThemeContext.Provider value={value}><View style={[{ flex: 1 }, themeVariables]}>{children}</View></ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeContext must be used within ThemeProvider");
  return context;
}
