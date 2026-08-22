import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Auth from "@/lib/_core/auth";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

export default function ChangeTemporaryPasswordScreen() {
  const colors = useColors();
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const changePassword = trpc.manualAccount.changeTemporaryPassword.useMutation();

  const submit = async () => {
    if (newPassword.length < 8) { Alert.alert("Sandi terlalu pendek", "Gunakan sandi pribadi minimal 8 karakter."); return; }
    if (newPassword !== confirmation) { Alert.alert("Konfirmasi belum sama", "Ulangi sandi pribadi dengan tepat."); return; }
    try {
      await changePassword.mutateAsync({ temporaryPassword, newPassword });
      await Auth.removeManualSessionToken();
      await Auth.clearUserInfo();
      Alert.alert("Sandi pribadi tersimpan", "Silakan masuk kembali menggunakan sandi pribadi baru Anda.", [{ text: "Ke login", onPress: () => router.replace("/login" as never) }]);
    } catch (error) {
      Alert.alert("Sandi belum diubah", getUserFacingError(error, "Sandi sementara belum cocok atau koneksi belum tersedia."));
    }
  };

  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled"><View style={[styles.icon, { backgroundColor: `${colors.warning}18` }]}><MaterialIcons name="lock-reset" size={32} color={colors.warning} /></View><Text style={[styles.title, { color: colors.foreground }]}>Buat sandi pribadi</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Administrator telah memberikan sandi sementara kepada Anda. Demi keamanan, buat sandi pribadi baru sebelum menggunakan layanan V A I R A  A I.</Text><View style={styles.form}><PasswordField label="Sandi sementara dari administrator" value={temporaryPassword} onChangeText={setTemporaryPassword} visible={visible} onToggle={() => setVisible((value) => !value)} colors={colors} /><PasswordField label="Sandi pribadi baru" value={newPassword} onChangeText={setNewPassword} visible={visible} onToggle={() => setVisible((value) => !value)} colors={colors} /><PasswordField label="Ulangi sandi pribadi baru" value={confirmation} onChangeText={setConfirmation} visible={visible} onToggle={() => setVisible((value) => !value)} colors={colors} /><PrimaryButton label={changePassword.isPending ? "Menyimpan…" : "Simpan sandi pribadi"} icon="lock" disabled={changePassword.isPending} onPress={() => { void submit(); }} /></View></ScrollView></ScreenContainer>;
}

function PasswordField({ label, colors, visible, onToggle, ...props }: { label: string; colors: ReturnType<typeof useColors>; visible: boolean; onToggle: () => void } & React.ComponentProps<typeof TextInput>) { return <View style={styles.field}><Text style={[styles.label, { color: colors.muted }]}>{label}</Text><View><TextInput {...props} secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} placeholder="Minimal 8 karakter" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><Pressable accessibilityLabel={visible ? "Sembunyikan sandi" : "Tampilkan sandi"} onPress={onToggle} style={styles.passwordToggle}><MaterialIcons name={visible ? "visibility-off" : "visibility"} size={20} color={colors.muted} /></Pressable></View></View>; }

const styles = StyleSheet.create({ page: { flexGrow: 1, justifyContent: "center", paddingVertical: 28 }, icon: { alignItems: "center", borderRadius: 20, height: 62, justifyContent: "center", width: 62 }, title: { fontSize: 27, fontWeight: "800", letterSpacing: -0.7, marginTop: 18 }, subtitle: { fontSize: 14, lineHeight: 21, marginTop: 8 }, form: { gap: 13, marginTop: 26 }, field: { gap: 6 }, label: { fontSize: 12, fontWeight: "800" }, input: { borderRadius: 13, borderWidth: 1, fontSize: 14, minHeight: 48, paddingHorizontal: 13, paddingRight: 46 }, passwordToggle: { alignItems: "center", height: 48, justifyContent: "center", position: "absolute", right: 4, top: 0, width: 42 } });
