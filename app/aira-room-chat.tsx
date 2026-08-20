import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { AiraChatScreen } from "@/components/aira-chat-screen";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useFinance } from "@/lib/finance/finance-context";

export default function AiraRoomChatScreen() {
  const { state } = useFinance();
  const access = trpc.manualAccount.airaAccess.status.useQuery(undefined, { retry: false, staleTime: 30_000 });
  const allowed = access.data?.criterion === "premium" || access.data?.criterion === "admin";
  if (state.profile.mode !== "account") return <Locked message="Masuk ke akun terlebih dahulu untuk membuka Room Obrolan Aira." />;
  if (access.isLoading) return <Locked message="Memeriksa token akses Room Obrolan Aira…" />;
  if (!allowed) return <Locked message="Room Obrolan Aira memerlukan token Premium atau Admin. Chat teks biasa tetap dapat digunakan sesuai hak akses Anda." />;
  return <AiraChatScreen />;
}

function Locked({ message }: { message: string }) {
  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}><Text style={{ fontSize: 38 }}>🔒</Text><Text style={{ fontSize: 22, fontWeight: "800", textAlign: "center" }}>Room Obrolan Aira</Text><Text style={{ color: "#687076", textAlign: "center" }}>{message}</Text><Pressable onPress={() => router.back()} style={{ backgroundColor: "#0a7ea4", borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 }}><Text style={{ color: "#fff", fontWeight: "800" }}>Kembali</Text></Pressable></View></ScreenContainer>;
}
