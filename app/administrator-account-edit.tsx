import { router, useLocalSearchParams } from "expo-router";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { MiniDatePicker } from "@/components/mini-date-picker";
import { OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

export default function AdministratorAccountEditScreen() {
  const params = useLocalSearchParams<{ username?: string; password?: string; accountId?: string }>();
  const username = String(params.username ?? ""); const password = String(params.password ?? ""); const accountId = Number(params.accountId);
  const accounts = trpc.manualAccount.adminList.useQuery({ username, password }, { enabled: Boolean(username && password && accountId), retry: false });
  const update = trpc.manualAccount.adminUpdate.useMutation({ onSuccess: () => Alert.alert("Berhasil", "Data akun diperbarui.") });
  const account = accounts.data?.find((item) => item.id === accountId);
  const [fullName, setFullName] = useState(""); const [accountUsername, setAccountUsername] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState(""); const [birthDate, setBirthDate] = useState("");
  useEffect(() => { if (account) { setFullName(account.fullName); setAccountUsername(account.username); setEmail(account.email); setPhone(account.phone); setBirthDate(account.birthDate); } }, [account]);
  const save = () => { void update.mutateAsync({ username, password, accountId, fullName: fullName.trim(), accountUsername: accountUsername.trim().toLowerCase(), email: email.trim().toLowerCase(), phone: phone.trim(), birthDate }).catch((error) => Alert.alert("Belum tersimpan", getUserFacingError(error, "Data belum dapat diperbarui. Periksa ID, username, email, nomor WhatsApp, dan koneksi lalu coba lagi."))); };
  const labelStyle = { color: "#9dd8af", fontSize: 11, marginBottom: 4 } as const;
  const inputStyle = { backgroundColor: "#07130b", borderColor: "#1d5a37", borderRadius: 9, borderWidth: 1, color: "#eaffef", padding: 11 } as const;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><ScrollView contentContainerStyle={{ padding: 18, gap: 10 }}><Text style={{ color: "#58ff9a", fontSize: 12, fontWeight: "900" }}>AIRA X // AKUN TERDAFTAR</Text><Text style={{ color: "#eaffef", fontSize: 21, fontWeight: "900" }}>Kelola Akun</Text><View><Text style={labelStyle}>Nama lengkap</Text><TextInput value={fullName} onChangeText={setFullName} style={inputStyle} /></View><View><Text style={labelStyle}>Username</Text><TextInput value={accountUsername} onChangeText={setAccountUsername} autoCapitalize="none" style={inputStyle} /></View><View><Text style={labelStyle}>Email</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" style={inputStyle} /></View><View><Text style={labelStyle}>Nomor WhatsApp</Text><TextInput value={phone} onChangeText={setPhone} style={inputStyle} /></View><MiniDatePicker label="Tanggal lahir" value={birthDate} onChange={setBirthDate} placeholder="Pilih tanggal lahir" maxDate={new Date().toISOString().slice(0, 10)} /><PrimaryButton label={update.isPending ? "Menyimpan…" : "Simpan perubahan"} icon="save" onPress={save} /><OutlineButton label="Kembali ke console" icon="arrow-back" onPress={() => router.back()} /></ScrollView></ScreenContainer>;
}
