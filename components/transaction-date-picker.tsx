import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const pad = (value: number) => String(value).padStart(2, "0");
const formatDate = (date: Date) => `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

const parseDate = (value: string) => {
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return new Date();
  const candidate = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return candidate.getFullYear() === Number(match[3]) && candidate.getMonth() === Number(match[2]) - 1 && candidate.getDate() === Number(match[1]) ? candidate : new Date();
};

export function TransactionDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const colors = useColors();
  const selectedDate = useMemo(() => parseDate(value), [value]);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  useEffect(() => {
    setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const days = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
    const lastDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    return Array.from({ length: firstDay + lastDate }, (_, index) => index < firstDay ? null : index - firstDay + 1);
  }, [visibleMonth]);

  const pickDate = (day: number) => {
    onChange(formatDate(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)));
    setOpen(false);
  };

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Pilih tanggal transaksi" onPress={() => setOpen(true)} style={({ pressed }) => [styles.trigger, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
      <MaterialIcons name="calendar-month" size={19} color={colors.primary} />
      <Text style={[styles.triggerText, { color: colors.foreground }]}>{value}</Text>
      <MaterialIcons name="expand-more" size={18} color={colors.muted} />
    </Pressable>
    <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.sheetHeader}>
            <View><Text style={[styles.sheetTitle, { color: colors.foreground }]}>Pilih tanggal transaksi</Text><Text style={[styles.sheetSub, { color: colors.muted }]}>Tanggal dapat disunting untuk transaksi yang terlambat dicatat.</Text></View>
            <Pressable accessibilityLabel="Tutup kalender" onPress={() => setOpen(false)} style={({ pressed }) => [styles.close, { backgroundColor: colors.surface }, pressed && styles.pressed]}><MaterialIcons name="close" size={20} color={colors.foreground} /></Pressable>
          </View>
          <View style={styles.monthRow}>
            <Pressable accessibilityLabel="Bulan sebelumnya" onPress={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} style={({ pressed }) => [styles.monthButton, { backgroundColor: colors.surface }, pressed && styles.pressed]}><MaterialIcons name="chevron-left" size={22} color={colors.primary} /></Pressable>
            <Text style={[styles.monthTitle, { color: colors.foreground }]}>{MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</Text>
            <Pressable accessibilityLabel="Bulan berikutnya" onPress={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} style={({ pressed }) => [styles.monthButton, { backgroundColor: colors.surface }, pressed && styles.pressed]}><MaterialIcons name="chevron-right" size={22} color={colors.primary} /></Pressable>
          </View>
          <View style={styles.weekRow}>{WEEKDAYS.map((weekday) => <Text key={weekday} style={[styles.weekday, { color: colors.muted }]}>{weekday}</Text>)}</View>
          <View style={styles.dayGrid}>{days.map((day, index) => {
            if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
            const active = selectedDate.getFullYear() === visibleMonth.getFullYear() && selectedDate.getMonth() === visibleMonth.getMonth() && selectedDate.getDate() === day;
            return <Pressable key={day} accessibilityLabel={`Pilih tanggal ${day}`} onPress={() => pickDate(day)} style={({ pressed }) => [styles.dayCell, active && { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.dayText, { color: active ? "#FFFFFF" : colors.foreground }]}>{day}</Text></Pressable>;
          })}</View>
          <Pressable onPress={() => { onChange(formatDate(new Date())); setOpen(false); }} style={({ pressed }) => [styles.todayButton, { borderColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.todayText, { color: colors.primary }]}>Gunakan tanggal hari ini</Text></Pressable>
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  trigger: { minHeight: 48, borderWidth: 1, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 12 },
  triggerText: { flex: 1, fontSize: 14, fontWeight: "700" },
  backdrop: { flex: 1, backgroundColor: "rgba(8, 20, 36, 0.48)", justifyContent: "center", padding: 18 },
  sheet: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 22, padding: 16, gap: 14 },
  sheetHeader: { flexDirection: "row", gap: 12, alignItems: "flex-start", justifyContent: "space-between" },
  sheetTitle: { fontSize: 17, fontWeight: "800" },
  sheetSub: { fontSize: 12, lineHeight: 17, marginTop: 3, maxWidth: 245 },
  close: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  monthButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  monthTitle: { flex: 1, textAlign: "center", fontSize: 14, fontWeight: "800" },
  weekRow: { flexDirection: "row" },
  weekday: { width: "14.2857%", textAlign: "center", fontSize: 10.5, fontWeight: "700" },
  dayGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: "14.2857%", aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 12, marginVertical: 1 },
  dayText: { fontSize: 13, fontWeight: "700" },
  todayButton: { borderWidth: 1, minHeight: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  todayText: { fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
