import * as Network from "expo-network";
import { router } from "expo-router";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { AiraCard, LoadingState, SectionHeading } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import * as Auth from "@/lib/_core/auth";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function ProfileTab() {
  const colors = useColors();
  const { state, isHydrated, refreshStorageScope } = useFinance();
  const { logout } = useAuth();
  const manualLogout = trpc.manualAccount.logout.useMutation();
  const cloudBackups = trpc.airaxCloud.listMine.useQuery(undefined, { enabled: state.profile.mode === "account", retry: false });
  const network = Network.useNetworkState();
  const { width, height } = useWindowDimensions();
  const profile = state.profile;
  const statusColor = network.isConnected === false ? "#1F2937" : network.isInternetReachable === false ? colors.error : network.isConnected == null || network.isInternetReachable == null ? colors.warning : colors.success;

  if (!isHydrated) return <LoadingState />;

  const switchAccount = () => Alert.alert("Ganti akun?", "Data setiap akun disimpan pada ruang tersendiri.", [{ text: "Batal", style: "cancel" }, { text: "Keluar & ganti", style: "destructive", onPress: () => { void (async () => { await manualLogout.mutateAsync().catch(() => undefined); await Auth.removeManualSessionToken(); await Auth.clearUserInfo(); await logout(); await refreshStorageScope(); router.replace("/login"); })(); } }]);
  const openProfileSettings = () => router.push("/profile-settings" as never);

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={[styles.content, width > height && styles.landscape]} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><View><Text style={[styles.title, { color: colors.foreground }]}>Profil</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Identitas dan pengaturan akun</Text></View><Pressable accessibilityLabel="Buka Pengaturan" onPress={() => router.push("/settings" as never)} style={({ pressed }) => [styles.settingsButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="settings" size={21} color={colors.primary} /></Pressable></View>
    <AiraCard style={styles.profileCard}><View style={[styles.avatarRing, { borderColor: statusColor }]}><Image source={profile.userAvatarUri ? { uri: profile.userAvatarUri } : require("@/assets/images/vairaa-profile.png")} style={styles.avatar} /></View><View style={styles.profileInfo}><Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{profile.mode === "guest" ? "Mode tamu" : profile.displayName ?? "Akun V A I R A  A I"}</Text>{profile.username ? <Text style={[styles.username, { color: colors.primary }]} numberOfLines={1}>@{profile.username}</Text> : null}<Text style={[styles.detail, { color: colors.muted }]} numberOfLines={2}>{profile.mode === "guest" ? "Data tersimpan di perangkat ini" : "Profil pengguna V A I R A  A I"}</Text></View><Pressable onPress={profile.mode === "guest" ? () => router.push("/login" as never) : switchAccount} style={({ pressed }) => [styles.accountButton, { backgroundColor: `${colors.primary}12` }, pressed && styles.pressed]}><Text style={[styles.accountButtonText, { color: colors.primary }]}>{profile.mode === "guest" ? "Masuk" : "Ganti akun"}</Text></Pressable></AiraCard>
    <SectionHeading title="Pengaturan profil" /><AiraCard style={styles.card}><ProfileRow icon="person" label="Profil dan Beranda" value="Bio, foto unggulan, kartu, salat, dan cuaca" colors={colors} onPress={openProfileSettings} /><Divider color={colors.border} /><ProfileRow icon="cloud" label="AiraXCloud" value={profile.mode === "account" ? `${cloudBackups.data?.length ?? 0} cadangan akun` : "Masuk diperlukan"} colors={colors} onPress={() => router.push("/airax-cloud" as never)} /></AiraCard>
    <SectionHeading title="Ringkasan" /><AiraCard style={styles.summaryCard}><Text style={[styles.bio, { color: colors.foreground }]} numberOfLines={4}>{profile.bio?.trim() || "Belum ada bio. Atur bio dan foto unggulan dari Pengaturan Profil."}</Text><Text style={[styles.summaryHint, { color: colors.muted }]}>Penyuntingan profil dipusatkan di Pengaturan Profil agar tidak ada data atau tombol yang tampil ganda.</Text></AiraCard>
  </ScrollView></ScreenContainer>;
}

function Divider({ color }: { color: string }) { return <View style={{ backgroundColor: color, height: StyleSheet.hairlineWidth }} />; }
function ProfileRow({ icon, label, value, colors, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string; colors: ReturnType<typeof useColors>; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={styles.rowLeft}><MaterialIcons name={icon} size={21} color={colors.primary} /><View style={styles.rowText}><Text style={[styles.rowLabel, { color: colors.foreground }]} numberOfLines={1}>{label}</Text><Text style={[styles.rowValue, { color: colors.muted }]} numberOfLines={2}>{value}</Text></View></View><MaterialIcons name="chevron-right" size={21} color={colors.muted} /></Pressable>; }

const styles = StyleSheet.create({ content: { gap: 14, paddingBottom: 30 }, landscape: { alignSelf: "center", maxWidth: 860, width: "100%" }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingBottom: 18, paddingTop: 8 }, title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 }, subtitle: { fontSize: 12, marginTop: 3 }, settingsButton: { alignItems: "center", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, height: 46, justifyContent: "center", width: 46 }, profileCard: { alignItems: "center", flexDirection: "row" }, avatarRing: { borderRadius: 31, borderWidth: 3, padding: 2 }, avatar: { borderRadius: 26, height: 52, width: 52 }, profileInfo: { flex: 1, marginLeft: 12, minWidth: 0 }, name: { fontSize: 16, fontWeight: "800" }, username: { fontSize: 11, fontWeight: "800", marginTop: 2 }, detail: { fontSize: 11, marginTop: 3 }, accountButton: { borderRadius: 11, paddingHorizontal: 11, paddingVertical: 8 }, accountButtonText: { fontSize: 12, fontWeight: "800" }, card: { paddingHorizontal: 16, paddingVertical: 4 }, row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 70 }, rowLeft: { alignItems: "center", flex: 1, flexDirection: "row", gap: 12, minWidth: 0 }, rowText: { flex: 1, minWidth: 0 }, rowLabel: { fontSize: 14, fontWeight: "800" }, rowValue: { fontSize: 11, lineHeight: 16, marginTop: 2 }, summaryCard: { gap: 8 }, bio: { fontSize: 14, lineHeight: 21 }, summaryHint: { fontSize: 11, lineHeight: 17 }, pressed: { opacity: 0.7 } });
