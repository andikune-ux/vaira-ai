import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AiraCard, OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import { createLocalBackup } from "@/lib/local-backup";
import { trpc } from "@/lib/trpc";

export default function FactoryResetScreen() {
  const colors = useColors();
  const { state, clearLocalData } = useFinance();
  const cloudPush = trpc.airaxCloud.create.useMutation();
  const [source, setSource] = useState<"file" | "cloud">("file");
  const [isWorking, setIsWorking] = useState(false);
  const backupThenReset = async () => {
    if (source === "cloud" && state.profile.mode !== "account") { Alert.alert("Masuk diperlukan", "Pilih cadangan berkas lokal atau masuk dengan akun untuk mencadangkan ke AiraXCloud.", [{ text: "Batal", style: "cancel" }, { text: "Masuk", onPress: () => router.push("/login") }]); return; }
    setIsWorking(true);
    try {
      if (source === "file") await createLocalBackup(state);
      else await cloudPush.mutateAsync({ payload: JSON.stringify(state) });
      Alert.alert("Konfirmasi terakhir", "Cadangan telah dibuat. Reset factory akan menghapus seluruh data lokal pada akun/scope ini dan tidak dapat dibatalkan.", [{ text: "Batal", style: "cancel" }, { text: "Hapus total", style: "destructive", onPress: () => { void (async () => { await clearLocalData(); Alert.alert("Reset selesai", "Data lokal telah dihapus.", [{ text: "Kembali", onPress: () => router.replace("/(tabs)") }]); })(); } }]);
    } catch { Alert.alert("Cadangan gagal", "Data tidak dihapus karena cadangan pilihan Anda belum berhasil dibuat."); } finally { setIsWorking(false); }
  };
  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View><Text style={[styles.title, { color: colors.foreground }]}>Reset factory</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Hapus data secara permanen dengan cadangan.</Text></View></View><View style={[styles.warning, { backgroundColor: `${colors.error}12` }]}><MaterialIcons name="warning" size={22} color={colors.error} /><Text style={[styles.warningText, { color: colors.foreground }]}>Reset menghapus dompet, transaksi, laporan, rencana, knowledge, dan pengaturan pada ruang data aktif. AiraX tidak akan menghapus cadangan yang sudah dibuat.</Text></View><AiraCard style={styles.card}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Pilih tempat cadangan</Text><Choice selected={source === "file"} icon="folder" label="Berkas lokal / AiraXBackup" detail="Simpan JSON pada folder backup perangkat yang dipilih." onPress={() => setSource("file")} /><Choice selected={source === "cloud"} icon="cloud" label="AiraXCloud" detail={state.profile.mode === "account" ? "Simpan arsip ke ruang akun AiraXCloud." : "Masuk terlebih dahulu untuk memakai AiraXCloud."} onPress={() => setSource("cloud")} /></AiraCard><PrimaryButton label={isWorking ? "Membuat cadangan…" : "Cadangkan lalu reset total"} icon="delete-forever" disabled={isWorking} onPress={() => { void backupThenReset(); }} /><OutlineButton label="Batal" onPress={() => router.back()} /></ScrollView></ScreenContainer>;
}
function Choice({ selected, icon, label, detail, onPress }: { selected: boolean; icon: keyof typeof MaterialIcons.glyphMap; label: string; detail: string; onPress: () => void }) { const colors = useColors(); return <Pressable onPress={onPress} style={({ pressed }) => [styles.choice, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? `${colors.primary}10` : colors.background }, pressed && styles.pressed]}><View style={[styles.choiceIcon, { backgroundColor: selected ? colors.primary : colors.surface }]}><MaterialIcons name={icon} size={20} color={selected ? "#FFFFFF" : colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.choiceLabel, { color: colors.foreground }]}>{label}</Text><Text style={[styles.choiceDetail, { color: colors.muted }]}>{detail}</Text></View><MaterialIcons name={selected ? "radio-button-checked" : "radio-button-unchecked"} size={22} color={selected ? colors.primary : colors.muted} /></Pressable>; }
const styles = StyleSheet.create({ content: { gap: 13, paddingBottom: 24 }, header: { alignItems: "center", flexDirection: "row", gap: 12 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, title: { fontSize: 21, fontWeight: "800" }, subtitle: { fontSize: 12, marginTop: 2 }, warning: { alignItems: "flex-start", borderRadius: 16, flexDirection: "row", gap: 9, padding: 14 }, warningText: { flex: 1, fontSize: 12, lineHeight: 19 }, card: { gap: 10 }, cardTitle: { fontSize: 15, fontWeight: "800" }, choice: { alignItems: "center", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 10, padding: 11 }, choiceIcon: { alignItems: "center", borderRadius: 12, height: 40, justifyContent: "center", width: 40 }, choiceLabel: { fontSize: 13, fontWeight: "800" }, choiceDetail: { fontSize: 11, lineHeight: 16, marginTop: 2 }, pressed: { opacity: 0.7 } });
