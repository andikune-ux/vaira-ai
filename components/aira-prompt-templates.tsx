import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAiraModeColors } from "@/lib/aira-mode-context";
import { requestAiraGenerationPanelCommand, subscribeAiraGenerationPanelCommands } from "@/lib/aira-chat-navigation";

const templates = [
  { label: "Poster", kind: "image" as const, icon: "campaign" as const, prompt: "Buat poster promosi modern dengan komposisi rapi, warna sesuai tema, ruang aman untuk judul, dan tanpa teks kecil yang sulit dibaca." },
  { label: "Gambar profil", kind: "image" as const, icon: "portrait" as const, prompt: "Buat gambar profil profesional dengan pencahayaan lembut, latar bersih, komposisi wajah di tengah, dan gaya modern." },
  { label: "Surat", kind: "word" as const, icon: "description" as const, prompt: "Buat surat formal bahasa Indonesia dengan struktur lengkap, salam pembuka, isi yang jelas, dan penutup profesional." },
  { label: "Presentasi", kind: "powerpoint" as const, icon: "slideshow" as const, prompt: "Buat presentasi profesional berbahasa Indonesia dengan alur masalah, solusi, data penting, dan kesimpulan yang mudah dipahami." },
  { label: "Anggaran", kind: "excel" as const, icon: "table-chart" as const, prompt: "Buat spreadsheet anggaran bulanan dengan kategori pemasukan, pengeluaran, total, sisa anggaran, dan ringkasan yang mudah dibaca." },
  { label: "Laporan", kind: "pdf" as const, icon: "picture-as-pdf" as const, prompt: "Buat laporan ringkas dan profesional berbahasa Indonesia dengan judul, ringkasan, poin pembahasan, tabel bila diperlukan, dan kesimpulan." },
];

export function AiraPromptTemplates() {
  const colors = useAiraModeColors(); const [open, setOpen] = useState(false); useEffect(() => subscribeAiraGenerationPanelCommands((command) => { if (command.type === "open-templates") setOpen(true); }), []);
  const apply = (template: (typeof templates)[number]) => { requestAiraGenerationPanelCommand({ type: "regenerate", kind: template.kind, prompt: template.prompt }); setOpen(false); };
  return <><Pressable accessibilityLabel="Buka template prompt Aira" onPress={() => setOpen(true)} style={[styles.trigger, { backgroundColor: colors.background, borderColor: colors.border, display: "none" }]}><MaterialIcons name="auto-fix-high" size={18} color={colors.primary} /></Pressable><Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}><View style={styles.backdrop}><Pressable style={styles.scrim} onPress={() => setOpen(false)} /><View style={[styles.sheet, { backgroundColor: colors.background }]}><View style={styles.handle} /><Text style={[styles.title, { color: colors.foreground }]}>Template prompt Aira</Text><Text style={[styles.detail, { color: colors.muted }]}>Pilih template, lalu sesuaikan instruksinya sebelum membuat hasil.</Text><ScrollView contentContainerStyle={styles.grid}>{templates.map((template) => <Pressable key={template.label} onPress={() => apply(template)} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.icon, { backgroundColor: `${colors.primary}14` }]}><MaterialIcons name={template.icon} size={22} color={colors.primary} /></View><Text style={[styles.label, { color: colors.foreground }]}>{template.label}</Text><Text style={[styles.use, { color: colors.primary }]}>Gunakan template</Text></Pressable>)}</ScrollView></View></View></Modal></>;
}

const styles = StyleSheet.create({ trigger: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, bottom: 126, elevation: 5, height: 39, justifyContent: "center", position: "absolute", right: 16, width: 39, zIndex: 30 }, backdrop: { backgroundColor: "rgba(4,12,24,.45)", flex: 1, justifyContent: "flex-end" }, scrim: { flex: 1 }, sheet: { borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: "73%", padding: 18 }, handle: { alignSelf: "center", backgroundColor: "#94A3B8", borderRadius: 3, height: 4, marginBottom: 12, opacity: .6, width: 42 }, title: { fontSize: 18, fontWeight: "900" }, detail: { fontSize: 12, lineHeight: 17, marginTop: 4 }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 9, paddingTop: 15 }, card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, minWidth: "46%", padding: 12, width: "48%" }, icon: { alignItems: "center", borderRadius: 12, height: 35, justifyContent: "center", width: 35 }, label: { fontSize: 12, fontWeight: "900", marginTop: 10 }, use: { fontSize: 10, fontWeight: "800", marginTop: 3 } });
