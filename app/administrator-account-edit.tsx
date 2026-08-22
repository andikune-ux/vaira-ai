import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { MiniDatePicker } from "@/components/mini-date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

export default function AdministratorAccountEditScreen() {
  const params = useLocalSearchParams<{ username?: string; password?: string; accountId?: string }>();
  const username = String(params.username ?? "");
  const password = String(params.password ?? "");
  const accountId = Number(params.accountId);
  const accounts = trpc.manualAccount.adminList.useQuery({ username, password }, { enabled: Boolean(username && password && accountId), retry: false });
  const update = trpc.manualAccount.adminUpdate.useMutation();
  const account = accounts.data?.find((item) => item.id === accountId);
  const [fullName, setFullName] = useState("");
  const [accountUsername, setAccountUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);

  useEffect(() => {
    if (!account) return;
    setFullName(account.fullName);
    setAccountUsername(account.username);
    setEmail(account.email);
    setPhone(account.phone);
    setBirthDate(account.birthDate);
  }, [account]);

  type AccountUpdatePayload = Omit<Parameters<typeof update.mutateAsync>[0], "username" | "password" | "accountId">;
  const runUpdate = async (payload: AccountUpdatePayload, successMessage: string) => {
    try {
      await update.mutateAsync({ username, password, accountId, ...payload });
      await accounts.refetch();
      Alert.alert("Berhasil", successMessage);
    } catch (error) {
      Alert.alert("Belum tersimpan", getUserFacingError(error, "Periksa data akun, kredensial administrator, koneksi, lalu coba lagi."));
    }
  };

  const save = () => {
    void runUpdate({ fullName: fullName.trim(), accountUsername: accountUsername.trim().toLowerCase(), email: email.trim().toLowerCase(), phone: phone.trim(), birthDate }, "Data akun diperbarui dan disimpan ke server.");
  };

  const resetTemporaryPassword = () => {
    if (temporaryPassword.length < 8) {
      Alert.alert("Sandi terlalu pendek", "Gunakan sandi sementara minimal 8 karakter.");
      return;
    }
    Alert.alert("Reset sandi sementara?", "Sandi baru akan diterapkan dan semua sesi lama pengguna akan dikeluarkan. Kirimkan sandi sementara hanya melalui saluran privat.", [
      { text: "Batal", style: "cancel" },
      {
        text: "Reset sandi",
        style: "destructive",
        onPress: () => {
          void runUpdate({ newPassword: temporaryPassword }, "Sandi sementara diterapkan. Semua sesi lama pengguna sudah dikeluarkan.").finally(() => setTemporaryPassword(""));
        },
      },
    ]);
  };

  const labelStyle = { color: "#9dd8af", fontSize: 11, marginBottom: 4 } as const;
  const inputStyle = { backgroundColor: "#07130b", borderColor: "#1d5a37", borderRadius: 9, borderWidth: 1, color: "#eaffef", padding: 11 } as const;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black">
      <ScrollView contentContainerStyle={{ gap: 10, padding: 18 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: "#58ff9a", fontSize: 12, fontWeight: "900" }}>AIRA X // AKUN TERDAFTAR</Text>
        <Text style={{ color: "#eaffef", fontSize: 21, fontWeight: "900" }}>Kelola Akun</Text>
        <Text style={{ color: "#9dd8af", fontSize: 11, lineHeight: 17 }}>Perubahan profil disimpan ke server utama. Reset sandi hanya tersedia untuk administrator terverifikasi.</Text>
        <View><Text style={labelStyle}>Nama lengkap</Text><TextInput value={fullName} onChangeText={setFullName} style={inputStyle} /></View>
        <View><Text style={labelStyle}>Username</Text><TextInput value={accountUsername} onChangeText={setAccountUsername} autoCapitalize="none" style={inputStyle} /></View>
        <View><Text style={labelStyle}>Email</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={inputStyle} /></View>
        <View><Text style={labelStyle}>Nomor WhatsApp</Text><TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={inputStyle} /></View>
        <MiniDatePicker label="Tanggal lahir" value={birthDate} onChange={setBirthDate} placeholder="Pilih tanggal lahir" maxDate={new Date().toISOString().slice(0, 10)} />
        <PrimaryButton label={update.isPending ? "Menyimpan…" : "Simpan perubahan"} icon="save" onPress={save} disabled={update.isPending} />
        <View style={{ borderTopColor: "#1d5a37", borderTopWidth: 1, gap: 8, marginTop: 10, paddingTop: 14 }}>
          <Text style={{ color: "#f7c86e", fontSize: 12, fontWeight: "900" }}>RESET SANDI SEMENTARA</Text>
          <Text style={{ color: "#9dd8af", fontSize: 11, lineHeight: 17 }}>Masukkan sandi sementara minimal 8 karakter. Pengguna akan keluar dari semua perangkat dan masuk kembali dengan sandi ini.</Text>
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <TextInput value={temporaryPassword} onChangeText={setTemporaryPassword} secureTextEntry={!showTemporaryPassword} autoCapitalize="none" autoCorrect={false} placeholder="Sandi sementara baru" placeholderTextColor="#438d61" style={[inputStyle, { flex: 1 }]} />
            <Pressable accessibilityLabel={showTemporaryPassword ? "Sembunyikan sandi sementara" : "Tampilkan sandi sementara"} onPress={() => setShowTemporaryPassword((value) => !value)} style={{ alignItems: "center", height: 44, justifyContent: "center", marginLeft: 6, width: 44 }}><MaterialIcons name={showTemporaryPassword ? "visibility-off" : "visibility"} size={21} color="#58ff9a" /></Pressable>
          </View>
          <PrimaryButton label={update.isPending ? "Memproses…" : "Reset sandi sementara"} icon="vpn-key" onPress={resetTemporaryPassword} disabled={update.isPending} />
        </View>
        <OutlineButton label="Kembali ke console" icon="arrow-back" onPress={() => router.back()} />
      </ScrollView>
    </ScreenContainer>
  );
}
