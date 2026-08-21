import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import { trpc } from "@/lib/trpc";

type HistoryItem = {
  conversationId: string;
  mode: "aira" | "hot_pro" | "scientist";
  title: string;
  messages: { id: string; role: "user" | "assistant"; content: string; createdAt: string }[];
  updatedAt: string;
  isPrivate?: boolean;
};

const modeLabel = (mode: HistoryItem["mode"]) => mode === "hot_pro" ? "Aira Hot Pro 18+" : mode === "scientist" ? "Aira Ahli Ilmuwan" : "Aira";

export default function AiraHistoryScreen() {
  const colors = useColors();
  const { state } = useFinance();
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const page = trpc.airaHistory.page.useQuery({ offset, limit: 40 }, { enabled: state.profile.mode === "account", retry: false, staleTime: 20_000 });

  useEffect(() => {
    if (!page.data) return;
    const next = page.data.items as HistoryItem[];
    setItems((current) => offset === 0 ? next : [...current, ...next.filter((entry) => !current.some((known) => known.conversationId === entry.conversationId))]);
  }, [offset, page.data]);

  const loadMore = () => {
    if (!page.data?.hasMore || page.isFetching || !page.data.items.length) return;
    setOffset((current) => current + page.data!.items.length);
  };

  if (state.profile.mode !== "account") return <ScreenContainer className="p-5" edges={["top", "bottom", "left", "right"]}><View style={styles.center}><MaterialIcons name="lock" size={32} color={colors.primary} /><Text style={[styles.title, { color: colors.foreground }]}>Masuk diperlukan</Text><Text style={[styles.description, { color: colors.muted }]}>Riwayat Aira tersimpan dan dapat dibuka setelah masuk ke akun Anda.</Text><Pressable onPress={() => router.push("/login" as never)} style={[styles.primary, { backgroundColor: colors.primary }]}><Text style={styles.primaryText}>Masuk</Text></Pressable></View></ScreenContainer>;

  if (selected) return <ScreenContainer className="p-5" edges={["top", "bottom", "left", "right"]}><View style={styles.header}><Pressable accessibilityLabel="Kembali ke daftar riwayat" onPress={() => setSelected(null)} style={[styles.back, { borderColor: colors.border }]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={styles.headerText}><Text numberOfLines={1} style={[styles.title, { color: colors.foreground }]}>{selected.isPrivate ? "Riwayat privat" : selected.title}</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{modeLabel(selected.mode)} · {selected.messages.length} pesan</Text></View></View><FlatList data={selected.messages} keyExtractor={(message) => message.id} contentContainerStyle={styles.messageList} renderItem={({ item }) => <View style={[styles.messageCard, { alignSelf: item.role === "user" ? "flex-end" : "flex-start", backgroundColor: item.role === "user" ? colors.primary : colors.surface, borderColor: colors.border }]}><Text style={[styles.messageRole, { color: item.role === "user" ? "#FFFFFFCC" : colors.primary }]}>{item.role === "user" ? "Anda" : "Aira"}</Text><Text style={[styles.messageText, { color: item.role === "user" ? "#FFFFFF" : colors.foreground }]}>{item.content}</Text></View>} /></ScreenContainer>;

  return <ScreenContainer className="p-5" edges={["top", "bottom", "left", "right"]}><View style={styles.header}><Pressable accessibilityLabel="Kembali" onPress={() => router.back()} style={[styles.back, { borderColor: colors.border }]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={styles.headerText}><Text style={[styles.title, { color: colors.foreground }]}>Riwayat Aira</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Riwayat terbaru dimuat lebih dahulu agar tetap lancar.</Text></View></View><FlatList data={items} keyExtractor={(item) => item.conversationId} contentContainerStyle={styles.list} ListEmptyComponent={page.isLoading ? <View style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={[styles.description, { color: colors.muted }]}>Memuat riwayat…</Text></View> : <View style={styles.center}><MaterialIcons name="forum" size={30} color={colors.muted} /><Text style={[styles.description, { color: colors.muted }]}>Belum ada riwayat Aira tersimpan.</Text></View>} renderItem={({ item }) => <Pressable onPress={() => setSelected(item)} style={({ pressed }) => [styles.historyRow, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name={item.isPrivate ? "lock" : "forum"} size={20} color={colors.primary} /><View style={styles.historyText}><Text numberOfLines={1} style={[styles.historyTitle, { color: colors.foreground }]}>{item.isPrivate ? "Riwayat privat" : item.title}</Text><Text style={[styles.historyMeta, { color: colors.muted }]}>{modeLabel(item.mode)} · {item.messages.length} pesan · {new Date(item.updatedAt).toLocaleDateString("id-ID")}</Text></View><MaterialIcons name="chevron-right" size={20} color={colors.muted} /></Pressable>} ListFooterComponent={items.length && page.data?.hasMore ? <Pressable disabled={page.isFetching} onPress={loadMore} style={[styles.loadMore, { borderColor: colors.primary, opacity: page.isFetching ? .6 : 1 }]}>{page.isFetching ? <ActivityIndicator size="small" color={colors.primary} /> : <MaterialIcons name="expand-more" size={19} color={colors.primary} />}<Text style={[styles.loadMoreText, { color: colors.primary }]}>{page.isFetching ? "Memuat…" : "Muat riwayat lebih lama"}</Text></Pressable> : null} /></ScreenContainer>;
}

const styles = StyleSheet.create({ header: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 14 }, back: { alignItems: "center", borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, headerText: { flex: 1, minWidth: 0 }, title: { fontSize: 22, fontWeight: "900" }, subtitle: { fontSize: 11, lineHeight: 16, marginTop: 3 }, list: { gap: 9, paddingBottom: 30 }, historyRow: { alignItems: "center", borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 10, minHeight: 68, paddingHorizontal: 12 }, historyText: { flex: 1, minWidth: 0 }, historyTitle: { fontSize: 14, fontWeight: "800" }, historyMeta: { fontSize: 10, marginTop: 4 }, loadMore: { alignItems: "center", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 6, justifyContent: "center", marginTop: 6, minHeight: 46 }, loadMoreText: { fontSize: 12, fontWeight: "900" }, center: { alignItems: "center", gap: 9, justifyContent: "center", minHeight: 220, paddingHorizontal: 24 }, description: { fontSize: 12, lineHeight: 18, textAlign: "center" }, primary: { borderRadius: 12, marginTop: 8, paddingHorizontal: 18, paddingVertical: 12 }, primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, messageList: { gap: 10, paddingBottom: 26 }, messageCard: { borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, maxWidth: "90%", padding: 11 }, messageRole: { fontSize: 10, fontWeight: "900", marginBottom: 4 }, messageText: { fontSize: 14, lineHeight: 20 }, pressed: { opacity: .7 } });
