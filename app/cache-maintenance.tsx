import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useAppToast } from "@/components/app-toast";
import { useColors } from "@/hooks/use-colors";
import { clearTemporaryCache, formatCacheSize, getTemporaryCacheSize } from "@/lib/spca-cache";

export default function CacheMaintenanceScreen() {
  const colors = useColors();
  const { showToast } = useAppToast();
  const [size, setSize] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const refresh = async () => setSize(await getTemporaryCacheSize());
  useEffect(() => { void refresh(); }, []);
  const clear = () => Alert.alert("Hapus cache sementara?", "Data keuangan, pengaturan, dan arsip cadangan tidak akan dihapus.", [{ text: "Batal", style: "cancel" }, { text: "Hapus cache", style: "destructive", onPress: () => { void (async () => { setClearing(true); const released = await clearTemporaryCache(); await refresh(); setClearing(false); showToast(released ? `${formatCacheSize(released)} cache sementara dihapus.` : "Tidak ada cache sementara yang perlu dihapus."); })(); } }]);
  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><View style={styles.page}><View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={styles.headerText}><Text style={[styles.title, { color: colors.foreground }]}>Cache aplikasi</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Bersihkan file sementara tanpa menghapus data Anda.</Text></View></View><View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.icon, { backgroundColor: `${colors.primary}14` }]}><MaterialIcons name="cleaning-services" size={26} color={colors.primary} /></View><Text style={[styles.size, { color: colors.foreground }]}>{size == null ? "Menghitung…" : formatCacheSize(size)}</Text><Text style={[styles.detail, { color: colors.muted }]}>Ukuran file sementara aplikasi yang aman dibersihkan. Data transaksi, chat, pengaturan, dan cadangan tidak termasuk.</Text></View><PrimaryButton label={clearing ? "Menghapus cache…" : "Hapus cache sementara"} icon="delete-sweep" disabled={clearing} onPress={clear} /><OutlineButton label="Perbarui ukuran cache" icon="refresh" onPress={() => { void refresh(); }} /></View></ScreenContainer>;
}

const styles = StyleSheet.create({ page: { flex: 1, gap: 14, paddingTop: 8 }, header: { alignItems: "center", flexDirection: "row", gap: 12 }, back: { alignItems: "center", borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, height: 43, justifyContent: "center", width: 43 }, headerText: { flex: 1, minWidth: 0 }, title: { fontSize: 21, fontWeight: "800" }, subtitle: { fontSize: 12, lineHeight: 17, marginTop: 2 }, card: { alignItems: "center", borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, gap: 11, padding: 22 }, icon: { alignItems: "center", borderRadius: 18, height: 58, justifyContent: "center", width: 58 }, size: { fontSize: 28, fontWeight: "800" }, detail: { fontSize: 12, lineHeight: 18, textAlign: "center" }, pressed: { opacity: 0.7 } });
