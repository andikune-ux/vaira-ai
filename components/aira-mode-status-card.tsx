import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ChickenIcon } from "@/components/chicken-icon";
import { router } from "expo-router";
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from "react-native";
import { useEffect } from "react";

import { useColors } from "@/hooks/use-colors";
import { getAiraModePresentation } from "@/lib/aira-mode-presentation";
import { useFinance } from "@/lib/finance/finance-context";
import { formatCurrency } from "@/lib/finance/finance-utils";

const dueValue = (value?: string, day?: number) => value ? new Date(value).getTime() : day ? new Date(new Date().getFullYear(), new Date().getMonth(), day).getTime() : Number.MAX_SAFE_INTEGER;

export function AiraModeStatusCard() {
  const base = useColors(); const { state } = useFinance(); const accent = state.profile.uiPreferences.modeAccentColors?.[state.profile.aiMode]; const presentation = getAiraModePresentation(state.profile.aiMode, base, accent); const colors = presentation.palette;
  useEffect(() => { if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) UIManager.setLayoutAnimationEnabledExperimental(true); LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); }, [state.profile.aiMode]);
  const goal = [...state.goals].filter((item) => item.currentAmount < item.targetAmount).sort((left, right) => (left.targetDate ?? "9999").localeCompare(right.targetDate ?? "9999"))[0];
  const bill = [...state.commitments].filter((item) => !item.isDone && (item.kind === "bill" || item.kind === "debt")).sort((left, right) => dueValue(left.dueAt, left.dueDayOfMonth) - dueValue(right.dueAt, right.dueDayOfMonth))[0];
  const goalPercent = goal ? Math.min(100, Math.round(goal.currentAmount / Math.max(1, goal.targetAmount) * 100)) : 0;
  return <View style={styles.wrap}><Pressable accessibilityLabel={`${presentation.label} aktif. Buka layanan Aira.`} onPress={() => router.push("/chat" as never)} style={[styles.modeBadge, { backgroundColor: colors.primary, borderColor: "#FFFFFF" }]}><MaterialIcons name="psychology" size={17} color="#FFFFFF" /><View style={styles.onlineDot} /></Pressable>{goal || bill ? <View style={styles.grid}>{goal ? <Pressable onPress={() => router.push("/plans" as never)} style={[styles.widget, { backgroundColor: colors.surface, borderColor: colors.border }]}><ChickenIcon size={22} /><View style={styles.flex}><Text style={[styles.widgetLabel, { color: colors.muted }]}>Target terdekat</Text><Text style={[styles.widgetTitle, { color: colors.foreground }]} numberOfLines={1}>{goal.title}</Text><Text style={[styles.widgetDetail, { color: colors.success }]}>{goalPercent}% · {formatCurrency(goal.currentAmount)}</Text></View></Pressable> : null}{bill ? <Pressable onPress={() => router.push("/plans" as never)} style={[styles.widget, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="receipt-long" size={18} color={colors.warning} /><View style={styles.flex}><Text style={[styles.widgetLabel, { color: colors.muted }]}>Tagihan terdekat</Text><Text style={[styles.widgetTitle, { color: colors.foreground }]} numberOfLines={1}>{bill.title}</Text><Text style={[styles.widgetDetail, { color: colors.warning }]}>{bill.amount ? formatCurrency(bill.amount) : "Periksa jadwal"}</Text></View></Pressable> : null}</View> : null}</View>;
}

const styles = StyleSheet.create({ wrap: { gap: 8, marginTop: -22, position: "relative", zIndex: 2 }, modeBadge: { alignItems: "center", alignSelf: "flex-start", borderRadius: 18, borderWidth: 3, height: 36, justifyContent: "center", marginLeft: 18, shadowColor: "#10233D", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 5, width: 36 }, onlineDot: { backgroundColor: "#2DE1A2", borderColor: "#FFFFFF", borderRadius: 5, borderWidth: 1.5, bottom: 2, height: 10, position: "absolute", right: 1, width: 10 }, grid: { gap: 7, marginTop: 4 }, widget: { alignItems: "center", borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 9, padding: 10 }, flex: { flex: 1, minWidth: 0 }, widgetLabel: { fontSize: 9, fontWeight: "800" }, widgetTitle: { fontSize: 11, fontWeight: "900", marginTop: 2 }, widgetDetail: { fontSize: 10, fontWeight: "800", marginTop: 3 } });
