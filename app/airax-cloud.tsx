import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { AiraCard, LoadingState, OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { BackupProgressPanel, type BackupProgress } from "@/components/backup-progress";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

const formatBytes = (value: number) => value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / (1024 * 1024)).toFixed(1)} MB`;

export default function AiraXCloudScreen() {
  const colors = useColors();
  const { state, isHydrated, replaceAllData } = useFinance();
  const isAccount = state.profile.mode === "account";
  const backups = trpc.airaxCloud.listMine.useQuery(undefined, { enabled: isHydrated && isAccount, retry: false });
  const create = trpc.airaxCloud.create.useMutation();
  const restore = trpc.airaxCloud.restoreLatest.useQuery(undefined, { enabled: false, retry: false });
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const isWorking = progress?.status === "working";

  const backupNow = async () => {
    if (!isAccount) { Alert.alert("Masuk diperlukan", "AiraXCloud memakai ruang cadangan milik akun AiraX yang sedang masuk.", [{ text: "Batal", style: "cancel" }, { text: "Masuk", onPress: () => router.push("/login" as never) }]); return; }
    try {
      setProgress({ percent: 15, title: "Menyiapkan cadangan cloud", detail: "Menyusun data akun dan mengenkripsi pengiriman ke AiraXCloud.", status: "working" });
      await Promise.resolve();
      setProgress({ percent: 48, title: "Mengirim ke AiraXCloud", detail: "Arsip cadangan sedang disimpan ke ruang akun Anda.", status: "working" });
      const created = await create.mutateAsync({ payload: JSON.stringify(state) });
      setProgress({ percent: 82, title: "Memperbarui daftar cadangan", detail: "Memeriksa metadata arsip yang baru dibuat.", status: "working" });
      await backups.refetch();
      setProgress({ percent: 100, title: "Cadangan AiraXCloud selesai", detail: created ? `${created.fileName} berhasil tersimpan.` : "Arsip baru berhasil tersimpan.", status: "success" });
      Alert.alert("Cadangan AiraXCloud tersimpan", created ? `${created.fileName}\n${formatBytes(created.sizeBytes)}` : "Arsip baru telah dibuat.");
    } catch (error) { const message = getUserFacingError(error, "Periksa koneksi dan akun Anda."); setProgress({ percent: 100, title: "Cadangan belum berhasil", detail: message, status: "error" }); Alert.alert("Cadangan belum berhasil", message); }
  };
  const restoreLatest = async () => {
    if (!isAccount) { Alert.alert("Masuk diperlukan", "Mode Guest dapat memulihkan backup offline dari berkas, bukan AiraXCloud."); return; }
    try {
      setProgress({ percent: 18, title: "Memeriksa AiraXCloud", detail: "Mencari arsip aktif terbaru untuk akun ini.", status: "working" });
      const result = await restore.refetch();
      if (!result.data) { Alert.alert("Belum ada cadangan", "Akun ini belum memiliki arsip AiraXCloud aktif."); return; }
      setProgress({ percent: 56, title: "Membaca cadangan cloud", detail: "Memvalidasi isi arsip sebelum data diterapkan.", status: "working" });
      const parsed = JSON.parse(result.data.payload);
      Alert.alert("Pulihkan cadangan AiraXCloud?", `Arsip ${result.data.fileName} akan mengganti data lokal akun ini.`, [{ text: "Batal", style: "cancel", onPress: () => setProgress(null) }, { text: "Pulihkan", style: "destructive", onPress: () => { void (async () => { try { setProgress({ percent: 82, title: "Menerapkan cadangan cloud", detail: "Mengganti data lokal akun dengan arsip yang dipilih.", status: "working" }); await replaceAllData(parsed); setProgress({ percent: 100, title: "Pemulihan AiraXCloud selesai", detail: "Data akun berhasil diterapkan dari cadangan terbaru.", status: "success" }); } catch { setProgress({ percent: 100, title: "Pemulihan belum berhasil", detail: "Data lokal tidak dapat diperbarui dari arsip cloud.", status: "error" }); } })(); } }]);
    } catch (error) { const message = getUserFacingError(error, "Berkas cloud tidak dapat dibaca."); setProgress({ percent: 100, title: "Pemulihan belum berhasil", detail: message, status: "error" }); Alert.alert("Pemulihan belum berhasil", message); }
  };

  if (!isHydrated) return <LoadingState />;
  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={styles.headerText}><Text style={[styles.title, { color: colors.foreground }]}>AiraXCloud</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Pencadangan cloud aman untuk akun AiraX.</Text></View></View>
    <AiraCard style={[styles.hero, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}40` }]}><View style={[styles.cloudIcon, { backgroundColor: `${colors.primary}18` }]}><MaterialIcons name="cloud" size={30} color={colors.primary} /></View><View style={styles.heroText}><Text style={[styles.heroTitle, { color: colors.foreground }]}>{isAccount ? (state.profile.displayName ?? "Akun AiraX") : "Mode Guest"}</Text><Text style={[styles.heroDetail, { color: colors.muted }]}>{isAccount ? "Cadangan tersimpan pada ruang akun yang sedang login. Pencadangan hanya terjadi saat Anda menekan tombol." : "Masuk untuk memakai AiraXCloud. Pemulihan berkas offline tetap tersedia untuk guest."}</Text></View></AiraCard>
    <AiraCard style={styles.card}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Cadangkan data akun</Text><Text style={[styles.detail, { color: colors.muted }]}>Mencakup data keuangan, riwayat chat Aira, rencana, knowledge, pengaturan aplikasi, serta Galeri Hasil Aira termasuk favorit dan koleksi. Kata sandi serta token keamanan tidak dimasukkan ke arsip.</Text><BackupProgressPanel progress={progress} /><PrimaryButton label={isWorking ? "Memproses…" : "Buat cadangan AiraXCloud"} icon="cloud-upload" disabled={isWorking} onPress={() => { void backupNow(); }} /><OutlineButton label={isWorking ? "Memproses…" : "Pulihkan cadangan terbaru"} icon="cloud-download" onPress={() => { void restoreLatest(); }} /></AiraCard>
    <AiraCard style={styles.card}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Daftar cadangan akun</Text>{backups.isLoading ? <Text style={[styles.detail, { color: colors.muted }]}>Memuat arsip…</Text> : !isAccount ? <Text style={[styles.detail, { color: colors.muted }]}>Daftar AiraXCloud tersedia setelah Anda masuk akun.</Text> : backups.data?.length ? backups.data.map((backup) => <View key={backup.id} style={[styles.archive, { borderTopColor: colors.border }]}><MaterialIcons name="insert-drive-file" size={20} color={colors.primary} /><View style={styles.archiveText}><Text numberOfLines={1} style={[styles.archiveName, { color: colors.foreground }]}>{backup.fileName}</Text><Text style={[styles.archiveDetail, { color: colors.muted }]}>{formatBytes(backup.sizeBytes)} · {new Date(backup.createdAt).toLocaleString("id-ID")}</Text></View></View>) : <Text style={[styles.detail, { color: colors.muted }]}>Belum ada cadangan AiraXCloud untuk akun ini.</Text>}</AiraCard>
    <View style={[styles.info, { backgroundColor: `${colors.warning}12` }]}><MaterialIcons name="info-outline" size={20} color={colors.warning} /><Text style={[styles.infoText, { color: colors.foreground }]}>Setelah login, AiraX akan mencoba memulihkan cadangan AiraXCloud terbaru secara otomatis. Administrator dapat membatasi atau menghapus arsip dari SERVER DATABASE.</Text></View>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { gap: 13, paddingBottom: 28 }, header: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 2 }, headerText: { flex: 1, minWidth: 0 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, title: { fontSize: 22, fontWeight: "800" }, subtitle: { fontSize: 12, marginTop: 2 }, hero: { alignItems: "center", flexDirection: "row", gap: 12, padding: 16 }, cloudIcon: { alignItems: "center", borderRadius: 16, height: 58, justifyContent: "center", width: 58 }, heroText: { flex: 1, minWidth: 0 }, heroTitle: { fontSize: 16, fontWeight: "800" }, heroDetail: { fontSize: 12, lineHeight: 18, marginTop: 4 }, card: { gap: 10 }, cardTitle: { fontSize: 15, fontWeight: "800" }, detail: { fontSize: 12, lineHeight: 18 }, archive: { alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 10, paddingTop: 10 }, archiveText: { flex: 1, minWidth: 0 }, archiveName: { fontSize: 12, fontWeight: "800" }, archiveDetail: { fontSize: 10, marginTop: 3 }, info: { alignItems: "flex-start", borderRadius: 15, flexDirection: "row", gap: 9, padding: 13 }, infoText: { flex: 1, fontSize: 12, lineHeight: 18 }, pressed: { opacity: .7 } });
