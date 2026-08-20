import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

type Key = "AC" | "DEL" | "%" | "÷" | "×" | "−" | "+" | "=" | "." | "(" | ")" | "√" | "^" | "MC" | "MR" | "M+" | "M−" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
const keys: Key[][] = [["MC", "MR", "M+", "M−"], ["AC", "DEL", "%", "÷"], ["(", ")", "√", "×"], ["7", "8", "9", "−"], ["4", "5", "6", "+"], ["1", "2", "3", "^"], ["0", ".", "="]];

function calculate(raw: string) {
  const expression = raw.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/√(\d+(?:\.\d+)?)/g, "Math.sqrt($1)").replace(/(\d+(?:\.\d+)?)%/g, "($1/100)").replace(/\^/g, "**");
  if (!/^[0-9+\-*/().%\sMathsqrt*]+$/.test(expression) || expression.length > 160) throw new Error("Ekspresi tidak valid");
  const answer = Function(`"use strict"; return (${expression});`)();
  if (!Number.isFinite(answer)) throw new Error("Hasil tidak valid");
  return String(Math.round((answer + Number.EPSILON) * 1e10) / 1e10);
}

export default function CalculatorScreen() {
  const colors = useColors();
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState(0);
  const append = (value: string) => setDisplay((previous) => previous === "0" && /[0-9.]/.test(value) ? value : `${previous}${value}`);
  const value = () => Number(calculate(display));
  const press = (key: Key) => {
    try {
      if (key === "AC") setDisplay("0");
      else if (key === "DEL") setDisplay((previous) => previous.length <= 1 ? "0" : previous.slice(0, -1));
      else if (key === "=") setDisplay(calculate(display));
      else if (key === "MC") setMemory(0);
      else if (key === "MR") append(String(memory));
      else if (key === "M+") setMemory((previous) => previous + value());
      else if (key === "M−") setMemory((previous) => previous - value());
      else if (key === "√") append("√");
      else append(key);
    } catch { Alert.alert("Perhitungan tidak valid", "Periksa kembali ekspresi yang Anda masukkan."); }
  };
  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><View style={styles.page}><View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View><Text style={[styles.title, { color: colors.foreground }]}>Kalkulator</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Memori, persen, akar, pangkat, dan kurung.</Text></View></View><View style={[styles.display, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.memory, { color: colors.muted }]}>Memori: {memory}</Text><Text numberOfLines={2} adjustsFontSizeToFit style={[styles.result, { color: colors.foreground }]}>{display}</Text></View><View style={styles.keypad}>{keys.map((row, rowIndex) => <View key={rowIndex} style={styles.keyRow}>{row.map((key, index) => { const primary = ["÷", "×", "−", "+", "="].includes(key); const utility = ["AC", "DEL", "MC", "MR", "M+", "M−"].includes(key); return <Pressable key={`${key}-${index}`} onPress={() => press(key)} style={({ pressed }) => [styles.key, { backgroundColor: primary ? colors.primary : utility ? `${colors.warning}14` : colors.surface, borderColor: primary ? colors.primary : colors.border }, key === "0" && styles.zeroKey, pressed && styles.pressed]}><Text style={[styles.keyText, { color: primary ? "#FFFFFF" : utility ? colors.warning : colors.foreground }]}>{key}</Text></Pressable>; })}</View>)}</View></View></ScreenContainer>;
}
const styles = StyleSheet.create({ page: { flex: 1, gap: 13 }, header: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 4 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, title: { fontSize: 21, fontWeight: "800" }, subtitle: { fontSize: 12, marginTop: 2 }, display: { alignItems: "flex-end", borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, minHeight: 132, justifyContent: "flex-end", padding: 17 }, memory: { fontSize: 11, marginBottom: 11 }, result: { fontSize: 35, fontWeight: "800", textAlign: "right", width: "100%" }, keypad: { gap: 8 }, keyRow: { flexDirection: "row", gap: 8 }, key: { alignItems: "center", borderRadius: 16, borderWidth: 1, flex: 1, height: 50, justifyContent: "center" }, zeroKey: { flex: 2.05 }, keyText: { fontSize: 17, fontWeight: "800" }, pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] } });
