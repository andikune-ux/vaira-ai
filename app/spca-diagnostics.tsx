import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Audio from "expo-audio";
import { Camera as ExpoCamera } from "expo-camera";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAppToast } from "@/components/app-toast";
import { useColors } from "@/hooks/use-colors";
import { useSpcaDiagnostics } from "@/hooks/use-spca-diagnostics";
import { clearTemporaryCache, formatCacheSize } from "@/lib/spca-cache";
import type { SpcaActionId, SpcaFinding } from "@/lib/spca-diagnostic-engine";
import { trpc } from "@/lib/trpc";

const actionIcons: Record<SpcaActionId, keyof typeof MaterialIcons.glyphMap> = { retry: "refresh", "camera-permission": "photo-camera", "microphone-permission": "mic", "location-permission": "location-on", "notification-permission": "notifications-active", "clear-cache": "cleaning-services", report: "send" };

export default function SpcaDiagnosticsScreen() {
  const colors = useColors();
  const { showToast } = useAppToast();
  const spca = useSpcaDiagnostics();
  const submit = trpc.spca.submitDiagnostic.useMutation();

  const requestPermission = useCallback(async (action: SpcaActionId) => {
    if (action === "camera-permission") await ExpoCamera.requestCameraPermissionsAsync();
    else if (action === "microphone-permission") await Audio.requestRecordingPermissionsAsync();
    else if (action === "location-permission") await Location.requestForegroundPermissionsAsync();
    else if (action === "notification-permission") await Notifications.requestPermissionsAsync();
    await spca.scan();
  }, [spca]);

  const handleAction = useCallback(async (finding: SpcaFinding) => {
    const action = finding.action?.id;
    if (!action) return;
    if (action === "retry") { await spca.scan(); showToast("SPCA selesai memeriksa ulang.", "success"); return; }
    if (action === "clear-cache") {
      Alert.alert("Bersihkan cache sementara?", "Data keuangan, chat, pengaturan, dan cadangan tidak akan dihapus.", [{ text: "Batal", style: "cancel" }, { text: "Bersihkan", style: "destructive", onPress: () => { void clearTemporaryCache().then(async (released) => { await spca.scan(); showToast(released ? `${formatCacheSize(released)} cache sementara dibersihkan.` : "Tidak ada cache sementara yang perlu dibersihkan.", "success"); }); } }]);
      return;
    }
    if (action === "report") {
      if (!spca.report) return;
      try {
        await submit.mutateAsync({ severity: spca.report.severity, codes: spca.report.codes, summary: spca.report.summary });
        showToast("Laporan aman dikirim ke Administrator.", "success");
      } catch {
        Alert.alert("Laporan belum dikirim", "Masuk ke akun terlebih dahulu atau periksa koneksi. SPCA tidak menyimpan token, sandi, chat, atau data keuangan di laporan.");
      }
      return;
    }
    await requestPermission(action);
    showToast("Pemeriksaan izin selesai. SPCA memperbarui hasilnya.", "info");
  }, [requestPermission, showToast, spca, submit]);

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background"><ScrollView contentContainerStyle={styles.page}>
    <View style={styles.header}><Pressable accessibilityLabel="Kembali" onPress={() => router.back()} style={[styles.iconButton, { borderColor: colors.border }]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={styles.flex}><Text style={[styles.overline, { color: colors.primary }]}>SPCA · PUSAT DIAGNOSTIK</Text><Text style={[styles.title, { color: colors.foreground }]}>Asisten aplikasi aktif</Text></View><Pressable accessibilityLabel="Pindai ulang SPCA" onPress={() => { void spca.scan(); }} style={[styles.iconButton, { borderColor: colors.primary }]}>{spca.isScanning ? <ActivityIndicator color={colors.primary} size="small" /> : <MaterialIcons name="radar" size={21} color={colors.primary} />}</Pressable></View>
    <Text style={[styles.intro, { color: colors.muted }]}>SPCA memeriksa jaringan, izin perangkat, cache sementara, dan ringkasan error aplikasi. Ia tidak membaca pesan, sandi, token, bukti transaksi, atau data keuangan Anda.</Text>
    <View style={[styles.statusCard, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}48` }]}><MaterialIcons name={spca.isScanning ? "radar" : "verified-user"} size={24} color={colors.primary} /><View style={styles.flex}><Text style={[styles.statusTitle, { color: colors.foreground }]}>{spca.isScanning ? "SPCA sedang memeriksa" : "Pemantauan aktif"}</Text><Text style={[styles.statusDetail, { color: colors.muted }]}>{spca.snapshot ? `Pemeriksaan terakhir ${new Date(spca.snapshot.capturedAt).toLocaleString("id-ID")}` : "Menyiapkan pemeriksaan perangkat…"}</Text></View></View>
    <View style={styles.findings}>{spca.findings.map((finding) => <FindingCard key={finding.id} finding={finding} color={colors[finding.severity === "critical" ? "error" : finding.severity === "warning" ? "warning" : "primary"]} foreground={colors.foreground} muted={colors.muted} pending={submit.isPending} onPress={() => { void handleAction(finding); }} />)}</View>
    {spca.report ? <View style={[styles.privacyCard, { borderColor: colors.border, backgroundColor: colors.surface }]}><MaterialIcons name="privacy-tip" size={20} color={colors.success} /><View style={styles.flex}><Text style={[styles.privacyTitle, { color: colors.foreground }]}>Laporan privat Administrator</Text><Text style={[styles.privacyDetail, { color: colors.muted }]}>Jika Anda memilih kirim laporan, yang dikirim hanya tingkat masalah dan kode diagnosis: {spca.report.codes.join(", ")}. Tidak ada isi error mentah, sandi, token, chat, bukti, ataupun data keuangan.</Text></View></View> : null}
    <Pressable onPress={() => router.push("/report-bug" as never)} style={[styles.reportBug, { borderColor: colors.border }]}><MaterialIcons name="bug-report" size={18} color={colors.warning} /><View style={styles.flex}><Text style={[styles.reportBugTitle, { color: colors.foreground }]}>Butuh bantuan lebih lanjut?</Text><Text style={[styles.reportBugDetail, { color: colors.muted }]}>Buka laporan bug untuk menambahkan penjelasan Anda sendiri dan screenshot opsional.</Text></View><MaterialIcons name="chevron-right" size={20} color={colors.muted} /></Pressable>
  </ScrollView></ScreenContainer>;
}

function FindingCard({ finding, color, foreground, muted, pending, onPress }: { finding: SpcaFinding; color: string; foreground: string; muted: string; pending: boolean; onPress: () => void }) {
  return <View style={[styles.finding, { borderColor: `${color}55` }]}><View style={[styles.severityDot, { backgroundColor: color }]} /><View style={styles.flex}><Text style={[styles.findingTitle, { color: foreground }]}>{finding.title}</Text><Text style={[styles.findingDetail, { color: muted }]}>{finding.summary}</Text>{finding.action ? <Pressable disabled={pending} onPress={onPress} style={[styles.action, { borderColor: color }]}><MaterialIcons name={actionIcons[finding.action.id]} size={16} color={color} /><Text style={[styles.actionText, { color }]}>{finding.action.label}</Text></Pressable> : null}</View></View>;
}

const styles = StyleSheet.create({ page: { gap: 14, minHeight: "100%", padding: 18 }, header: { alignItems: "center", flexDirection: "row", gap: 10 }, iconButton: { alignItems: "center", borderRadius: 11, borderWidth: 1, height: 42, justifyContent: "center", width: 42 }, flex: { flex: 1, minWidth: 0 }, overline: { fontFamily: "monospace", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 }, title: { fontSize: 23, fontWeight: "900", marginTop: 2 }, intro: { fontSize: 13, lineHeight: 19 }, statusCard: { alignItems: "center", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 11, padding: 14 }, statusTitle: { fontSize: 14, fontWeight: "900" }, statusDetail: { fontSize: 11, lineHeight: 16, marginTop: 3 }, findings: { gap: 10 }, finding: { borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 10, padding: 13 }, severityDot: { borderRadius: 6, height: 11, marginTop: 4, width: 11 }, findingTitle: { fontSize: 14, fontWeight: "900" }, findingDetail: { fontSize: 12, lineHeight: 18, marginTop: 4 }, action: { alignItems: "center", alignSelf: "flex-start", borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 5, marginTop: 10, paddingHorizontal: 9, paddingVertical: 7 }, actionText: { fontSize: 11, fontWeight: "900" }, privacyCard: { alignItems: "flex-start", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 10, padding: 13 }, privacyTitle: { fontSize: 13, fontWeight: "900" }, privacyDetail: { fontSize: 11, lineHeight: 17, marginTop: 3 }, reportBug: { alignItems: "center", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 10, padding: 13 }, reportBugTitle: { fontSize: 13, fontWeight: "900" }, reportBugDetail: { fontSize: 11, lineHeight: 16, marginTop: 3 } });
