import { useEffect, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { useColors } from "@/hooks/use-colors";

export function RealtimeClock() {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1_000); return () => clearInterval(timer); }, []);
  const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
  const date = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }).format(now);
  const compact = width < 420;
  return <View style={[styles.box, compact && styles.compactBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text numberOfLines={1} style={[styles.time, compact && styles.compactTime, { color: colors.foreground }]}>{time}</Text><Text numberOfLines={2} style={[styles.date, compact && styles.compactDate, { color: colors.muted }]}>{date}</Text></View>;
}
const styles = StyleSheet.create({ box: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, minWidth: 132, paddingHorizontal: 9, paddingVertical: 6 }, compactBox: { minWidth: 124, paddingHorizontal: 7, paddingVertical: 6 }, time: { fontSize: 17, fontWeight: "800", letterSpacing: -0.4, textAlign: "right" }, compactTime: { fontSize: 15, letterSpacing: -0.2 }, date: { fontSize: 9, fontWeight: "600", lineHeight: 12, marginTop: 1, textAlign: "right" }, compactDate: { fontSize: 8, lineHeight: 10 } });
