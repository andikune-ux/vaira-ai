import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAppToast } from "@/components/app-toast";
import { useFinance } from "@/lib/finance/finance-context";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

export default function PrivateGroupsScreen() {
  const { state } = useFinance();
  const { showToast } = useAppToast();
  const params = useLocalSearchParams<{ targetAccountId?: string; targetName?: string }>();
  const [composerOpen, setComposerOpen] = useState(Boolean(params.targetAccountId));
  const [name, setName] = useState(params.targetName ? `Obrolan ${params.targetName}` : "");
  const groups = trpc.privateGroups.list.useQuery(undefined, { enabled: state.profile.mode === "account", retry: false, refetchInterval: 10_000 });
  const create = trpc.privateGroups.create.useMutation({
    onSuccess: async (group) => {
      const target = Number(params.targetAccountId);
      if (Number.isInteger(target) && target > 0) {
        try { await addMember.mutateAsync({ groupId: group.id, accountId: target }); } catch (error) { showToast(getUserFacingError(error, "Grup dibuat, tetapi pengguna belum dapat ditambahkan."), "info"); }
      }
      setComposerOpen(false); setName(""); await groups.refetch(); router.replace({ pathname: "/private-group-chat", params: { groupId: String(group.id) } } as never);
    },
    onError: (error) => showToast(getUserFacingError(error, "Grup belum dapat dibuat."), "info"),
  });
  const addMember = trpc.privateGroups.addMember.useMutation();
  useEffect(() => { if (params.targetAccountId) setComposerOpen(true); }, [params.targetAccountId]);
  const submit = () => {
    if (!name.trim()) { showToast("Isi nama grup terlebih dahulu.", "info"); return; }
    void create.mutateAsync({ name: name.trim() });
  };

  if (state.profile.mode !== "account") return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><View style={styles.center}><MaterialIcons name="lock-outline" size={34} color="#8EA5C7" /><Text style={styles.emptyTitle}>Masuk akun diperlukan</Text><Text style={styles.emptyText}>Grup privat hanya tersedia setelah Anda masuk ke akun V A I R A A I.</Text><Pressable onPress={() => router.push("/login" as never)} style={styles.primary}><Text style={styles.primaryText}>Masuk</Text></Pressable></View></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><View style={styles.page}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.iconButton}><MaterialIcons name="arrow-back" size={22} color="#F1F6FF" /></Pressable><View style={styles.headerCopy}><Text style={styles.title}>Grup obrolan</Text><Text style={styles.subtitle}>Privat · maksimal 10 grup aktif</Text></View><Pressable onPress={() => setComposerOpen(true)} style={styles.iconButton}><MaterialIcons name="add" size={23} color="#36B7FF" /></Pressable></View>
    {groups.isLoading ? <View style={styles.center}><ActivityIndicator color="#36B7FF" /></View> : groups.isError ? <View style={styles.center}><Text style={styles.emptyTitle}>Grup belum dapat dimuat</Text><Pressable onPress={() => { void groups.refetch(); }} style={styles.outline}><Text style={styles.outlineText}>Coba ulang</Text></Pressable></View> : <FlatList data={groups.data ?? []} keyExtractor={(item) => String(item.id)} contentContainerStyle={groups.data?.length ? styles.list : styles.emptyList} ListEmptyComponent={<View style={styles.emptyCard}><MaterialIcons name="groups-2" size={36} color="#36B7FF" /><Text style={styles.emptyTitle}>Belum ada grup</Text><Text style={styles.emptyText}>Buat grup dari tombol tambah atau dari profil pengguna lain.</Text><Pressable onPress={() => setComposerOpen(true)} style={styles.primary}><Text style={styles.primaryText}>Buat grup</Text></Pressable></View>} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/private-group-chat", params: { groupId: String(item.id) } } as never)} style={({ pressed }) => [styles.groupCard, pressed && styles.pressed]}><View style={[styles.groupIcon, item.status === "frozen" && styles.groupIconFrozen]}><MaterialIcons name={item.status === "frozen" ? "ac-unit" : "group"} size={21} color={item.status === "frozen" ? "#F5B83D" : "#36B7FF"} /></View><View style={styles.groupCopy}><Text numberOfLines={1} style={styles.groupName}>{item.name}</Text><Text style={styles.groupMeta}>{item.memberCount} member · {item.isAdmin ? "Anda admin" : "Member"}</Text></View>{item.status === "frozen" ? <Text style={styles.frozen}>DIBEKUKAN</Text> : <MaterialIcons name="chevron-right" size={22} color="#7185A5" />}</Pressable>} />}
    <Modal visible={composerOpen} transparent animationType="fade" onRequestClose={() => setComposerOpen(false)}><View style={styles.modalBackdrop}><View style={styles.modal}><Text style={styles.modalTitle}>Buat grup privat</Text><Text style={styles.modalHint}>Pembuat grup menjadi admin. Grup hanya dapat dilihat member dan pemegang link undangan.</Text><TextInput value={name} onChangeText={setName} autoFocus placeholder="Nama grup" placeholderTextColor="#7185A5" maxLength={80} style={styles.input} /><View style={styles.modalActions}><Pressable onPress={() => setComposerOpen(false)} style={styles.outline}><Text style={styles.outlineText}>Batal</Text></Pressable><Pressable disabled={create.isPending} onPress={submit} style={[styles.primary, create.isPending && styles.disabled]}><Text style={styles.primaryText}>{create.isPending ? "Membuat…" : "Buat grup"}</Text></Pressable></View></View></View></Modal>
  </View></ScreenContainer>;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#050A15", paddingHorizontal: 16 }, header: { alignItems: "center", flexDirection: "row", gap: 10, paddingBottom: 12, paddingTop: 6 }, iconButton: { alignItems: "center", backgroundColor: "#0B1425", borderColor: "#1C2B44", borderRadius: 13, borderWidth: 1, height: 42, justifyContent: "center", width: 42 }, headerCopy: { flex: 1 }, title: { color: "#F1F6FF", fontSize: 20, fontWeight: "900" }, subtitle: { color: "#8EA5C7", fontSize: 10, marginTop: 2 }, list: { gap: 9, paddingBottom: 24 }, emptyList: { flexGrow: 1, justifyContent: "center" }, groupCard: { alignItems: "center", backgroundColor: "#0B1425", borderColor: "#1C2B44", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 11, padding: 12 }, pressed: { opacity: 0.72 }, groupIcon: { alignItems: "center", backgroundColor: "#36B7FF16", borderRadius: 12, height: 42, justifyContent: "center", width: 42 }, groupIconFrozen: { backgroundColor: "#F5B83D16" }, groupCopy: { flex: 1 }, groupName: { color: "#F1F6FF", fontSize: 14, fontWeight: "900" }, groupMeta: { color: "#8EA5C7", fontSize: 10, marginTop: 3 }, frozen: { color: "#F5B83D", fontSize: 8, fontWeight: "900" }, center: { alignItems: "center", flex: 1, gap: 10, justifyContent: "center", padding: 22 }, emptyCard: { alignItems: "center", backgroundColor: "#0B1425", borderColor: "#1C2B44", borderRadius: 18, borderWidth: 1, gap: 10, padding: 22 }, emptyTitle: { color: "#F1F6FF", fontSize: 16, fontWeight: "900", textAlign: "center" }, emptyText: { color: "#8EA5C7", fontSize: 11, lineHeight: 17, textAlign: "center" }, primary: { alignItems: "center", backgroundColor: "#36B7FF", borderRadius: 10, justifyContent: "center", minHeight: 40, paddingHorizontal: 15 }, primaryText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" }, outline: { alignItems: "center", borderColor: "#36B7FF", borderRadius: 10, borderWidth: 1, justifyContent: "center", minHeight: 40, paddingHorizontal: 15 }, outlineText: { color: "#36B7FF", fontSize: 11, fontWeight: "900" }, modalBackdrop: { alignItems: "center", backgroundColor: "#000000A8", flex: 1, justifyContent: "center", padding: 22 }, modal: { backgroundColor: "#0B1425", borderColor: "#1C2B44", borderRadius: 18, borderWidth: 1, gap: 12, padding: 18, width: "100%" }, modalTitle: { color: "#F1F6FF", fontSize: 17, fontWeight: "900" }, modalHint: { color: "#8EA5C7", fontSize: 11, lineHeight: 17 }, input: { backgroundColor: "#081120", borderColor: "#1C2B44", borderRadius: 10, borderWidth: 1, color: "#F1F6FF", fontSize: 13, paddingHorizontal: 11, paddingVertical: 10 }, modalActions: { flexDirection: "row", gap: 9, justifyContent: "flex-end" }, disabled: { opacity: 0.6 } });
