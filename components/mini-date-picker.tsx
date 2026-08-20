import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxDate?: string;
  optional?: boolean;
};

const DAYS = ["Sn", "Sl", "Rb", "Km", "Jm", "Sb", "Mg"];
const monthTitle = (date: Date) => new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(date);
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const parseKey = (value: string) => { const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value); if (!match) return null; const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])); return Number.isNaN(date.getTime()) ? null : date; };
const dateLabel = (value: string) => { const date = parseKey(value); return date ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date) : ""; };

export function MiniDatePicker({ label, value, onChange, placeholder = "Pilih tanggal", maxDate, optional = false }: Props) {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  const [cursor, setCursor] = useState(() => parseKey(value) ?? new Date());
  const max = useMemo(() => parseKey(maxDate ?? ""), [maxDate]);
  const selected = parseKey(value);
  useEffect(() => { const parsed = parseKey(value); if (parsed) setCursor(parsed); }, [value]);
  const year = cursor.getFullYear(); const month = cursor.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: offset + count }, (_, index) => index < offset ? null : new Date(year, month, index - offset + 1));
  const choose = (date: Date) => { if (max && date > max) return; onChange(dateKey(date)); setVisible(false); };
  const changeMonth = (delta: number) => setCursor((previous) => new Date(previous.getFullYear(), previous.getMonth() + delta, 1));
  const chooseToday = () => { const today = new Date(); if (!max || today <= max) { setCursor(today); choose(today); } };
  return <View style={styles.field}><Text style={[styles.label, { color: colors.muted }]}>{label}{optional ? " (opsional)" : ""}</Text><Pressable accessibilityLabel={`Pilih ${label.toLowerCase()} dari kalender`} onPress={() => setVisible(true)} style={({ pressed }) => [styles.trigger, { backgroundColor: colors.background, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="calendar-month" size={20} color={colors.primary} /><Text style={[styles.triggerText, { color: value ? colors.foreground : colors.muted }]}>{value ? dateLabel(value) : placeholder}</Text><MaterialIcons name="expand-more" size={20} color={colors.muted} /></Pressable><Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}><View style={styles.backdrop}><Pressable style={styles.scrim} onPress={() => setVisible(false)} /><View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}><View style={styles.handle} /><View style={styles.sheetHeader}><View><Text style={[styles.sheetTitle, { color: colors.foreground }]}>{label}</Text><Text style={[styles.sheetSubtitle, { color: colors.muted }]}>Pilih hari, bulan, dan tahun dari kalender.</Text></View><Pressable onPress={() => setVisible(false)} style={styles.close}><MaterialIcons name="close" size={21} color={colors.muted} /></Pressable></View><View style={styles.monthNav}><Pressable accessibilityLabel="Bulan sebelumnya" onPress={() => changeMonth(-1)} style={styles.nav}><MaterialIcons name="chevron-left" size={23} color={colors.primary} /></Pressable><Text style={[styles.monthTitle, { color: colors.foreground }]}>{monthTitle(cursor)}</Text><Pressable accessibilityLabel="Bulan berikutnya" onPress={() => changeMonth(1)} style={styles.nav}><MaterialIcons name="chevron-right" size={23} color={colors.primary} /></Pressable></View><View style={styles.week}>{DAYS.map((day) => <Text key={day} style={[styles.weekText, { color: colors.muted }]}>{day}</Text>)}</View><View style={styles.grid}>{cells.map((date, index) => { if (!date) return <View key={`gap-${index}`} style={styles.day} />; const disabled = Boolean(max && date > max); const isSelected = selected ? dateKey(date) === dateKey(selected) : false; const today = dateKey(date) === dateKey(new Date()); return <Pressable key={dateKey(date)} disabled={disabled} onPress={() => choose(date)} style={({ pressed }) => [styles.day, isSelected && { backgroundColor: colors.primary }, today && !isSelected && { borderColor: colors.primary, borderWidth: 1 }, disabled && styles.disabled, pressed && !disabled && styles.pressed]}><Text style={[styles.dayText, { color: isSelected ? "#FFFFFF" : disabled ? colors.border : colors.foreground }]}>{date.getDate()}</Text></Pressable>; })}</View><View style={styles.footer}><Pressable onPress={() => setVisible(false)} style={styles.footerButton}><Text style={[styles.footerCancel, { color: colors.muted }]}>Batal</Text></Pressable><Pressable onPress={chooseToday} style={[styles.todayButton, { backgroundColor: `${colors.primary}14` }]}><MaterialIcons name="today" size={17} color={colors.primary} /><Text style={[styles.todayText, { color: colors.primary }]}>Hari ini</Text></Pressable></View></View></View></Modal></View>;
}

const styles = StyleSheet.create({ field: { gap: 5 }, label: { fontSize: 12, fontWeight: "800" }, trigger: { alignItems: "center", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 9, minHeight: 48, paddingHorizontal: 13 }, triggerText: { flex: 1, fontSize: 14, fontWeight: "600" }, backdrop: { backgroundColor: "rgba(4,12,24,.45)", flex: 1, justifyContent: "flex-end" }, scrim: { flex: 1 }, sheet: { borderTopLeftRadius: 25, borderTopRightRadius: 25, borderWidth: StyleSheet.hairlineWidth, paddingBottom: 28, paddingHorizontal: 18, paddingTop: 10 }, handle: { alignSelf: "center", backgroundColor: "#9AA5B1", borderRadius: 3, height: 4, marginBottom: 12, opacity: .5, width: 42 }, sheetHeader: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" }, sheetTitle: { fontSize: 17, fontWeight: "900" }, sheetSubtitle: { fontSize: 11, lineHeight: 16, marginTop: 2 }, close: { alignItems: "center", height: 34, justifyContent: "center", width: 34 }, monthNav: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 16 }, nav: { alignItems: "center", height: 36, justifyContent: "center", width: 40 }, monthTitle: { fontSize: 15, fontWeight: "900", textTransform: "capitalize" }, week: { flexDirection: "row", marginTop: 10 }, weekText: { flex: 1, fontSize: 10, fontWeight: "800", textAlign: "center" }, grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 7 }, day: { alignItems: "center", borderRadius: 18, height: 36, justifyContent: "center", marginVertical: 2, width: "14.2857%" }, dayText: { fontSize: 12, fontWeight: "800" }, disabled: { opacity: .45 }, footer: { flexDirection: "row", gap: 8, justifyContent: "flex-end", marginTop: 13 }, footerButton: { borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 }, footerCancel: { fontSize: 12, fontWeight: "800" }, todayButton: { alignItems: "center", borderRadius: 10, flexDirection: "row", gap: 6, paddingHorizontal: 13, paddingVertical: 10 }, todayText: { fontSize: 12, fontWeight: "800" }, pressed: { opacity: .7, transform: [{ scale: .98 }] } });
