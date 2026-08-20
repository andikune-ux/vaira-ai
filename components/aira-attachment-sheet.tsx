import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type RecentMedia = { uri: string; label: string };
type Props = {
  visible: boolean;
  color: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  onClose: () => void;
  onCamera: () => void;
  onLibrary: () => void;
  onAudio: () => void;
  onDocument: () => void;
  onCreate: () => void;
  onGallery: () => void;
  onTemplates: () => void;
  onCancel: () => void;
  onCompare: () => void;
  onQueue: () => void;
  isHotPro: boolean;
  onPerchance: () => void;
  recentMedia?: RecentMedia[];
  onPreviewMedia?: (item: RecentMedia) => void;
};

const actions = [
  { key: "camera", label: "Kamera", detail: "Foto atau video baru", icon: "photo-camera" },
  { key: "library", label: "Galeri perangkat", detail: "Foto atau video perangkat", icon: "perm-media" },
  { key: "audio", label: "Musik", detail: "Pilih file audio", icon: "music-note" },
  { key: "document", label: "Dokumen", detail: "PDF, Excel, Word, PowerPoint", icon: "description" },
] as const;

export function AiraAttachmentSheet({ visible, color, surface, foreground, muted, border, onClose, onCamera, onLibrary, onAudio, onDocument, onCreate, onGallery, onTemplates, onCancel, onCompare, onQueue, isHotPro, onPerchance, recentMedia = [], onPreviewMedia }: Props) {
  const handlers = { camera: onCamera, library: onLibrary, audio: onAudio, document: onDocument };
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View style={styles.backdrop}><View style={[styles.sheet, { backgroundColor: surface, borderColor: border }]}><View style={styles.handle} /><View style={styles.heading}><View><Text style={[styles.title, { color: foreground }]}>Menu Aira</Text><Text style={[styles.subtitle, { color: muted }]}>Lampiran, generasi, dan galeri dalam satu tempat.</Text></View><Pressable accessibilityLabel="Tutup menu Aira" onPress={onClose} style={styles.close}><MaterialIcons name="close" size={22} color={muted} /></Pressable></View><View style={styles.featureRow}><Pressable onPress={onCreate} style={[styles.feature, { backgroundColor: `${color}12`, borderColor: `${color}35` }]}><MaterialIcons name="auto-awesome" size={20} color={color} /><Text style={[styles.featureText, { color: foreground }]}>Buat</Text></Pressable><Pressable onPress={onGallery} style={[styles.feature, { backgroundColor: `${color}12`, borderColor: `${color}35` }]}><MaterialIcons name="collections" size={20} color={color} /><Text style={[styles.featureText, { color: foreground }]}>Galeri Hasil</Text></Pressable><Pressable onPress={onTemplates} style={[styles.feature, { backgroundColor: `${color}12`, borderColor: `${color}35` }]}><MaterialIcons name="auto-fix-high" size={20} color={color} /><Text style={[styles.featureText, { color: foreground }]}>Template</Text></Pressable><Pressable onPress={onCancel} style={[styles.feature, { backgroundColor: `${color}12`, borderColor: `${color}35` }]}><MaterialIcons name="stop-circle" size={20} color={color} /><Text style={[styles.featureText, { color: foreground }]}>Batalkan</Text></Pressable><Pressable onPress={onCompare} style={[styles.feature, { backgroundColor: `${color}12`, borderColor: `${color}35` }]}><MaterialIcons name="compare" size={20} color={color} /><Text style={[styles.featureText, { color: foreground }]}>Bandingkan</Text></Pressable><Pressable onPress={onQueue} style={[styles.feature, { backgroundColor: `${color}12`, borderColor: `${color}35` }]}><MaterialIcons name="delete-sweep" size={20} color={color} /><Text style={[styles.featureText, { color: foreground }]}>Antrean/Hapus</Text></Pressable>{isHotPro ? <Pressable accessibilityLabel="Buka Perchance AI" onPress={onPerchance} style={[styles.feature, { backgroundColor: `${color}12`, borderColor: `${color}35` }]}><MaterialIcons name="open-in-new" size={20} color={color} /><Text style={[styles.featureText, { color: foreground }]}>Perchance AI</Text></Pressable> : null}</View>{recentMedia.length ? <View><Text style={[styles.sectionTitle, { color: foreground }]}>Media terbaru</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaRow}>{recentMedia.map((item) => <Pressable key={`${item.uri}-${item.label}`} onPress={() => onPreviewMedia?.(item)} style={[styles.mediaItem, { borderColor: border }]}><Image source={{ uri: item.uri }} contentFit="cover" style={styles.mediaThumb} /><Text numberOfLines={2} style={[styles.mediaLabel, { color: foreground }]}>{item.label}</Text><MaterialIcons name="image" size={17} color={color} /></Pressable>)}</ScrollView></View> : null}<View style={styles.grid}>{actions.map((action) => <Pressable key={action.key} accessibilityLabel={`Pilih ${action.label}`} onPress={handlers[action.key]} style={({ pressed }) => [styles.action, { backgroundColor: `${color}10`, borderColor: `${color}35` }, pressed && styles.pressed]}><View style={[styles.icon, { backgroundColor: `${color}18` }]}><MaterialIcons name={action.icon} size={24} color={color} /></View><Text style={[styles.actionLabel, { color: foreground }]}>{action.label}</Text><Text style={[styles.actionDetail, { color: muted }]} numberOfLines={2}>{action.detail}</Text></Pressable>)}</View><Text style={[styles.footer, { color: muted }]}>Foto dan video dapat ditinjau sebelum dikirim. Lampiran mendukung ukuran hingga 200 MB.</Text></View></View></Modal>;
}

const styles = StyleSheet.create({ backdrop: { backgroundColor: "rgba(4,12,24,.45)", flex: 1, justifyContent: "flex-end" }, sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: StyleSheet.hairlineWidth, gap: 14, maxHeight: "92%", paddingBottom: 28, paddingHorizontal: 18, paddingTop: 10 }, handle: { alignSelf: "center", backgroundColor: "#9AA5B1", borderRadius: 4, height: 4, opacity: .5, width: 42 }, heading: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" }, title: { fontSize: 18, fontWeight: "800" }, subtitle: { fontSize: 11, lineHeight: 16, marginTop: 2 }, close: { alignItems: "center", borderRadius: 18, height: 36, justifyContent: "center", width: 36 }, featureRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, feature: { alignItems: "center", borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 5, paddingHorizontal: 9, paddingVertical: 8 }, featureText: { fontSize: 10, fontWeight: "800" }, sectionTitle: { fontSize: 12, fontWeight: "900", marginBottom: 7 }, mediaRow: { gap: 8 }, mediaItem: { alignItems: "center", borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 8, minWidth: 150, paddingHorizontal: 7, paddingVertical: 7 }, mediaThumb: { borderRadius: 8, height: 38, width: 38 }, mediaLabel: { flex: 1, fontSize: 10, fontWeight: "700" }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, action: { alignItems: "flex-start", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexBasis: "47%", flexGrow: 1, gap: 4, minHeight: 112, padding: 12 }, icon: { alignItems: "center", borderRadius: 12, height: 42, justifyContent: "center", width: 42 }, actionLabel: { fontSize: 13, fontWeight: "800", marginTop: 3 }, actionDetail: { fontSize: 10, lineHeight: 14 }, footer: { fontSize: 10, lineHeight: 15 }, pressed: { opacity: .68, transform: [{ scale: .98 }] } });
