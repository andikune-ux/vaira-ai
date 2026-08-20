import { router, useLocalSearchParams } from "expo-router";
import { Alert, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { OutlineButton } from "@/components/aira-ui";
import { trpc } from "@/lib/trpc";

export default function AdministratorCloudScreen() {
  const params = useLocalSearchParams<{ username?: string; password?: string }>();
  const username = String(params.username ?? "");
  const password = String(params.password ?? "");
  const backups = trpc.airaxCloud.adminList.useQuery({ username, password }, { enabled: Boolean(username && password), retry: false });
  const update = trpc.airaxCloud.adminUpdate.useMutation({ onSuccess: () => { void backups.refetch(); } });
  const change = (backupId: number, status: "active" | "restricted" | "deleted") => Alert.alert(status === "deleted" ? "Hapus arsip dan riwayat?" : "Perbarui arsip?", status === "deleted" ? "Arsip akan langsung hilang dari daftar dan riwayat AiraxCloud. Tindakan tetap dicatat dalam audit administrator." : "Tindakan administrator akan dicatat.", [{ text: "Batal", style: "cancel" }, { text: "Lanjut", onPress: () => { void update.mutateAsync({ username, password, backupId, status }); } }]);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><ScrollView contentContainerStyle={{ padding: 18, gap: 12 }}><Text style={{ color: "#58ff9a", fontSize: 12, fontWeight: "900" }}>AIRA X // AiraXCloud</Text><Text style={{ color: "#eaffef", fontSize: 21, fontWeight: "900" }}>Penyimpanan Cloud</Text><Text style={{ color: "#9dd8af", fontSize: 12 }}>Daftar arsip berdasarkan akun. Isi cadangan tidak ditampilkan. Arsip tertua otomatis dihapus setelah satu bulan jika akun memiliki minimal dua cadangan.</Text>{(backups.data ?? []).map((backup) => <View key={backup.id} style={{ backgroundColor: "#07130b", borderColor: "#1d5a37", borderRadius: 12, borderWidth: 1, padding: 12, gap: 5 }}><Text style={{ color: "#eaffef", fontWeight: "900" }}>@{backup.username} · {backup.fileName}</Text><Text style={{ color: "#9dd8af", fontSize: 11 }}>{backup.status} · {new Date(backup.createdAt).toLocaleString("id-ID")}</Text><View style={{ flexDirection: "row", gap: 8 }}><OutlineButton label="Aktif" icon="cloud-done" onPress={() => change(backup.id, "active")} /><OutlineButton label="Batasi" icon="cloud-off" onPress={() => change(backup.id, "restricted")} /><OutlineButton label="Hapus" icon="delete-forever" onPress={() => change(backup.id, "deleted")} /></View></View>)}<OutlineButton label="Kembali ke console" icon="arrow-back" onPress={() => router.back()} /></ScrollView></ScreenContainer>;
}
