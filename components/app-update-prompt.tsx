import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const RELEASE = {
  version: "1.0.22",
  downloadUrl: "https://vairaiapp-n9sw5cvx.manus.space",
  changes: [
    "Kartu Beranda kini berpindah dengan swipe dan tidak lagi tampil ganda.",
    "Riwayat Aira tersimpan per akun dan dapat dibuka bertahap agar chat tetap ringan.",
    "Grup privat memakai ID grup baru yang dapat dicari dan diperbarui bersama link undangan.",
    "Room Global dan grup memakai area ketik multiline agar pesan panjang lebih nyaman ditulis.",
    "Media Room Global dan Aira memakai jalur baca storage yang lebih stabil.",
    "Pengaturan Profil dipusatkan pada hub Pengaturan.",
    "Menu Administrator disusun sebagai delapan tombol rapi dalam grid empat kolom.",
    "AiraXCloud tidak lagi menghapus arsip otomatis tanpa tindakan administrator.",
  ],
} as const;

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
  const skipKey = useMemo(() => `vaira:skipped-update:${RELEASE.version}`, []);
  const [visible, setVisible] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(skipKey).then((value) => {
      if (active && !value && isOlderVersion(currentVersion, RELEASE.version)) setVisible(true);
    });
    return () => { active = false; };
  }, [currentVersion, skipKey]);

  const skip = async () => {
    await AsyncStorage.setItem(skipKey, "1");
    setVisible(false);
  };
  const update = () => {
    void Linking.openURL(RELEASE.downloadUrl).catch(() => Alert.alert("Unduhan belum tersedia", "Halaman unduhan belum dapat dibuka. Coba kembali setelah rilis APK terbaru disiapkan."));
  };

  return <><Modal visible={visible} transparent animationType="fade" onRequestClose={() => { void skip(); }}><View style={styles.backdrop}><View style={styles.card}><Text style={styles.eyebrow}>PEMBARUAN TERSEDIA</Text><Text style={styles.title}>V A I R A AI {RELEASE.version}</Text><Text style={styles.description}>Versi baru tersedia dengan perbaikan kestabilan, obrolan, grup privat, serta pengalaman pengaturan yang lebih rapi.</Text><View style={styles.changeList}>{RELEASE.changes.slice(0, 4).map((change) => <View key={change} style={styles.changeRow}><Text style={styles.bullet}>-</Text><Text numberOfLines={2} style={styles.changeText}>{change}</Text></View>)}</View><Pressable onPress={() => setDetailsOpen(true)} style={styles.detailButton}><Text style={styles.detailButtonText}>Lihat selengkapnya</Text></Pressable><View style={styles.actions}><Pressable onPress={() => { void skip(); }} style={styles.skip}><Text style={styles.skipText}>Skip</Text></Pressable><Pressable onPress={update} style={styles.update}><Text style={styles.updateText}>Update</Text></Pressable></View></View></View></Modal><Modal visible={detailsOpen} transparent animationType="slide" onRequestClose={() => setDetailsOpen(false)}><View style={styles.backdrop}><View style={styles.detailCard}><Text style={styles.title}>Catatan pembaruan</Text><Text style={styles.description}>Perubahan pada versi {RELEASE.version}</Text><ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailScrollContent}>{RELEASE.changes.map((change) => <View key={change} style={styles.changeRow}><Text style={styles.bullet}>-</Text><Text style={styles.changeText}>{change}</Text></View>)}</ScrollView><Pressable onPress={() => setDetailsOpen(false)} style={styles.update}><Text style={styles.updateText}>Kembali</Text></Pressable></View></View></Modal></>;
}

const styles = StyleSheet.create({ backdrop: { alignItems: "center", backgroundColor: "#020814B8", flex: 1, justifyContent: "center", padding: 22 }, card: { backgroundColor: "#0B1425", borderColor: "#36B7FF66", borderRadius: 18, borderWidth: 1, gap: 12, maxWidth: 460, padding: 18, width: "100%" }, detailCard: { backgroundColor: "#0B1425", borderColor: "#36B7FF66", borderRadius: 18, borderWidth: 1, gap: 12, maxHeight: "76%", maxWidth: 460, padding: 18, width: "100%" }, eyebrow: { color: "#36B7FF", fontSize: 10, fontWeight: "900", letterSpacing: 1 }, title: { color: "#F1F6FF", fontSize: 20, fontWeight: "900" }, description: { color: "#A6B9D3", fontSize: 12, lineHeight: 18 }, changeList: { gap: 7 }, changeRow: { flexDirection: "row", gap: 7 }, bullet: { color: "#36B7FF", fontSize: 13, fontWeight: "900" }, changeText: { color: "#DCE8F8", flex: 1, fontSize: 11, lineHeight: 16 }, detailButton: { alignSelf: "flex-start", paddingVertical: 3 }, detailButtonText: { color: "#8DEBFF", fontSize: 11, fontWeight: "900" }, actions: { flexDirection: "row", gap: 9, justifyContent: "flex-end", marginTop: 2 }, skip: { alignItems: "center", borderColor: "#5F738F", borderRadius: 10, borderWidth: 1, justifyContent: "center", minHeight: 42, minWidth: 82, paddingHorizontal: 14 }, skipText: { color: "#B7C8DF", fontSize: 12, fontWeight: "900" }, update: { alignItems: "center", backgroundColor: "#36B7FF", borderRadius: 10, justifyContent: "center", minHeight: 42, minWidth: 92, paddingHorizontal: 14 }, updateText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, detailScroll: { maxHeight: 360 }, detailScrollContent: { gap: 9, paddingBottom: 6 } });
