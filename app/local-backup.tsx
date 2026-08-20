import { getUserFacingError } from "@/lib/user-facing-error";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { AiraCard, OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { BackupProgressPanel, type BackupProgress } from "@/components/backup-progress";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import { BACKUP_DIRECTORY, chooseBackupFolder, createLocalBackup, getBackupLocationLabel, resetBackupFolder, restoreLatestLocalBackup, selectLocalBackup } from "@/lib/local-backup";

export default function LocalBackupScreen() {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const { state, replaceAllData } = useFinance();
  const compact = width < 380;
  const [locationLabel, setLocationLabel] = useState(`Folder ${BACKUP_DIRECTORY}`);
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const isWorking = progress?.status === "working";

  useEffect(() => { void getBackupLocationLabel().then(setLocationLabel); }, []);

  const createBackup = async () => {
    try {
      setProgress({ percent: 20, title: "Menyiapkan AiraXBackup", detail: "Menyusun data keuangan, chat, dan pengaturan ke arsip offline.", status: "working" });
      await Promise.resolve();
      setProgress({ percent: 68, title: "Menulis berkas cadangan", detail: "Menyimpan arsip pada folder AiraXBackup yang dipilih.", status: "working" });
      const location = await createLocalBackup(state);
      setProgress({ percent: 100, title: "Cadangan AiraXBackup selesai", detail: location, status: "success" });
      Alert.alert("Cadangan tersimpan", `Arsip AiraXBackup dibuat.\n\n${location}`);
    } catch (error) { const message = getUserFacingError(error, "Penyimpanan perangkat belum tersedia."); setProgress({ percent: 100, title: "Cadangan belum berhasil", detail: message, status: "error" }); Alert.alert("Cadangan belum berhasil", message); }
  };
  const confirmRestore = (snapshot: Awaited<ReturnType<typeof selectLocalBackup>>) => {
    if (!snapshot) return;
    Alert.alert("Pulihkan cadangan?", "Transaksi, dompet, rencana, dan pengaturan lokal akan diganti dengan isi berkas pilihan Anda.", [{ text: "Batal", style: "cancel", onPress: () => setProgress(null) }, { text: "Pulihkan", style: "destructive", onPress: () => { void (async () => { try { setProgress({ percent: 80, title: "Menerapkan AiraXBackup", detail: "Mengganti data lokal dengan isi arsip yang dipilih.", status: "working" }); await replaceAllData(snapshot); setProgress({ percent: 100, title: "Pemulihan AiraXBackup selesai", detail: "Data lokal berhasil dipulihkan dari arsip offline.", status: "success" }); } catch { setProgress({ percent: 100, title: "Pemulihan belum berhasil", detail: "Data lokal tidak dapat diperbarui dari arsip offline.", status: "error" }); } })(); } }]);
  };
  const restoreLatest = async () => {
    try {
      setProgress({ percent: 22, title: "Mencari AiraXBackup", detail: `Memeriksa arsip pada ${locationLabel}.`, status: "working" });
      const snapshot = await restoreLatestLocalBackup();
      if (!snapshot) { setProgress({ percent: 100, title: "Arsip belum ditemukan", detail: `Tidak ada AiraXBackup di ${locationLabel}.`, status: "error" }); Alert.alert("Berkas belum ditemukan", `Tidak ada arsip AiraXBackup di ${locationLabel}. Anda dapat memilih berkas sendiri.`); return; }
      setProgress({ percent: 58, title: "Memvalidasi AiraXBackup", detail: "Arsip ditemukan dan siap dipulihkan setelah konfirmasi.", status: "working" });
      confirmRestore(snapshot);
    } catch (error) { const message = getUserFacingError(error, "Berkas tidak dapat dibaca."); setProgress({ percent: 100, title: "Pemulihan belum berhasil", detail: message, status: "error" }); Alert.alert("Pemulihan belum berhasil", message); }
  };
  const chooseFolder = async () => {
    try {
      const location = await chooseBackupFolder();
      if (!location) return;
      setLocationLabel(location.label);
      Alert.alert("Folder AiraXBackup dipilih", `${location.label} digunakan untuk backup berikutnya dan pencarian pemulihan otomatis.`);
    } catch (error) { Alert.alert("Folder belum dapat dipilih", getUserFacingError(error, "Coba kembali dari perangkat Android.")); }
  };
  const restoreFromFile = async () => {
    try { setProgress({ percent: 30, title: "Memilih berkas cadangan", detail: "Menunggu pemilih berkas perangkat dan memvalidasi arsip pilihan.", status: "working" }); const snapshot = await selectLocalBackup(); if (!snapshot) { setProgress(null); return; } setProgress({ percent: 58, title: "Memvalidasi berkas cadangan", detail: "Berkas valid dan siap dipulihkan setelah konfirmasi.", status: "working" }); confirmRestore(snapshot); } catch (error) { const message = getUserFacingError(error, "Berkas tidak dapat dibaca."); setProgress({ percent: 100, title: "Pemulihan belum berhasil", detail: message, status: "error" }); Alert.alert("Pemulihan belum berhasil", message); }
  };

  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={styles.headerText}><Text numberOfLines={2} style={[styles.title, compact && styles.compactTitle, { color: colors.foreground }]}>Brankas & pemulihan</Text><Text numberOfLines={2} style={[styles.subtitle, { color: colors.muted }]}>Kendalikan cadangan data Anda.</Text></View></View><AiraCard style={[styles.hero, { backgroundColor: colors.primary, borderColor: colors.primary }]}><MaterialIcons name="enhanced-encryption" size={compact ? 24 : 28} color="#FFFFFF" /><View style={styles.heroContent}><Text numberOfLines={2} style={styles.heroTitle}>{locationLabel}</Text><Text style={styles.heroDetail}>Android dapat memilih folder AiraXBackup pada penyimpanan perangkat. Bila akses folder belum diberikan, aplikasi memakai brankas internal dengan aman.</Text></View></AiraCard><BackupProgressPanel progress={progress} /><AiraCard style={styles.card}><Text numberOfLines={2} style={[styles.cardTitle, { color: colors.foreground }]}>Cadangan offline</Text><Text style={[styles.detail, { color: colors.muted }]}>Simpan snapshot dompet, transaksi, rencana, knowledge, dan konfigurasi sebagai arsip JSON baru.</Text><PrimaryButton label={isWorking ? "Memproses…" : "Buat cadangan AiraXBackup"} icon="folder" disabled={isWorking} onPress={() => { void createBackup(); }} /><OutlineButton label="Pilih folder AiraXBackup" icon="create-new-folder" onPress={() => { void chooseFolder(); }} /><OutlineButton label="Kembalikan folder default" icon="restore" onPress={() => { void resetBackupFolder().then(setLocationLabel); }} /></AiraCard><AiraCard style={styles.card}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Pemulihan offline</Text><Text style={[styles.detail, { color: colors.muted }]}>AiraX mencari arsip terbaru dalam folder AiraXBackup terlebih dahulu. Mode Guest juga dapat memulihkan berkas cadangan yang dimilikinya.</Text><PrimaryButton label={isWorking ? "Memproses…" : "Pulihkan dari AiraXBackup"} icon="restore" disabled={isWorking} onPress={() => { void restoreLatest(); }} /><OutlineButton label="Pilih berkas cadangan sendiri" icon="folder-open" onPress={() => { void restoreFromFile(); }} /></AiraCard><AiraCard style={styles.card}><View style={styles.cloudHeader}><MaterialIcons name="cloud" size={23} color={colors.primary} /><Text numberOfLines={2} style={[styles.cardTitle, { color: colors.foreground }]}>AiraXCloud</Text></View><Text style={[styles.detail, { color: colors.muted }]}>Cadangan online tersimpan pada akun AiraX yang sedang masuk. Mode Guest tetap dapat memulihkan berkas offline.</Text><OutlineButton label="Buka AiraXCloud" icon="cloud" onPress={() => router.push("/airax-cloud" as never)} /></AiraCard></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { gap: 13, paddingBottom: 24 }, header: { alignItems: "flex-start", flexDirection: "row", gap: 12, marginBottom: 2 }, headerText: { flex: 1, minWidth: 0, paddingTop: 2 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, flexShrink: 0, height: 44, justifyContent: "center", width: 44 }, title: { fontSize: 21, fontWeight: "800", lineHeight: 26 }, compactTitle: { fontSize: 19, lineHeight: 23 }, subtitle: { fontSize: 12, lineHeight: 17, marginTop: 2 }, hero: { alignItems: "flex-start", flexDirection: "row", gap: 12, padding: 18 }, heroContent: { flex: 1, minWidth: 0 }, heroTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", lineHeight: 21 }, heroDetail: { color: "#DCEAFF", fontSize: 12, lineHeight: 18, marginTop: 4 }, card: { gap: 11 }, cardTitle: { flexShrink: 1, fontSize: 15, fontWeight: "800", lineHeight: 20 }, detail: { fontSize: 12, lineHeight: 19 }, cloudHeader: { alignItems: "center", flexDirection: "row", gap: 8 }, pressed: { opacity: 0.7 } });
