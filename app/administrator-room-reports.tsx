import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { OutlineButton } from "@/components/aira-ui";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

function formatDate(value: string) { return new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }); }

export default function AdministratorRoomReportsScreen() {
  const params = useLocalSearchParams<{ username?: string; password?: string }>();
  const username = String(params.username ?? "");
  const password = String(params.password ?? "");
  const reports = trpc.administrator.reports.useQuery({ username, password }, { enabled: Boolean(username && password), retry: false });
  const review = trpc.administrator.reviewReport.useMutation({ onSuccess: () => { void reports.refetch(); } });
  const remove = trpc.administrator.deleteReports.useMutation({ onSuccess: () => { void reports.refetch(); setSelected([]); } });
  const [selected, setSelected] = useState<number[]>([]);
  const rows = reports.data ?? [];
  const update = (reportId: number, status: "reviewing" | "resolved" | "dismissed") => { void review.mutateAsync({ username, password, reportId, status }).catch((error) => Alert.alert("Laporan belum diperbarui", getUserFacingError(error, "Coba lagi."))); };
  const confirmDelete = (reportIds?: number[], deleteAll = false) => {
    const countText = deleteAll ? "semua laporan aktif" : `${reportIds?.length ?? 0} laporan terpilih`;
    Alert.alert("Hapus laporan?", `${countText} akan disembunyikan dari daftar. Data tetap disimpan untuk audit administrator.`, [{ text: "Batal", style: "cancel" }, { text: "Hapus", style: "destructive", onPress: () => void remove.mutateAsync({ username, password, reportIds, deleteAll }).catch((error) => Alert.alert("Laporan belum dihapus", getUserFacingError(error, "Coba lagi."))) }]);
  };
  const toggle = (id: number) => setSelected((current: number[]) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.kicker}>V A I R A  A I // ROOM GLOBAL</Text><Text style={styles.title}>Laporan & Moderasi</Text><Text style={styles.help}>Tindakan dicatat untuk audit. Menghapus laporan hanya menyembunyikannya dari daftar aktif.</Text>
    <View style={styles.toolbar}><Text style={styles.selection}>{selected.length ? `${selected.length} dipilih` : `${rows.length} laporan aktif`}</Text><View style={styles.toolbarActions}><Pressable disabled={!selected.length || remove.isPending} onPress={() => confirmDelete(selected)} style={[styles.iconButton, (!selected.length || remove.isPending) && styles.disabled]} accessibilityLabel="Hapus laporan yang ditandai"><MaterialIcons name="delete-outline" size={17} color="#ff9c9c" /></Pressable><Pressable disabled={!rows.length || remove.isPending} onPress={() => confirmDelete(undefined, true)} style={[styles.iconButton, (!rows.length || remove.isPending) && styles.disabled]} accessibilityLabel="Hapus semua laporan"><MaterialIcons name="delete-sweep" size={17} color="#ff9c9c" /></Pressable></View></View>
    {rows.map((report) => <View key={report.id} style={styles.card}><View style={styles.cardHeader}><Pressable onPress={() => toggle(report.id)} style={styles.selectButton} accessibilityLabel={`Pilih laporan ${report.id}`}><MaterialIcons name={selected.includes(report.id) ? "check-box" : "check-box-outline-blank"} size={20} color={selected.includes(report.id) ? "#58ff9a" : "#9dd8af"} /></Pressable><View style={styles.cardHeading}><Text style={styles.name}>#{report.id} · {report.reportedDisplayName}</Text><Text style={styles.meta}>{report.reason} · {report.priority} · {report.status}</Text></View><Pressable onPress={() => confirmDelete([report.id])} style={styles.deleteOne} accessibilityLabel={`Hapus laporan ${report.id}`}><MaterialIcons name="delete-outline" size={18} color="#ff9c9c" /></Pressable></View>{report.details ? <Text style={styles.details}>{report.details}</Text> : null}<Text style={styles.date}>Dibuat: {formatDate(report.createdAt)}{report.reviewedAt ? ` · Ditinjau: ${formatDate(report.reviewedAt)}` : ""}</Text><View style={styles.actionRow}><OutlineButton label="Tinjau" icon="visibility" onPress={() => update(report.id, "reviewing")} /><OutlineButton label="Selesaikan" icon="check-circle" onPress={() => update(report.id, "resolved")} /><OutlineButton label="Abaikan" icon="close" onPress={() => update(report.id, "dismissed")} /></View></View>)}
    {!rows.length ? <Text style={styles.empty}>Belum ada laporan aktif.</Text> : null}<OutlineButton label="Kembali ke console" icon="arrow-back" onPress={() => router.back()} />
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ page: { padding: 18, gap: 12 }, kicker: { color: "#58ff9a", fontSize: 12, fontWeight: "900" }, title: { color: "#eaffef", fontSize: 21, fontWeight: "900" }, help: { color: "#9dd8af", fontSize: 12, lineHeight: 17 }, toolbar: { alignItems: "center", backgroundColor: "#10271a", borderColor: "#1d5a37", borderRadius: 10, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: 9 }, selection: { color: "#eaffef", fontSize: 11, fontWeight: "800" }, toolbarActions: { flexDirection: "row", gap: 7 }, iconButton: { alignItems: "center", borderColor: "#ff9c9c66", borderRadius: 8, borderWidth: 1, height: 32, justifyContent: "center", width: 38 }, disabled: { opacity: 0.35 }, card: { backgroundColor: "#07130b", borderColor: "#1d5a37", borderRadius: 12, borderWidth: 1, gap: 7, padding: 12 }, cardHeader: { alignItems: "center", flexDirection: "row", gap: 7 }, selectButton: { padding: 2 }, cardHeading: { flex: 1, minWidth: 0 }, name: { color: "#eaffef", fontSize: 13, fontWeight: "900" }, meta: { color: "#9dd8af", fontSize: 11, marginTop: 2 }, deleteOne: { padding: 5 }, details: { color: "#9dd8af", fontSize: 11, lineHeight: 16 }, date: { color: "#75b789", fontSize: 10 }, actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, empty: { color: "#9dd8af", paddingVertical: 18, textAlign: "center" } });
