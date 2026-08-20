import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Auth from "@/lib/_core/auth";
import { useFinance } from "@/lib/finance/finance-context";
import type { FinanceState } from "@/lib/finance/types";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

export default function LoginScreen() {
  const colors = useColors();
  const { refreshStorageScope, replaceAllData, updateProfile } = useFinance();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState(""); const [showPassword, setShowPassword] = useState(false);
  const login = trpc.manualAccount.login.useMutation();
  const cloudRestore = trpc.airaxCloud.restoreLatest.useQuery(undefined, { enabled: false, retry: false });

  const submit = async () => {
    try {
      const result = await login.mutateAsync({ identifier: identifier.trim(), password });
      await Auth.setManualSessionToken(result.sessionToken);
      await Auth.setUserInfo({ id: result.account.id, openId: `manual:${result.account.id}`, name: result.account.fullName, email: result.account.email, loginMethod: "airax-manual", lastSignedIn: new Date() });
      const localState = await refreshStorageScope();
      const accountProfile: Partial<FinanceState["profile"]> = { mode: "account", displayName: result.account.fullName, username: result.account.username, bio: result.account.bio, featuredPhotoUris: result.account.featuredPhotoUris, userAvatarUri: localState.profile.userAvatarUri, syncEnabled: true };
      await updateProfile(accountProfile);
      const cloudSnapshot = await cloudRestore.refetch();
      if (cloudSnapshot.data?.payload) {
        const cloudState = JSON.parse(cloudSnapshot.data.payload) as typeof localState;
        await replaceAllData({ ...cloudState, profile: { ...cloudState.profile, ...accountProfile, mode: "account" as const } } as FinanceState);
      }
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Login belum berhasil", getUserFacingError(error, "Data login belum cocok. Periksa username, email, WhatsApp, dan kata sandi lalu coba kembali."));
    }
  };
  const continueAsGuest = async () => {
    await Auth.removeManualSessionToken();
    await Auth.clearUserInfo();
    await refreshStorageScope();
    await updateProfile({ mode: "guest", displayName: undefined, username: undefined, userAvatarUri: undefined, syncEnabled: false });
    router.replace("/(tabs)");
  };

  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled"><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={[styles.icon, { backgroundColor: `${colors.primary}13` }]}><MaterialIcons name="lock-open" size={32} color={colors.primary} /></View><Text style={[styles.title, { color: colors.foreground }]}>Masuk ke AiraX</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Masuk dengan username, email, atau nomor WhatsApp yang terdaftar.</Text><View style={styles.form}><Field label="Username, email, atau WhatsApp" value={identifier} onChangeText={setIdentifier} placeholder="Masukkan salah satu identitas" colors={colors} autoCapitalize="none" /><PasswordField label="Kata sandi" value={password} onChangeText={setPassword} placeholder="Minimal 8 karakter" colors={colors} visible={showPassword} onToggle={() => setShowPassword((previous) => !previous)} /><Pressable onPress={() => router.push("/recover" as never)} style={styles.forgot}><Text style={[styles.forgotText, { color: colors.primary }]}>Lupa kata sandi?</Text></Pressable><PrimaryButton label={login.isPending ? "Memvalidasi…" : "Login"} icon="login" disabled={login.isPending} onPress={() => { void submit(); }} /><Pressable onPress={() => router.push("/account-issue" as never)} style={styles.issue}><Text style={[styles.issueText, { color: colors.muted }]}>Permasalahan akun · tidak punya token / akun diblokir / akun tidak ditemukan</Text></Pressable></View><View style={[styles.separator, { backgroundColor: colors.border }]} /><OutlineButton label="Daftar akun baru" icon="person-add" onPress={() => router.push("/register" as never)} /><OutlineButton label="Lanjut sebagai guest" icon="person-outline" onPress={() => { void continueAsGuest(); }} /><Text style={[styles.note, { color: colors.muted }]}>Mode Guest dapat memakai pencatatan dasar, tetapi layanan Aira AI dan pindai bukti memerlukan akun AiraX.</Text></ScrollView></ScreenContainer>;
}

function Field({ label, colors, ...props }: { label: string; colors: ReturnType<typeof useColors> } & React.ComponentProps<typeof TextInput>) { return <View style={styles.field}><Text style={[styles.label, { color: colors.muted }]}>{label}</Text><TextInput {...props} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /></View>; }
function PasswordField({ label, colors, visible, onToggle, ...props }: { label: string; colors: ReturnType<typeof useColors>; visible: boolean; onToggle: () => void } & React.ComponentProps<typeof TextInput>) { return <View style={styles.field}><Text style={[styles.label, { color: colors.muted }]}>{label}</Text><View><TextInput {...props} secureTextEntry={!visible} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border, paddingRight: 46 }]} /><Pressable accessibilityLabel={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} onPress={onToggle} style={styles.passwordToggle}><MaterialIcons name={visible ? "visibility-off" : "visibility"} size={20} color={colors.muted} /></Pressable></View></View>; }
const styles = StyleSheet.create({ page: { flexGrow: 1, justifyContent: "center", paddingVertical: 20 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", marginBottom: 28, width: 44 }, icon: { alignItems: "center", borderRadius: 20, height: 62, justifyContent: "center", width: 62 }, title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.7, marginTop: 18 }, subtitle: { fontSize: 14, lineHeight: 21, marginTop: 7 }, form: { gap: 12, marginTop: 24 }, field: { gap: 6 }, label: { fontSize: 12, fontWeight: "800" }, input: { borderRadius: 13, borderWidth: 1, fontSize: 14, minHeight: 48, paddingHorizontal: 13 }, forgot: { alignSelf: "flex-end", marginTop: -4 }, forgotText: { fontSize: 12, fontWeight: "800" }, issue: { alignSelf: "flex-end", marginTop: -5 }, issueText: { fontSize: 10, lineHeight: 14, maxWidth: 250, textAlign: "right" }, passwordToggle: { alignItems: "center", height: 48, justifyContent: "center", position: "absolute", right: 4, top: 0, width: 42 }, separator: { height: StyleSheet.hairlineWidth, marginVertical: 18 }, note: { fontSize: 11, lineHeight: 16, marginTop: 14, textAlign: "center" }, pressed: { opacity: .7 } });
