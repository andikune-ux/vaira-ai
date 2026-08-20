import fs from "node:fs";

const path = "app/global-room-chat.tsx";
let source = fs.readFileSync(path, "utf8");

function replaceOnce(label, from, to) {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected 1 match, got ${count}`);
  source = source.replace(from, to);
}

const toolbarStart = source.indexOf('<View style={styles.headerToolbar}>');
const toolbarEnd = source.indexOf('</View></View>', toolbarStart);
if (toolbarStart < 0 || toolbarEnd < 0) throw new Error("header toolbar block not found");
source = source.slice(0, toolbarStart) + source.slice(toolbarEnd);

replaceOnce(
  "back button",
  '<Pressable accessibilityLabel="Kembali dari Room Global Chat" onPress={() => router.replace((isAdminMode ? "/administrator" : "/global-room") as never)} style={styles.iconButton}><MaterialIcons name="arrow-back" size={18} color={colors.foreground} /></Pressable>',
  '<Pressable accessibilityLabel="Keluar dari Room Global" onPress={confirmLeave} disabled={!active || leaveRoom.isPending || adminLeave.isPending} style={[styles.iconButton, styles.exitIconButton, { borderColor: colors.error }]}><MaterialIcons name="power-settings-new" size={19} color={colors.error} /></Pressable>',
);

replaceOnce(
  "status audio controls",
  '<View style={styles.flex} /><Text style={[styles.detail, { color: colors.muted }]}>{micOn && active ? "Mic aktif" : "Mic mati"}</Text></View>',
  '<View style={styles.flex} /><View style={styles.statusAudioControls}><Pressable accessibilityLabel={micOn ? "Matikan mic Room Global" : "Nyalakan mic Room Global"} disabled={!active || Boolean(moderation?.micMuted)} onPress={() => { void toggleMic(); }} style={[styles.statusAudioButton, { borderColor: micOn ? colors.primary : colors.border }]}><MaterialIcons name={micOn ? "mic" : "mic-off"} size={15} color={micOn ? colors.primary : colors.muted} /></Pressable><Pressable accessibilityLabel={speakerOn ? "Mute speaker Room Global" : "Nyalakan speaker Room Global"} disabled={!active || Boolean(moderation?.roomAudioBlocked)} onPress={() => setSpeakerOn((value) => !value)} style={[styles.statusAudioButton, { borderColor: speakerOn ? colors.primary : colors.border }]}><MaterialIcons name={speakerOn ? "volume-up" : "volume-off"} size={15} color={speakerOn ? colors.primary : colors.muted} /></Pressable></View></View>',
);

replaceOnce(
  "speaker card header",
  '<View style={[styles.speakerStrip, styles.compactSpeakerStrip, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.row}><MaterialIcons name="graphic-eq" size={15} color={colors.primary} /><Text style={[styles.detail, { color: colors.muted }]}>Peserta audio</Text><Text style={[styles.audioCount, { color: colors.muted }]}>{participants.data?.length ?? 0}</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.speakerStripList}>',
  '<View style={styles.audioPresenceRow}><MaterialIcons name="graphic-eq" size={17} color={colors.primary} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.speakerStripList}>',
);

replaceOnce(
  "status pencil position",
  '<Pressable accessibilityLabel="Atur status singkat Room Global" onPress={openStatusEditor} style={styles.statusInline}><MaterialIcons name="short-text" size={14} color={colors.primary} /><Text numberOfLines={1} style={[styles.statusInlineText, { color: colors.muted }]}>{ownStatus.data?.status || "Tambahkan status singkat"}</Text><MaterialIcons name="edit" size={13} color={colors.primary} /></Pressable>',
  '<Pressable accessibilityLabel="Atur status singkat Room Global" onPress={openStatusEditor} style={styles.statusInline}><MaterialIcons name="edit" size={13} color={colors.primary} /><MaterialIcons name="short-text" size={14} color={colors.primary} /><Text numberOfLines={1} style={[styles.statusInlineText, { color: colors.muted }]}>{ownStatus.data?.status || "Tambahkan status singkat"}</Text></Pressable>',
);

replaceOnce(
  "bottom leave button",
  '<Pressable accessibilityLabel="Keluar dari Room Global" onPress={confirmLeave} disabled={!active || leaveRoom.isPending} style={[styles.leaveButton, { borderColor: colors.error }]}><Text style={[styles.leaveText, { color: colors.error }]}>{leaveRoom.isPending ? "Keluar…" : "Keluar room"}</Text></Pressable>',
  '<View style={styles.leaveSpacer} />',
);

replaceOnce(
  "style definitions",
  'page: { flex: 1, gap: 12 }, flex: { flex: 1, minWidth: 0 },',
  'page: { flex: 1, gap: 8 }, flex: { flex: 1, minWidth: 0 },',
);
replaceOnce(
  "icon styles",
  'iconButton: { alignItems: "center", borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, height: 38, justifyContent: "center", width: 38 },',
  'iconButton: { alignItems: "center", borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, height: 38, justifyContent: "center", width: 38 }, exitIconButton: { marginLeft: -2 },',
);
replaceOnce(
  "compact status style",
  'compactStatus: { alignSelf: "flex-start", borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, maxWidth: "100%", paddingHorizontal: 10, paddingVertical: 6 },',
  'compactStatus: { alignSelf: "stretch", borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, maxWidth: "100%", paddingHorizontal: 10, paddingVertical: 6 }, statusAudioControls: { alignItems: "center", flexDirection: "row", gap: 5 }, statusAudioButton: { alignItems: "center", borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, height: 28, justifyContent: "center", width: 28 }, audioPresenceRow: { alignItems: "center", flexDirection: "row", gap: 7, minHeight: 42, paddingVertical: 2 },',
);
replaceOnce(
  "speaker strip style",
  'speakerStrip: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, gap: 3, padding: 7 },',
  'speakerStrip: { gap: 3, padding: 2 }, compactSpeakerStrip: { gap: 3, padding: 2 },',
);
replaceOnce(
  "chat card spacing",
  'chatCard: { borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, flex: 1, minHeight: 420, padding: 10 },',
  'chatCard: { borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, flex: 1, minHeight: 480, padding: 10 },',
);
replaceOnce(
  "leave style",
  'leaveButton: { alignItems: "center", borderRadius: 11, borderWidth: 1, padding: 12 }, leaveText: { fontSize: 12, fontWeight: "900" },',
  'leaveButton: { alignItems: "center", borderRadius: 11, borderWidth: 1, padding: 12 }, leaveText: { fontSize: 12, fontWeight: "900" }, leaveSpacer: { height: 2 },',
);

fs.writeFileSync(path, source);
