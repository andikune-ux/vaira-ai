import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Network from "expo-network";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { AiraCard, LoadingState, SectionHeading } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useAppToast } from "@/components/app-toast";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import * as Auth from "@/lib/_core/auth";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

export default function ProfileTab() {
  const colors = useColors();
  const { state, isHydrated, updateProfile, refreshStorageScope } = useFinance();
  const { logout, isAuthenticated } = useAuth();
  const { showToast } = useAppToast();
  const manualLogout = trpc.manualAccount.logout.useMutation();
  const uploadPhotos = trpc.manualAccount.uploadFeaturedPhotos.useMutation();
  const syncProfile = trpc.manualAccount.updateProfile.useMutation();
  const profile = state.profile;
  const cloudBackups = trpc.airaxCloud.listMine.useQuery(undefined, { enabled: profile.mode === "account", retry: false });
  const network = Network.useNetworkState();
  const { width, height } = useWindowDimensions();
  const [photoUris, setPhotoUris] = useState<string[]>(profile.featuredPhotoUris ?? []);
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile.bio ?? "");
  const statusColor = network.isConnected === false ? "#1F2937" : network.isInternetReachable === false ? colors.error : network.isConnected == null || network.isInternetReachable == null ? colors.warning : colors.success;
  const isLandscape = width > height;
  const settingsAttention = cloudBackups.isError || profile.developerMode;
  const openAttentionDetails = () => { const details = [cloudBackups.isError ? "Sinkronisasi AiraXCloud perlu diperiksa." : null, profile.developerMode ? "Mode developer sedang aktif." : null].filter(Boolean).join("\n"); Alert.alert("Perlu perhatian", details || "Tidak ada masalah pengaturan.", [{ text: "Tutup", style: "cancel" }, { text: "Buka Pengaturan", onPress: () => router.push("/settings") }]); };
  const saveBioProfile = async () => {
    const nextBio = bioDraft.trim().slice(0, 280);
    try {
      if (profile.mode === "account") await syncProfile.mutateAsync({ bio: nextBio, featuredPhotoUris: photoUris.filter((uri) => /^https?:\/\//i.test(uri)) });
      await updateProfile({ bio: nextBio });
      setEditingBio(false);
      showToast("Bio profil tersimpan dan dapat dilihat peserta lain.", "success");
    } catch (error) {
      showToast(getUserFacingError(error, "Bio belum dapat disimpan ke server."), "info");
    }
  };

  if (!isHydrated) return <LoadingState />;

  const switchAccount = () => Alert.alert("Ganti akun?", "Data setiap akun disimpan pada ruang tersendiri.", [{ text: "Batal", style: "cancel" }, { text: "Keluar & ganti", style: "destructive", onPress: () => { void (async () => { await manualLogout.mutateAsync().catch(() => undefined); await Auth.removeManualSessionToken(); await Auth.clearUserInfo(); await logout(); await refreshStorageScope(); router.replace("/login"); })(); } }]);
  const pickFeaturedPhoto = async () => {
    if (profile.mode !== "account") { Alert.alert("Masuk diperlukan", "Masuk terlebih dahulu untuk menambahkan foto unggulan."); return; }
    if (photoUris.length >= 3) { Alert.alert("Batas foto tercapai", "Profil dapat memiliki maksimal tiga foto unggulan."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.75 });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset?.uri) return;
    try {
      const mime = asset.uri.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
      const file = Platform.OS === "web" ? await (async () => { const response = await fetch(asset.uri); const buffer = await response.arrayBuffer(); let binary = ""; new Uint8Array(buffer).forEach((value) => { binary += String.fromCharCode(value); }); return `data:${mime};base64,${btoa(binary)}`; })() : `data:${mime};base64,${await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 })}`;
      const uploaded = await uploadPhotos.mutateAsync({ file });
      const next = [...photoUris, uploaded.url].slice(0, 3);
      await syncProfile.mutateAsync({ bio: profile.bio ?? "", featuredPhotoUris: next });
      setPhotoUris(next);
      await updateProfile({ featuredPhotoUris: next });
      showToast("Foto unggulan tersimpan di akun.");
    } catch (error) {
      Alert.alert("Foto belum tersimpan", getUserFacingError(error, "Periksa koneksi lalu coba kembali."));
    }
  };
  const removeFeaturedPhoto = async (uri: string) => { Alert.alert("Hapus foto unggulan?", "Foto ini akan dihapus dari profil pengguna.", [{ text: "Batal", style: "cancel" }, { text: "Hapus", style: "destructive", onPress: () => { void (async () => { const next = photoUris.filter((item) => item !== uri); try { if (profile.mode === "account") await syncProfile.mutateAsync({ bio: profile.bio ?? "", featuredPhotoUris: next.filter((item) => /^https?:\/\//i.test(item)) }); await updateProfile({ featuredPhotoUris: next }); setPhotoUris(next); showToast("Foto unggulan dihapus dan disimpan ke server.", "success"); } catch (error) { showToast(getUserFacingError(error, "Foto belum dapat dihapus dari server."), "info"); } })(); } }]); };

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView contentContainerStyle={[styles.content, isLandscape && styles.landscape]} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><View><Text style={[styles.title, { color: colors.foreground }]}>Profil</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Bio dan foto unggulan pengguna</Text></View><Pressable accessibilityLabel="Buka Pengaturan" onPress={() => router.push("/settings")} style={({ pressed }) => [styles.settingsButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="settings" size={21} color={colors.primary} />{settingsAttention ? <Pressable accessibilityLabel="Lihat detail perhatian Pengaturan" onPress={openAttentionDetails} hitSlop={10} style={styles.attentionBadge}><View style={[styles.attentionDot, { backgroundColor: colors.error }]} /></Pressable> : null}</Pressable></View>
    <AiraCard style={styles.profileCard}><View style={[styles.avatarRing, { borderColor: statusColor }]}><Image source={profile.userAvatarUri ? { uri: profile.userAvatarUri } : require("@/assets/images/vairaa-profile.png")} style={styles.avatar} /></View><View style={styles.profileInfo}><Text style={[styles.name, { color: colors.foreground }]}>{profile.mode === "guest" ? "Mode tamu" : profile.displayName ?? "Akun V A I R A  A I"}</Text>{profile.username ? <Text style={[styles.username, { color: colors.primary }]}>@{profile.username}</Text> : null}<Text style={[styles.detail, { color: colors.muted }]}>{profile.mode === "guest" ? "Data tersimpan di perangkat ini" : "Profil pengguna V A I R A  A I"}</Text></View><Pressable onPress={profile.mode === "guest" || !isAuthenticated ? () => router.push("/login") : switchAccount} style={({ pressed }) => [styles.accountButton, { backgroundColor: `${colors.primary}12` }, pressed && styles.pressed]}><Text style={[styles.accountButtonText, { color: colors.primary }]}>{profile.mode === "guest" ? "Masuk" : isAuthenticated ? "Ganti akun" : "Masuk lagi"}</Text></Pressable></AiraCard>
    <SectionHeading title="Bio profil" /><AiraCard style={styles.bioCard}>{editingBio ? <><TextInput value={bioDraft} onChangeText={setBioDraft} maxLength={280} multiline placeholder="Tulis bio profil…" placeholderTextColor={colors.muted} style={[styles.bioInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} /><Text style={[styles.bioCounter, { color: colors.muted }]}>{bioDraft.length}/280</Text><View style={styles.bioActions}><Pressable onPress={() => { setBioDraft(profile.bio ?? ""); setEditingBio(false); }} style={[styles.secondaryEditButton, { borderColor: colors.border }]}><MaterialIcons name="close" size={16} color={colors.muted} /><Text style={[styles.secondaryEditText, { color: colors.muted }]}>Batal</Text></Pressable><Pressable disabled={syncProfile.isPending} onPress={() => { void saveBioProfile(); }} style={[styles.editButton, { backgroundColor: colors.primary, opacity: syncProfile.isPending ? 0.55 : 1 }]}><MaterialIcons name="save" size={16} color="#FFFFFF" /><Text style={styles.editText}>{syncProfile.isPending ? "Menyimpan…" : "Simpan"}</Text></Pressable></View></> : <><Text style={[styles.bio, { color: colors.foreground }]}>{profile.bio?.trim() || "Belum ada bio. Tambahkan atau ubah bio melalui Pengaturan Profil."}</Text><Pressable onPress={() => { setBioDraft(profile.bio ?? ""); setEditingBio(true); }} style={({ pressed }) => [styles.editButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name="edit" size={16} color="#FFFFFF" /><Text style={styles.editText}>Edit bio profil</Text></Pressable></>}</AiraCard>
    <SectionHeading title={`Foto unggulan · ${photoUris.length}/3`} /><AiraCard style={styles.photosCard}><View style={styles.photoGrid}>{photoUris.map((uri) => <View key={uri} style={styles.photoWrap}><Image source={{ uri }} style={styles.featuredPhoto} /><Pressable accessibilityLabel="Hapus foto unggulan" onPress={() => { void removeFeaturedPhoto(uri); }} style={[styles.removePhoto, { backgroundColor: colors.error }]}><MaterialIcons name="close" size={15} color="#FFFFFF" /></Pressable></View>)}{photoUris.length < 3 ? <Pressable onPress={() => { void pickFeaturedPhoto(); }} style={({ pressed }) => [styles.addPhoto, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}><MaterialIcons name="add-a-photo" size={25} color={colors.primary} /><Text style={[styles.addPhotoText, { color: colors.muted }]}>Tambah foto</Text></Pressable> : null}</View><Text style={[styles.photoHint, { color: colors.muted }]}>Maksimal tiga foto unggulan. Pengaturan lain tersedia melalui tombol gerigi di kanan atas.</Text></AiraCard>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 30 }, landscape: { alignSelf: "center", maxWidth: 860, width: "100%" }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingBottom: 18, paddingTop: 8 }, title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.8 }, subtitle: { fontSize: 12, marginTop: 3 }, settingsButton: { alignItems: "center", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, height: 46, justifyContent: "center", position: "relative", width: 46 }, attentionBadge: { alignItems: "center", borderRadius: 10, height: 22, justifyContent: "center", position: "absolute", right: 2, top: 1, width: 22 }, attentionDot: { borderRadius: 5, height: 10, width: 10 }, profileCard: { alignItems: "center", flexDirection: "row" }, avatarRing: { borderRadius: 31, borderWidth: 3, padding: 2 }, avatar: { borderRadius: 26, height: 52, width: 52 }, profileInfo: { flex: 1, marginLeft: 12, minWidth: 0 }, name: { fontSize: 16, fontWeight: "800" }, username: { fontSize: 11, fontWeight: "800", marginTop: 2 }, detail: { fontSize: 11, marginTop: 3 }, accountButton: { borderRadius: 11, paddingHorizontal: 11, paddingVertical: 8 }, accountButtonText: { fontSize: 12, fontWeight: "800" }, bioCard: { gap: 13 }, bio: { fontSize: 14, lineHeight: 21 }, bioInput: { borderRadius: 12, borderWidth: 1, fontSize: 14, minHeight: 88, padding: 11, textAlignVertical: "top" }, bioCounter: { fontSize: 10, textAlign: "right" }, bioActions: { flexDirection: "row", gap: 8 }, secondaryEditButton: { alignItems: "center", borderRadius: 11, borderWidth: 1, flexDirection: "row", gap: 6, paddingHorizontal: 12, paddingVertical: 10 }, secondaryEditText: { fontSize: 12, fontWeight: "800" }, editButton: { alignItems: "center", alignSelf: "flex-start", borderRadius: 11, flexDirection: "row", gap: 7, paddingHorizontal: 12, paddingVertical: 10 }, editText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" }, photosCard: { gap: 12 }, photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, photoWrap: { height: 104, position: "relative", width: 104 }, featuredPhoto: { borderRadius: 15, height: "100%", width: "100%" }, removePhoto: { alignItems: "center", borderRadius: 12, height: 24, justifyContent: "center", position: "absolute", right: 5, top: 5, width: 24 }, addPhoto: { alignItems: "center", borderRadius: 15, borderStyle: "dashed", borderWidth: 1, height: 104, justifyContent: "center", width: 104 }, addPhotoText: { fontSize: 11, marginTop: 5 }, photoHint: { fontSize: 11, lineHeight: 17 }, pressed: { opacity: 0.7 } });
