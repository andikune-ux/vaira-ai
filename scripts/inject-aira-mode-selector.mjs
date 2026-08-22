import fs from "node:fs";

const file = "components/aira-chat-screen.tsx";
const source = fs.readFileSync(file, "utf8");
const needle = '</KeyboardAvoidingView><Modal visible={usesPrivateAiraMode && Boolean(unlocking)} transparent animationType="fade">';
const replacement = '</KeyboardAvoidingView><Pressable accessibilityLabel="Buka pemilih mode Aira" onPress={() => setModeSelectorOpen(true)} style={({ pressed }) => [chatEnhancementStyles.modeSelectorTrigger, { borderColor: colors.primary, backgroundColor: colors.background }, pressed && chatEnhancementStyles.pressed]}><MaterialIcons name="info-outline" color={colors.primary} size={21} /></Pressable><AiraModeSelector visible={modeSelectorOpen} onClose={() => setModeSelectorOpen(false)} onModeSelected={() => { initializedMode.current = null; setInitialized(false); }} /><Modal visible={usesPrivateAiraMode && Boolean(unlocking)} transparent animationType="fade">';

if (!source.includes(needle)) throw new Error("Lokasi pemilih mode Aira tidak ditemukan.");
if (source.includes('accessibilityLabel="Buka pemilih mode Aira"')) throw new Error("Pemilih mode Aira sudah pernah disisipkan.");

fs.writeFileSync(file, source.replace(needle, replacement));
