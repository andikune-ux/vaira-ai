import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { AiraAccessTokenPanel } from "@/components/aira-access-token-panel";
import { ScreenContainer } from "@/components/screen-container";

export default function AdministratorTokensScreen() {
  const params = useLocalSearchParams<{ username?: string; password?: string }>();
  const username = String(params.username ?? "");
  const password = String(params.password ?? "");
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><ScrollView contentContainerStyle={styles.page}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><MaterialIcons name="arrow-back" size={20} color="#58ff9a" /></Pressable><View><Text style={styles.overline}>ADMIN VAIRA · AKSES LAYANAN</Text><Text style={styles.title}>Token Aira</Text></View></View><Text style={styles.detail}>Buat, cabut, dan kelola riwayat redeem token tanpa menampilkan token mentah dalam audit.</Text><AiraAccessTokenPanel username={username} password={password} /></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ page: { backgroundColor: "#020805", gap: 12, minHeight: "100%", padding: 18 }, header: { alignItems: "center", flexDirection: "row", gap: 10 }, back: { alignItems: "center", borderColor: "#2c9f59", borderRadius: 10, borderWidth: 1, height: 38, justifyContent: "center", width: 38 }, overline: { color: "#76f29b", fontFamily: "monospace", fontSize: 10, fontWeight: "800" }, title: { color: "#effff4", fontSize: 23, fontWeight: "900", marginTop: 3 }, detail: { color: "#9cc5aa", fontSize: 12, lineHeight: 18 } });
