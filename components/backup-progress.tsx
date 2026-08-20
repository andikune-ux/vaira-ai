import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

export type BackupProgress = {
  percent: number;
  title: string;
  detail: string;
  status: "working" | "success" | "error";
};

export function BackupProgressPanel({ progress }: { progress: BackupProgress | null }) {
  const colors = useColors();
  if (!progress) return null;
  const accent = progress.status === "success" ? colors.success : progress.status === "error" ? colors.error : colors.primary;
  const icon = progress.status === "success" ? "check-circle" : progress.status === "error" ? "error-outline" : "sync";
  return <View style={[styles.card, { backgroundColor: `${accent}10`, borderColor: `${accent}55` }]}><View style={styles.titleRow}><MaterialIcons name={icon} size={20} color={accent} /><Text style={[styles.title, { color: colors.foreground }]}>{progress.title}</Text><Text style={[styles.percent, { color: accent }]}>{progress.percent}%</Text></View><Text style={[styles.detail, { color: colors.muted }]}>{progress.detail}</Text><View style={[styles.track, { backgroundColor: colors.border }]}><View style={[styles.fill, { backgroundColor: accent, width: `${Math.max(0, Math.min(100, progress.percent))}%` }]} /></View></View>;
}

const styles = StyleSheet.create({ card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, gap: 7, padding: 12 }, titleRow: { alignItems: "center", flexDirection: "row", gap: 8 }, title: { flex: 1, fontSize: 13, fontWeight: "800" }, percent: { fontSize: 13, fontWeight: "900" }, detail: { fontSize: 11, lineHeight: 16 }, track: { borderRadius: 5, height: 8, overflow: "hidden" }, fill: { borderRadius: 5, height: "100%" } });
