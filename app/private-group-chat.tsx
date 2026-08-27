import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image as ExpoImage } from "expo-image";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";

import { KeyboardAvoidingView } from "@/components/chat-keyboard-avoiding";
import { ScreenContainer } from "@/components/screen-container";
import { useAppToast } from "@/components/app-toast";
import { useFinance } from "@/lib/finance/finance-context";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";
import { createPrivateGroupInviteUrl } from "@/lib/private-group-links";

function time(value: string | Date) {
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function isLink(value: string) {
  return /^(?:https?:\/\/|www\.)/i.test(value);
}

export default function PrivateGroupChatScreen() {
  const { groupId: rawGroupId } = useLocalSearchParams<{ groupId?: string }>();
  const groupId = Number(rawGroupId);
  const { state } = useFinance();
  const { showToast } = useAppToast();
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<{ id: number; displayName: string; content: string } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [memberPublicId, setMemberPublicId] = useState("");
  const [mediaSending, setMediaSending] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const detail = trpc.privateGroups.detail.useQuery({ groupId }, { enabled: Number.isInteger(groupId) && groupId > 0 && state.profile.mode === "account", retry: false, refetchInterval: 5_000 });
  const messages = trpc.privateGroups.messages.useQuery({ groupId }, { enabled: Boolean(detail.data?.isMember), retry: false, refetchInterval: 4_000 });
  const send = trpc.privateGroups.sendMessage.useMutation({ onSuccess: () => { setMessage(""); setReply(null); void messages.refetch(); } });
  const deleteOwn = trpc.privateGroups.deleteOwnMessage.useMutation({ onSuccess: () => void messages.refetch() });
  const deleteAsAdmin = trpc.privateGroups.deleteMessageAsAdmin.useMutation({ onSuccess: () => { showToast("Pesan dihapus admin grup.", "success"); void messages.refetch(); } });
  const deleteAllAsAdmin = trpc.privateGroups.deleteAllMessagesAsAdmin.useMutation({ onSuccess: (result) => { showToast(`${result.deletedCount} pesan grup dihapus.`, "success"); void messages.refetch(); } });
  const updateName = trpc.privateGroups.updateName.useMutation({ onSuccess: async () => { await detail.refetch(); showToast("Nama grup diperbarui.", "success"); } });
  const updatePhoto = trpc.privateGroups.updatePhoto.useMutation({ onSuccess: async () => { await detail.refetch(); showToast("Foto profil grup diperbarui.", "success"); } });
  const addMemberByPublicId = trpc.privateGroups.addMemberByPublicId.useMutation({ onSuccess: async () => { setMemberPublicId(""); await detail.refetch(); showToast("Member ditambahkan ke grup.", "success"); } });
  const removeMember = trpc.privateGroups.removeMember.useMutation({ onSuccess: async () => { await detail.refetch(); showToast("Member dikeluarkan. Link dan ID lama tidak dapat dipakai olehnya.", "success"); } });
  const transferAdmin = trpc.privateGroups.transferAdmin.useMutation({ onSuccess: async () => { await detail.refetch(); showToast("Admin grup telah dialihkan.", "success"); } });
  const leave = trpc.privateGroups.leave.useMutation({ onSuccess: (result) => { showToast(result.transferredToAccountId ? "Anda keluar; admin dipindahkan ke member yang paling awal bergabung." : result.groupDeleted ? "Anda keluar; grup tanpa member ditutup." : "Anda sudah keluar dari grup.", "success"); router.replace("/private-groups" as never); } });
  const invite = trpc.privateGroups.createInvite.useMutation();
  const createMediaUpload = trpc.privateGroups.createMediaUpload.useMutation();

  const group = detail.data;
  const ownAccountId = useMemo(() => group?.members.find((member) => member.username === state.profile.username)?.accountId ?? null, [group?.members, state.profile.username]);
  const activeGroup = group?.status === "active";
  const canSend = Boolean(group?.isMember && activeGroup && message.trim() && !send.isPending && !mediaSending);

  const openSettings = () => { setNameDraft(group?.name ?? ""); setSettingsOpen(true); };
  const openMessageLink = (value: string) => {
    const url = /^www\./i.test(value) ? `https://${value}` : value;
    if (!/^https?:\/\//i.test(url)) { showToast("Link tidak aman dan tidak dapat dibuka.", "info"); return; }
    Alert.alert("Peringatan keamanan link", "Periksa alamat tujuan dan jangan memasukkan kata sandi atau data pribadi pada situs yang tidak tepercaya.", [
      { text: "Batal", style: "cancel" },
      { text: "Buka browser", onPress: () => { void Linking.openURL(url).catch(() => showToast("Link tidak dapat dibuka pada perangkat ini.", "info")); } },
    ]);
  };
  const shareInvite = async () => {
    try {
      const created = await invite.mutateAsync({ groupId });
      const url = createPrivateGroupInviteUrl(created.token);
      await Clipboard.setStringAsync(url);
      await Share.share({ message: `Bergabung ke grup privat ${created.name} di V A I R A  A I. ID grup terbaru: ${created.publicGroupId}. Link undangan: ${url}`, url });
      await detail.refetch();
      showToast("Link disalin dan siap dibagikan. Link serta ID sebelumnya tidak berlaku lagi.", "success");
    } catch (error) { showToast(getUserFacingError(error, "Link grup belum dapat dibuat."), "info"); }
  };
  const sendText = () => {
    if (!canSend) return;
    void send.mutateAsync({ groupId, content: message.trim(), replyToId: reply?.id ?? null, replyToDisplayName: reply?.displayName ?? null, replyToContent: reply?.content ?? null }).catch((error) => showToast(getUserFacingError(error, "Pesan belum dapat dikirim."), "info"));
  };
  const uploadImage = async (purpose: "message" | "profile") => {
    if (!activeGroup || mediaSending) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { Alert.alert("Izin galeri diperlukan", "Izinkan akses galeri untuk memilih foto grup."); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, quality: 0.82, aspect: purpose === "profile" ? [1, 1] : undefined });
      const asset = result.canceled ? null : result.assets[0];
      if (!asset?.uri) return;
      const info = await FileSystem.getInfoAsync(asset.uri);
      if (!info.exists || !info.size) throw new Error("Berkas foto tidak dapat dibaca.");
      setMediaSending(true);
      const mimeType = asset.mimeType || "image/jpeg";
      const ticket = await createMediaUpload.mutateAsync({ groupId, fileName: asset.fileName || `foto-grup-${Date.now()}.${mimeType.includes("png") ? "png" : "jpg"}`, mimeType });
      const uploaded = await FileSystem.createUploadTask(ticket.uploadUrl, asset.uri, { httpMethod: "PUT", uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT, headers: { "Content-Type": ticket.mimeType }, sessionType: FileSystem.FileSystemSessionType.BACKGROUND }).uploadAsync();
      if (!uploaded || uploaded.status < 200 || uploaded.status >= 300) throw new Error("Storage belum menerima foto.");
      if (purpose === "profile") {
        await updatePhoto.mutateAsync({ groupId, storageKey: ticket.storageKey });
      } else {
        await send.mutateAsync({ groupId, content: `[Group photo key=${ticket.storageKey}] ${message.trim()}`, mediaStorageKey: ticket.storageKey, replyToId: reply?.id ?? null, replyToDisplayName: reply?.displayName ?? null, replyToContent: reply?.content ?? null });
        showToast("Foto berhasil dibagikan ke grup.", "success");
      }
    } catch (error) { showToast(getUserFacingError(error, "Foto belum dapat dikirim. Coba lagi."), "info"); } finally { setMediaSending(false); }
  };
  const toggleVoiceNote = async () => {
    if (!activeGroup || mediaSending) return;
    try {
      if (!recorderState.isRecording) {
        const permission = await requestRecordingPermissionsAsync();
        if (!permission.granted) { Alert.alert("Izin mikrofon diperlukan", "Izinkan mikrofon untuk merekam voice note grup."); return; }
        await recorder.prepareToRecordAsync();
        recorder.record();
        setRecordingStartedAt(Date.now());
        showToast("Merekam voice note… tekan mikrofon lagi untuk mengirim.", "info");
        return;
      }
      await recorder.stop();
      const uri = recorder.uri;
      const duration = Math.max(1, Math.round((Date.now() - (recordingStartedAt ?? Date.now())) / 1000));
      setRecordingStartedAt(null);
      if (!uri) throw new Error("Rekaman belum tersedia.");
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists || !info.size) throw new Error("Berkas rekaman tidak dapat dibaca.");
      setMediaSending(true);
      const ticket = await createMediaUpload.mutateAsync({ groupId, fileName: `voice-note-grup-${Date.now()}.m4a`, mimeType: "audio/mp4" });
      const uploaded = await FileSystem.createUploadTask(ticket.uploadUrl, uri, { httpMethod: "PUT", uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT, headers: { "Content-Type": ticket.mimeType }, sessionType: FileSystem.FileSystemSessionType.BACKGROUND }).uploadAsync();
      if (!uploaded || uploaded.status < 200 || uploaded.status >= 300) throw new Error("Storage belum menerima voice note.");
      await send.mutateAsync({ groupId, content: `[Group voice key=${ticket.storageKey} · ${duration}s] Pesan suara`, mediaStorageKey: ticket.storageKey, replyToId: reply?.id ?? null, replyToDisplayName: reply?.displayName ?? null, replyToContent: reply?.content ?? null });
      showToast("Voice note berhasil dikirim.", "success");
    } catch (error) { showToast(getUserFacingError(error, "Voice note belum terkirim. Coba lagi."), "info"); } finally { setRecordingStartedAt(null); setMediaSending(false); }
  };
  const promptDeleteMessage = (item: { id: number; accountId: number }) => {
    const own = item.accountId === ownAccountId;
    if (!own && !group?.isAdmin) { showToast("Hanya admin grup yang dapat menghapus pesan member lain.", "info"); return; }
    Alert.alert("Hapus pesan?", group?.isAdmin && !own ? "Pesan member akan ditandai sebagai dihapus oleh admin grup." : "Pesan akan ditandai sebagai dihapus.", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => { if (group?.isAdmin && !own) void deleteAsAdmin.mutateAsync({ groupId, messageId: item.id }); else void deleteOwn.mutateAsync({ groupId, messageId: item.id }); } },
    ]);
  };
  const confirmDeleteAll = () => Alert.alert("Hapus seluruh percakapan?", "Semua pesan akan disembunyikan dari member dan dicatat sebagai penghapusan admin.", [
    { text: "Batal", style: "cancel" },
    { text: "Lanjutkan", style: "destructive", onPress: () => Alert.alert("Konfirmasi terakhir", "Tindakan ini berlaku untuk seluruh riwayat grup.", [{ text: "Batal", style: "cancel" }, { text: "Hapus semua", style: "destructive", onPress: () => { void deleteAllAsAdmin.mutateAsync({ groupId, confirmation: "HAPUS SEMUA PERCAKAPAN" }); } }]) },
  ]);
  const askLeave = () => Alert.alert("Keluar grup?", group?.isAdmin ? "Jika masih ada member, admin otomatis berpindah ke member yang paling awal bergabung." : "Anda dapat bergabung kembali melalui link undangan admin.", [{ text: "Batal", style: "cancel" }, { text: "Keluar grup", style: "destructive", onPress: () => { void leave.mutateAsync({ groupId }); } }]);
  const renderContent = (content: string, mediaUrl?: string | null) => {
    const photo = content.match(/^\[(?:Group photo|Private group photo) (?:url|key)=([^\s]+)\]\s*(.*)$/s);
    if (photo) return <View style={styles.mediaPost}><ExpoImage source={{ uri: mediaUrl ?? photo[1] }} cachePolicy="none" contentFit="cover" style={styles.photo} /><Text style={styles.mediaCaption}>{photo[2] || "Foto"}</Text></View>;
    const voice = content.match(/^\[(?:Group voice|Private group voice) (?:(?:url|key)=([^\s]+)|audio=([^\s]+)) · (\d+s)\]\s*(.*)$/s);
    if (voice) return <GroupVoiceNote uri={mediaUrl ?? voice[1] ?? voice[2]} duration={voice[3]} label={voice[4] || "Pesan suara"} />;
    const parts = content.split(/((?:https?:\/\/|www\.)[^\s]+)/gi);
    return <Text style={styles.content}>{parts.map((part, index) => isLink(part) ? <Text key={`${part}-${index}`} accessibilityRole="link" style={styles.messageLink} onPress={() => openMessageLink(part.replace(/[),.!?;:]+$/, ""))}>{part}</Text> : <Text key={`${part}-${index}`}>{part}</Text>)}</Text>;
  };

  if (detail.isLoading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><View style={styles.center}><ActivityIndicator color="#36B7FF" /></View></ScreenContainer>;
  if (detail.isError || !group) return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><View style={styles.center}><MaterialIcons name="lock-outline" size={34} color="#8EA5C7" /><Text style={styles.emptyTitle}>Grup tidak tersedia</Text><Text style={styles.emptyText}>Anda mungkin sudah keluar atau grup telah dihapus.</Text><Pressable onPress={() => router.replace("/private-groups" as never)} style={styles.primary}><Text style={styles.primaryText}>Kembali ke grup</Text></Pressable></View></ScreenContainer>;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><KeyboardAvoidingView style={styles.screen}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.iconButton}><MaterialIcons name="arrow-back" size={22} color="#F1F6FF" /></Pressable>{group.photoUrl ? <ExpoImage source={{ uri: group.photoUrl }} contentFit="cover" style={styles.groupAvatar} /> : <View style={styles.groupAvatarFallback}><MaterialIcons name="groups" size={18} color="#8DEBFF" /></View>}<View style={styles.headerCopy}><Text numberOfLines={1} style={styles.title}>{group.name}</Text><Text style={[styles.subtitle, group.status === "frozen" && styles.frozenText]}>{group.status === "frozen" ? "Grup dibekukan · baca saja" : `${group.memberCount} member · privat`}</Text></View><Pressable onPress={openSettings} style={styles.iconButton}><MaterialIcons name="settings" size={20} color="#36B7FF" /></Pressable></View>
    {group.status === "frozen" ? <View style={styles.freezeBanner}><MaterialIcons name="ac-unit" size={17} color="#F5B83D" /><Text style={styles.freezeText}>Administrator Vaira membekukan grup ini. Riwayat tetap dapat dibaca.</Text></View> : null}
    <FlatList style={styles.messageList} data={messages.data ?? []} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.messages} ListEmptyComponent={<View style={styles.emptyChat}><Text style={styles.emptyText}>Belum ada pesan. Mulai obrolan privat dengan aman.</Text></View>} renderItem={({ item }) => { const own = item.accountId === ownAccountId; const removed = Boolean(item.deletedAt); return <Pressable onLongPress={() => { if (!removed) promptDeleteMessage(item); }} style={[styles.messageRow, own && styles.messageRowOwn]}><View style={[styles.bubble, own ? styles.bubbleOwn : styles.bubbleOther]}>{!own ? <Text style={styles.author}>{item.displayName}</Text> : null}{item.replyToId ? <View style={styles.replyPreview}><Text numberOfLines={1} style={styles.replyAuthor}>{item.replyToDisplayName}</Text><Text numberOfLines={1} style={styles.replyText}>{item.replyToContent}</Text></View> : null}{removed ? <Text style={[styles.content, styles.deleted]}>Pesan ini telah dihapus.</Text> : renderContent(item.content, item.mediaUrl)}<View style={styles.meta}><Text style={styles.time}>{time(item.createdAt)}</Text>{!removed ? <Pressable onPress={() => setReply({ id: item.id, displayName: item.displayName, content: item.content })}><Text style={styles.replyButton}>Balas</Text></Pressable> : null}</View></View></Pressable>; }} />
    {reply ? <View style={styles.replyBar}><View style={styles.headerCopy}><Text numberOfLines={1} style={styles.replying}>Membalas {reply.displayName}</Text><Text numberOfLines={1} style={styles.replyingText}>{reply.content}</Text></View><Pressable onPress={() => setReply(null)}><MaterialIcons name="close" size={18} color="#8EA5C7" /></Pressable></View> : null}
    <View style={styles.composer}><Pressable accessibilityLabel="Tambah foto grup" disabled={!activeGroup || mediaSending} onPress={() => { void uploadImage("message"); }} style={[styles.mediaButton, (!activeGroup || mediaSending) && styles.disabled]}><MaterialIcons name="image" size={18} color="#8DEBFF" /></Pressable><Pressable accessibilityLabel={recorderState.isRecording ? "Kirim voice note grup" : "Rekam voice note grup"} disabled={!activeGroup || mediaSending} onPress={() => { void toggleVoiceNote(); }} style={[styles.mediaButton, recorderState.isRecording && styles.recordingButton, (!activeGroup || mediaSending) && styles.disabled]}><MaterialIcons name={recorderState.isRecording ? "stop" : "mic"} size={18} color={recorderState.isRecording ? "#FF9BAB" : "#8DEBFF"} /></Pressable><TextInput value={message} onChangeText={setMessage} editable={Boolean(activeGroup && !send.isPending && !mediaSending)} multiline maxLength={4_000} returnKeyType="default" blurOnSubmit={false} placeholder={group.status === "frozen" ? "Grup dibekukan oleh Administrator Vaira" : "Tulis pesan…"} placeholderTextColor="#7185A5" style={styles.input} /><Pressable disabled={!canSend} onPress={sendText} style={[styles.send, !canSend && styles.disabled]}>{send.isPending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialIcons name="send" size={19} color="#FFFFFF" />}</Pressable></View>
    <Modal visible={settingsOpen} animationType="slide" onRequestClose={() => setSettingsOpen(false)}><ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><ScrollView contentContainerStyle={styles.settingsPage}><View style={styles.header}><Pressable onPress={() => setSettingsOpen(false)} style={styles.iconButton}><MaterialIcons name="arrow-back" size={22} color="#F1F6FF" /></Pressable><View style={styles.headerCopy}><Text style={styles.title}>Pengaturan grup</Text><Text style={styles.subtitle}>Privat · {group.memberCount} member</Text></View></View>{group.isAdmin ? <><View style={styles.settingsCard}><Text style={styles.sectionTitle}>Profil grup</Text><View style={styles.photoEditor}>{group.photoUrl ? <ExpoImage source={{ uri: group.photoUrl }} contentFit="cover" style={styles.profilePreview} /> : <View style={styles.profilePreviewFallback}><MaterialIcons name="groups" size={28} color="#8DEBFF" /></View>}<View style={styles.headerCopy}><Text style={styles.memberName}>{group.name}</Text><Text style={styles.settingsHint}>Foto profil hanya dapat diubah oleh admin grup.</Text></View></View><Pressable disabled={!activeGroup || mediaSending || updatePhoto.isPending} onPress={() => { void uploadImage("profile"); }} style={[styles.outlineButton, (!activeGroup || mediaSending || updatePhoto.isPending) && styles.disabled]}><MaterialIcons name="photo-camera" size={17} color="#8DEBFF" /><Text style={styles.outlineText}>{mediaSending || updatePhoto.isPending ? "Mengunggah foto…" : group.photoUrl ? "Ganti foto profil grup" : "Pasang foto profil grup"}</Text></Pressable></View><View style={styles.settingsCard}><Text style={styles.sectionTitle}>Nama grup</Text><TextInput value={nameDraft} onChangeText={setNameDraft} maxLength={80} style={styles.settingsInput} placeholder="Nama grup" placeholderTextColor="#7185A5" /><Pressable disabled={updateName.isPending || nameDraft.trim().length < 2} onPress={() => { void updateName.mutateAsync({ groupId, name: nameDraft.trim() }).catch((error) => showToast(getUserFacingError(error, "Nama grup belum diperbarui."), "info")); }} style={[styles.primary, (updateName.isPending || nameDraft.trim().length < 2) && styles.disabled]}><Text style={styles.primaryText}>Simpan nama grup</Text></Pressable></View></> : null}<View style={styles.settingsCard}><View style={styles.settingsHeading}><Text style={styles.sectionTitle}>Member grup</Text><Text style={styles.memberCount}>{group.memberCount}</Text></View>{group.isAdmin ? <View style={styles.addMemberRow}><TextInput value={memberPublicId} onChangeText={setMemberPublicId} autoCapitalize="characters" placeholder="ID publik pengguna" placeholderTextColor="#7185A5" style={[styles.settingsInput, styles.memberIdInput]} /><Pressable disabled={addMemberByPublicId.isPending || memberPublicId.trim().length < 3 || !activeGroup} onPress={() => { void addMemberByPublicId.mutateAsync({ groupId, publicId: memberPublicId.trim() }).catch((error) => showToast(getUserFacingError(error, "Member belum dapat ditambahkan."), "info")); }} style={[styles.primary, styles.addMemberButton, (addMemberByPublicId.isPending || memberPublicId.trim().length < 3 || !activeGroup) && styles.disabled]}><MaterialIcons name="person-add" size={18} color="#FFFFFF" /></Pressable></View> : null}{group.members.map((member) => <View key={member.accountId} style={styles.memberRow}><View style={styles.memberAvatar}><Text style={styles.memberInitial}>{member.displayName.slice(0, 1).toUpperCase()}</Text></View><View style={styles.headerCopy}><Text style={styles.memberName}>{member.displayName}</Text><Text style={styles.memberMeta}>{member.isAdmin ? "Admin grup" : `Member · ID ${member.publicId ?? "tidak tersedia"}`}</Text></View>{group.isAdmin && !member.isAdmin ? <View style={styles.memberActions}><Pressable onPress={() => Alert.alert("Jadikan admin?", `${member.displayName} akan menjadi satu-satunya admin grup.`, [{ text: "Batal", style: "cancel" }, { text: "Serahkan admin", onPress: () => { void transferAdmin.mutateAsync({ groupId, accountId: member.accountId }).catch((error) => showToast(getUserFacingError(error, "Admin belum dialihkan."), "info")); } }])} style={styles.memberAction}><MaterialIcons name="admin-panel-settings" size={17} color="#36B7FF" /></Pressable><Pressable onPress={() => Alert.alert("Keluarkan member?", `${member.displayName} tidak dapat kembali memakai link lama. Buat link baru bila ingin mengizinkannya bergabung lagi.`, [{ text: "Batal", style: "cancel" }, { text: "Keluarkan", style: "destructive", onPress: () => { void removeMember.mutateAsync({ groupId, accountId: member.accountId }).catch((error) => showToast(getUserFacingError(error, "Member belum dikeluarkan."), "info")); } }])} style={styles.memberAction}><MaterialIcons name="person-remove" size={17} color="#FF7D91" /></Pressable></View> : null}</View>)}</View>{group.isAdmin ? <><View style={styles.settingsCard}><Text style={styles.sectionTitle}>ID dan undangan grup</Text><Text style={styles.memberMeta}>ID grup: {group.publicGroupId}</Text><Text style={styles.settingsHint}>Memperbarui link juga membuat ID grup baru. Member yang pernah dikeluarkan hanya dapat kembali memakai ID atau link yang terbaru.</Text><Pressable disabled={invite.isPending || !activeGroup} onPress={() => { void shareInvite(); }} style={[styles.primary, (invite.isPending || !activeGroup) && styles.disabled]}><MaterialIcons name="link" size={17} color="#FFFFFF" /><Text style={styles.primaryText}>{invite.isPending ? "Membuat link…" : "Perbarui link & ID"}</Text></Pressable></View><View style={styles.dangerCard}><Text style={styles.sectionTitle}>Hapus percakapan grup</Text><Text style={styles.settingsHint}>Semua pesan akan disembunyikan dari tampilan member dan dicatat sebagai tindakan admin grup.</Text><Pressable disabled={deleteAllAsAdmin.isPending} onPress={confirmDeleteAll} style={styles.leaveButton}><Text style={styles.leaveText}>{deleteAllAsAdmin.isPending ? "Menghapus…" : "Hapus seluruh percakapan"}</Text></Pressable></View></> : null}<View style={styles.leaveCard}><Text style={styles.sectionTitle}>Keluar grup</Text><Text style={styles.settingsHint}>{group.isAdmin ? "Admin akan otomatis dipindahkan ke member yang paling awal bergabung." : "Anda dapat masuk kembali memakai link dari admin."}</Text><Pressable disabled={leave.isPending} onPress={askLeave} style={styles.leaveButton}><Text style={styles.leaveText}>{leave.isPending ? "Keluar…" : "Keluar grup"}</Text></Pressable></View></ScrollView></ScreenContainer></Modal>
  </KeyboardAvoidingView></ScreenContainer>;
}

function GroupVoiceNote({ uri, duration, label }: { uri: string; duration: string; label: string }) {
  const player = useAudioPlayer(uri, { updateInterval: 250, downloadFirst: true });
  const status = useAudioPlayerStatus(player);
  useEffect(() => { void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }); return () => { player.pause(); player.remove(); }; }, [player]);
  const toggle = () => { if (status.playing) player.pause(); else { if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) player.seekTo(0); player.play(); } };
  return <Pressable accessibilityRole="button" accessibilityLabel={status.playing ? "Jeda voice note grup" : "Putar voice note grup"} onPress={toggle} style={styles.voicePost}><MaterialIcons name={status.playing ? "pause-circle-filled" : "play-circle-filled"} size={27} color="#8DEBFF" /><View style={styles.headerCopy}><Text style={styles.voiceTitle}>Voice note · {duration}</Text><Text numberOfLines={2} style={styles.voiceLabel}>{status.isBuffering ? "Memuat audio…" : status.playing ? "Sedang diputar" : label}</Text></View></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, center: { alignItems: "center", flex: 1, gap: 10, justifyContent: "center", padding: 22 }, header: { alignItems: "center", flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingBottom: 10, paddingTop: 6 }, headerCopy: { flex: 1, minWidth: 0 }, iconButton: { alignItems: "center", backgroundColor: "#0B1425", borderColor: "#1C2B44", borderRadius: 13, borderWidth: 1, height: 42, justifyContent: "center", width: 42 }, groupAvatar: { borderRadius: 18, height: 36, width: 36 }, groupAvatarFallback: { alignItems: "center", backgroundColor: "#0B1425", borderColor: "#1C2B44", borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 }, title: { color: "#F1F6FF", fontSize: 17, fontWeight: "900" }, subtitle: { color: "#8EA5C7", fontSize: 10, marginTop: 2 }, frozenText: { color: "#F5B83D" }, freezeBanner: { alignItems: "center", backgroundColor: "#F5B83D14", borderColor: "#F5B83D44", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 7, marginHorizontal: 16, padding: 9 }, freezeText: { color: "#F8D797", flex: 1, fontSize: 10, lineHeight: 14 }, messageList: { flex: 1 }, messages: { gap: 7, padding: 14, paddingBottom: 10 }, emptyChat: { alignItems: "center", paddingTop: 50 }, emptyTitle: { color: "#F1F6FF", fontSize: 16, fontWeight: "900", textAlign: "center" }, emptyText: { color: "#8EA5C7", fontSize: 11, lineHeight: 17, textAlign: "center" }, messageRow: { alignItems: "flex-start", flexDirection: "row" }, messageRowOwn: { justifyContent: "flex-end" }, bubble: { borderRadius: 14, maxWidth: "85%", padding: 10 }, bubbleOwn: { backgroundColor: "#166A92" }, bubbleOther: { backgroundColor: "#0B1425", borderColor: "#1C2B44", borderWidth: 1 }, author: { color: "#8DEBFF", fontSize: 10, fontWeight: "900", marginBottom: 4 }, content: { color: "#F1F6FF", fontSize: 13, lineHeight: 19 }, messageLink: { color: "#63C7FF", fontWeight: "800", textDecorationLine: "underline" }, deleted: { color: "#B3C0D4", fontStyle: "italic" }, mediaPost: { gap: 6 }, photo: { borderRadius: 9, height: 185, width: 210 }, mediaCaption: { color: "#F1F6FF", fontSize: 12, lineHeight: 18 }, voicePost: { alignItems: "center", backgroundColor: "#071B2B", borderColor: "#1C4565", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 8, padding: 8 }, voiceTitle: { color: "#8DEBFF", fontSize: 10, fontWeight: "900" }, voiceLabel: { color: "#B9C8DD", fontSize: 10, marginTop: 2 }, meta: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "flex-end", marginTop: 5 }, time: { color: "#B9DFFF", fontSize: 8 }, replyButton: { color: "#8DEBFF", fontSize: 9, fontWeight: "900" }, replyPreview: { borderLeftColor: "#8DEBFF", borderLeftWidth: 2, marginBottom: 6, paddingLeft: 7 }, replyAuthor: { color: "#8DEBFF", fontSize: 9, fontWeight: "900" }, replyText: { color: "#B9C8DD", fontSize: 9, marginTop: 2 }, replyBar: { alignItems: "center", backgroundColor: "#0B1425", borderTopColor: "#1C2B44", borderTopWidth: 1, flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 8 }, replying: { color: "#36B7FF", fontSize: 10, fontWeight: "900" }, replyingText: { color: "#8EA5C7", fontSize: 10, marginTop: 2 }, composer: { alignItems: "flex-end", backgroundColor: "#050A15", borderTopColor: "#1C2B44", borderTopWidth: 1, flexDirection: "row", gap: 6, padding: 10 }, mediaButton: { alignItems: "center", backgroundColor: "#0B1425", borderColor: "#1C2B44", borderRadius: 11, borderWidth: 1, height: 42, justifyContent: "center", width: 35 }, recordingButton: { backgroundColor: "#2A111A", borderColor: "#FF7D91" }, input: { backgroundColor: "#0B1425", borderColor: "#1C2B44", borderRadius: 13, borderWidth: 1, color: "#F1F6FF", flex: 1, fontSize: 13, maxHeight: 110, minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, textAlignVertical: "top" }, send: { alignItems: "center", backgroundColor: "#36B7FF", borderRadius: 13, height: 44, justifyContent: "center", width: 44 }, disabled: { opacity: 0.45 }, settingsPage: { backgroundColor: "#050A15", flexGrow: 1, gap: 11, paddingBottom: 24, paddingHorizontal: 16 }, settingsCard: { backgroundColor: "#0B1425", borderColor: "#1C2B44", borderRadius: 15, borderWidth: 1, gap: 9, padding: 13 }, dangerCard: { backgroundColor: "#261017", borderColor: "#FF7D9144", borderRadius: 15, borderWidth: 1, gap: 8, padding: 13 }, sectionTitle: { color: "#F1F6FF", fontSize: 13, fontWeight: "900" }, settingsHint: { color: "#8EA5C7", fontSize: 10, lineHeight: 15 }, settingsInput: { backgroundColor: "#081120", borderColor: "#1C2B44", borderRadius: 10, borderWidth: 1, color: "#F1F6FF", fontSize: 12, minHeight: 42, paddingHorizontal: 10, paddingVertical: 9 }, primary: { alignItems: "center", backgroundColor: "#36B7FF", borderRadius: 10, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 40, paddingHorizontal: 14 }, primaryText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" }, outlineButton: { alignItems: "center", borderColor: "#36B7FF", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 40, paddingHorizontal: 12 }, outlineText: { color: "#8DEBFF", fontSize: 11, fontWeight: "900" }, photoEditor: { alignItems: "center", flexDirection: "row", gap: 10 }, profilePreview: { borderRadius: 27, height: 54, width: 54 }, profilePreviewFallback: { alignItems: "center", backgroundColor: "#081120", borderColor: "#1C2B44", borderRadius: 27, borderWidth: 1, height: 54, justifyContent: "center", width: 54 }, settingsHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, memberCount: { color: "#8EA5C7", fontSize: 10 }, addMemberRow: { flexDirection: "row", gap: 7 }, memberIdInput: { flex: 1 }, addMemberButton: { minWidth: 44, paddingHorizontal: 0 }, memberRow: { alignItems: "center", borderTopColor: "#1C2B44", borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 9, paddingTop: 9 }, memberAvatar: { alignItems: "center", backgroundColor: "#36B7FF22", borderRadius: 16, height: 32, justifyContent: "center", width: 32 }, memberInitial: { color: "#8DEBFF", fontSize: 13, fontWeight: "900" }, memberName: { color: "#F1F6FF", fontSize: 11, fontWeight: "900" }, memberMeta: { color: "#8EA5C7", fontSize: 9, marginTop: 2 }, memberActions: { flexDirection: "row", gap: 7 }, memberAction: { alignItems: "center", backgroundColor: "#081120", borderColor: "#1C2B44", borderRadius: 8, borderWidth: 1, height: 32, justifyContent: "center", width: 32 }, leaveCard: { backgroundColor: "#2A111A", borderColor: "#FF7D9144", borderRadius: 15, borderWidth: 1, gap: 8, padding: 13 }, leaveButton: { alignItems: "center", borderColor: "#FF7D91", borderRadius: 10, borderWidth: 1, justifyContent: "center", minHeight: 39 }, leaveText: { color: "#FF9BAB", fontSize: 11, fontWeight: "900" },
});
