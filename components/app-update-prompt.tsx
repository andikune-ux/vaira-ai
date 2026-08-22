import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { trpc } from "@/lib/trpc";

type ReleaseOffer = { version: string; downloadUrl: string; headline: string; summary: string; changes: string[] };

const FALLBACK_RELEASE: ReleaseOffer = {
  version: "1.0.23",
  downloadUrl: "https://vairaiapp-n9sw5cvx.manus.space/download",
  headline: "Pembaruan V A I R A  A I tersedia",
  summary: "Pembaruan stabilitas dan fitur terbaru siap diunduh.",
  changes: ["Tawaran pembaruan kini diperiksa dari server saat aplikasi dibuka.", "Layanan Aira dan riwayat percakapan dibuat lebih stabil."],
};

function isOlderVersion(current: string, latest: string) {
  const currentParts = current.split(".").map((part) => Number(part) || 0);
  const latestParts = latest.split(".").map((part) => Number(part) || 0);
  for (let index = 0; index < Math.max(currentParts.length, latestParts.length); index += 1) {
    if ((currentParts[index] ?? 0) !== (latestParts[index] ?? 0)) return (currentParts[index] ?? 0) < (latestParts[index] ?? 0);
  }
  return false;
}

export function AppUpdatePrompt() {
  const currentVersion = Constants.expoConfig?.version ?? "1.0.0";
  const serverOffer = trpc.appUpdate.latest.useQuery(undefined, { retry: 1, staleTime: 0, refetchOnMount: "always" });
  const release = serverOffer.data ?? FALLBACK_RELEASE;
  const skipKey = useMemo(() => `vaira:skipped-update:${release.version}`, [release.version]);
  const [visible, setVisible] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(skipKey).then((value) => {
      if (active && !value && isOlderVersion(currentVersion, release.version)) setVisible(true);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [currentVersion, release.version, skipKey]);

  const skip = async () => { await AsyncStorage.setItem(skipKey, "1"); setVisible(false); };
  const update = () => { void WebBrowser.openBrowserAsync(release.downloadUrl).catch(() => Alert.alert("Unduhan belum tersedia", "Halaman unduhan belum dapat dibuka di browser perangkat. Coba kembali setelah rilis APK terbaru disiapkan.")); };

  return <><Modal visible={visible} transparent animationType="fade" onRequestClose={() => { void skip(); }}><View style={styles.backdrop}><View style={styles.card}><Text style={styles.eyebrow}>PEMBARUAN TERSEDIA</Text><Text style={styles.title}>V A I R A  A I {release.version}</Text><Text style={styles.description}>{release.summary}</Text><View style={styles.changeList}>{release.changes.slice(0, 4).map((change) => <View key={change} style={styles.changeRow}><Text style={styles.bullet}>-</Text><Text numberOfLines={2} style={styles.changeText}>{change}</Text></View>)}</View><Pressable onPress={() => setDetailsOpen(true)} style={styles.detailButton}><Text style={styles.detailButtonText}>Lihat selengkapnya</Text></Pressable><View style={styles.actions}><Pressable onPress={() => { void skip(); }} style={styles.skip}><Text style={styles.skipText}>Skip</Text></Pressable><Pressable onPress={update} style={styles.update}><Text style={styles.updateText}>Update</Text></Pressable></View></View></View></Modal><Modal visible={detailsOpen} transparent animationType="slide" onRequestClose={() => setDetailsOpen(false)}><View style={styles.backdrop}><View style={styles.detailCard}><Text style={styles.title}>Catatan pembaruan</Text><Text style={styles.description}>Perubahan pada versi {release.version}</Text><ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailScrollContent}>{release.changes.map((change) => <View key={change} style={styles.changeRow}><Text style={styles.bullet}>-</Text><Text style={styles.changeText}>{change}</Text></View>)}</ScrollView><Pressable onPress={() => setDetailsOpen(false)} style={styles.update}><Text style={styles.updateText}>Kembali</Text></Pressable></View></View></Modal></>;
}

const styles = StyleSheet.create({ backdrop: { alignItems: "center", backgroundColor: "#020814B8", flex: 1, justifyContent: "center", padding: 22 }, card: { backgroundColor: "#0B1425", borderColor: "#36B7FF66", borderRadius: 18, borderWidth: 1, gap: 12, maxWidth: 460, padding: 18, width: "100%" }, detailCard: { backgroundColor: "#0B1425", borderColor: "#36B7FF66", borderRadius: 18, borderWidth: 1, gap: 12, maxHeight: "76%", maxWidth: 460, padding: 18, width: "100%" }, eyebrow: { color: "#36B7FF", fontSize: 10, fontWeight: "900", letterSpacing: 1 }, title: { color: "#F1F6FF", fontSize: 20, fontWeight: "900" }, description: { color: "#A6B9D3", fontSize: 12, lineHeight: 18 }, changeList: { gap: 7 }, changeRow: { flexDirection: "row", gap: 7 }, bullet: { color: "#36B7FF", fontSize: 13, fontWeight: "900" }, changeText: { color: "#DCE8F8", flex: 1, fontSize: 11, lineHeight: 16 }, detailButton: { alignSelf: "flex-start", paddingVertical: 3 }, detailButtonText: { color: "#8DEBFF", fontSize: 11, fontWeight: "900" }, actions: { flexDirection: "row", gap: 9, justifyContent: "flex-end", marginTop: 2 }, skip: { alignItems: "center", borderColor: "#5F738F", borderRadius: 10, borderWidth: 1, justifyContent: "center", minHeight: 42, minWidth: 82, paddingHorizontal: 14 }, skipText: { color: "#B7C8DF", fontSize: 12, fontWeight: "900" }, update: { alignItems: "center", backgroundColor: "#36B7FF", borderRadius: 10, justifyContent: "center", minHeight: 42, minWidth: 92, paddingHorizontal: 14 }, updateText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, detailScroll: { maxHeight: 360 }, detailScrollContent: { gap: 9, paddingBottom: 6 } });
