import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";

import { OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

export default function AdministratorDatabase2Screen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const verify = trpc.administrator.database2.verify.useMutation();
  const status = trpc.administrator.database2.status.useQuery({ username, password }, { enabled: authorized, retry: false });

  const authorize = async () => {
    try {
      const result = await verify.mutateAsync({ username, password });
      if (!result.verified) {
        Alert.alert("Akses ditolak", "Kredensial SERVER DATABASE 2 tidak sesuai.");
        return;
      }
      setAuthorized(true);
    } catch (error) {
      Alert.alert("Verifikasi belum berhasil", getUserFacingError(error, "Periksa koneksi SERVER DATABASE 2 lalu coba lagi."));
    }
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Text style={styles.overline}>AIRA X // SERVER DATABASE 2</Text><Text style={styles.title}>Backup Manual</Text><Text style={styles.detail}>SERVER DATABASE lama tetap menjadi primary. Halaman ini memakai kredensial terpisah dan hanya menunjukkan status pemulihan pada server backup.</Text>{!authorized ? <View style={styles.panel}><Text style={styles.label}>OTORISASI SERVER DATABASE 2</Text><TextInput value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} placeholder="Username SERVER DATABASE 2" placeholderTextColor="#438d61" style={styles.input} /><TextInput value={password} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} secureTextEntry placeholder="Password SERVER DATABASE 2" placeholderTextColor="#438d61" style={styles.input} /><PrimaryButton label={verify.isPending ? "Memverifikasi…" : "Buka SERVER DATABASE 2"} icon="storage" onPress={() => { void authorize(); }} /></View> : <View style={styles.panel}><Text style={styles.label}>STATUS PEMULIHAN STANDBY</Text><Text style={styles.detail}>Data dipulihkan melalui proses manual yang disetujui. Tidak ada sinkronisasi otomatis ke server primary.</Text><View style={styles.metrics}><Metric label="Akun manual" value={status.data?.manualAccountsCount} /><Metric label="Pesan Room Global" value={status.data?.roomMessagesCount} /><Metric label="Audit Administrator" value={status.data?.auditLogsCount} /><Metric label="Metadata AiraXCloud" value={status.data?.cloudMetadataCount} /></View><Text style={styles.warning}>Arsip AiraXCloud yang dipulihkan tetap dibatasi ({status.data?.restrictedCloudMetadataCount ?? 0}) sampai object storage server lama tersedia dan diverifikasi. Sesi lama serta token akses tidak dipindahkan.</Text><OutlineButton label={status.isFetching ? "Menyegarkan…" : "Segarkan status"} icon="refresh" onPress={() => { void status.refetch(); }} /></View>}<OutlineButton label="Kembali ke console" icon="arrow-back" onPress={() => router.back()} /></ScrollView></ScreenContainer>;
}

function Metric({ label, value }: { label: string; value: number | undefined }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value ?? "—"}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  content: { padding: 18, gap: 14 },
  overline: { color: "#58ff9a", fontSize: 12, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: "#eaffef", fontSize: 24, fontWeight: "900" },
  detail: { color: "#9dd8af", fontSize: 13, lineHeight: 19 },
  panel: { backgroundColor: "#07130b", borderColor: "#1d5a37", borderWidth: 1, borderRadius: 14, padding: 14, gap: 12 },
  label: { color: "#58ff9a", fontSize: 12, fontWeight: "900", letterSpacing: 0.8 },
  input: { minHeight: 46, borderRadius: 10, borderWidth: 1, borderColor: "#1d5a37", color: "#eaffef", backgroundColor: "#031008", paddingHorizontal: 12, fontSize: 14 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metric: { minWidth: "47%", flexGrow: 1, backgroundColor: "#031008", borderColor: "#17482d", borderWidth: 1, borderRadius: 10, padding: 10, gap: 3 },
  metricValue: { color: "#eaffef", fontSize: 21, fontWeight: "900" },
  metricLabel: { color: "#9dd8af", fontSize: 11 },
  warning: { color: "#f6d987", fontSize: 12, lineHeight: 18 },
});
