import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Auth from "@/lib/_core/auth";
import { useFinance } from "@/lib/finance/finance-context";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

export default function AccountCloseScreen() {
  const colors = useColors();
  const { refreshStorageScope, updateProfile } = useFinance();
  const close = trpc.manualAccount.close.useMutation();
  const confirmClose = () => Alert.alert("Tutup akun?", "Akun akan memasuki masa peninjauan 30 hari. Login kembali sebelum masa tersebut berakhir akan membatalkan penutupan. Setelah itu identifier akun masuk daftar blacklist.", [{ text: "Batal", style: "cancel" }, { text: "Tutup akun", style: "destructive", onPress: () => { void (async () => { try { await close.mutateAsync(); await Auth.removeManualSessionToken(); await Auth.clearUserInfo(); await refreshStorageScope(); await updateProfile({ mode: "guest", displayName: undefined, username: undefined, userAvatarUri: undefined, syncEnabled: false }); router.replace("/(tabs)/profile"); } catch (error) { Alert.alert("Penutupan belum berhasil", getUserFacingError(error, "Periksa koneksi lalu coba kembali.")); } })(); } }]);
  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><View style={styles.page}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={[styles.icon, { backgroundColor: `${colors.error}12` }]}><MaterialIcons name="person-remove" size={34} color={colors.error} /></View><Text style={[styles.title, { color: colors.foreground }]}>Tutup akun AiraX</Text><Text style={[styles.detail, { color: colors.muted }]}>Data akun tetap tersimpan pada server selama masa peninjauan. Anda dapat membatalkan penutupan dengan login kembali sebelum 30 hari. Setelah lewat 30 hari, username, email, dan WhatsApp tidak dapat didaftarkan kembali.</Text><PrimaryButton label={close.isPending ? "Memproses…" : "Ajukan tutup akun"} icon="person-remove" disabled={close.isPending} onPress={confirmClose} /><OutlineButton label="Kembali" onPress={() => router.back()} /></View></ScreenContainer>;
}
const styles = StyleSheet.create({ page: { flex: 1, justifyContent: "center" }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", position: "absolute", top: 0, width: 44 }, icon: { alignItems: "center", borderRadius: 22, height: 70, justifyContent: "center", width: 70 }, title: { fontSize: 27, fontWeight: "800", marginTop: 20 }, detail: { fontSize: 13, lineHeight: 20, marginBottom: 26, marginTop: 9 }, pressed: { opacity: .7 } });
