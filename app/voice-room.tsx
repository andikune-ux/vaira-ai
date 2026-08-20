import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { useAppToast } from "@/components/app-toast";
import { ScreenContainer } from "@/components/screen-container";
import { useFinance } from "@/lib/finance/finance-context";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

const toDataUrl = async (uri: string, mime: string) => `data:${mime};base64,${await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })}`;
const VOICE_PRESET = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };
const SPEECH_THRESHOLD = -45;
const SILENCE_DELAY_MS = 1250;

type Line = { role: "Aira" | "Anda"; text: string };
type VoicePath = "handsfree" | "fallback";

export default function VoiceRoomScreen() {
  const { state } = useFinance();
  const { showToast } = useAppToast();
  const [lines, setLines] = useState<Line[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [handsFree, setHandsFree] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [voicePath, setVoicePath] = useState<VoicePath>("handsfree");
  const [status, setStatus] = useState<"ready" | "listening" | "thinking" | "speaking">("ready");
  const greeted = useRef(false);
  const handsFreeRef = useRef(true);
  const armedRef = useRef(false);
  const spokenRef = useRef(false);
  const lastVoiceAt = useRef(0);
  const processingRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beginRecordingRef = useRef<() => Promise<void>>(async () => undefined);
  const finishRecordingRef = useRef<() => Promise<void>>(async () => undefined);
  const recorder = useAudioRecorder(VOICE_PRESET);
  const recording = useAudioRecorderState(recorder, 250);
  const ai = trpc.ai.chat.useMutation();
  const transcribe = trpc.voice.transcribe.useMutation();
  const voiceLanguage = state.profile.preferredLanguage === "id" ? "id-ID" : state.profile.preferredLanguage;
  const scopedInstruction = useMemo(() => [state.profile.personalInstruction, ...state.profile.instructionItems.filter((item) => item.enabled && (!item.modeScopes?.length || item.modeScopes.includes(state.profile.aiMode))).map((item) => item.content), "Gunakan gaya percakapan lisan yang hangat, alami, singkat, dan tidak kaku."].filter(Boolean).join("\n\n"), [state.profile.aiMode, state.profile.instructionItems, state.profile.personalInstruction]);
  const scopedKnowledge = useMemo(() => state.knowledgeItems.filter((item) => item.enabled && (!item.modeScopes?.length || item.modeScopes.includes(state.profile.aiMode))).map((item) => `${item.title}: ${item.content}`).join("\n"), [state.knowledgeItems, state.profile.aiMode]);

  const clearSilenceTimer = () => { if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; };
  useEffect(() => { handsFreeRef.current = handsFree; }, [handsFree]);
  useEffect(() => () => { clearSilenceTimer(); armedRef.current = false; void Speech.stop(); }, []);

  const say = useCallback((text: string) => {
    Speech.stop();
    setSpeaking(true);
    setStatus("speaking");
    Speech.speak(text, {
      language: voiceLanguage,
      rate: 0.96,
      pitch: state.profile.voice === "female" ? 1.06 : 0.92,
      onDone: () => { setSpeaking(false); setStatus("ready"); if (handsFreeRef.current && armedRef.current) setTimeout(() => { void beginRecordingRef.current(); }, 500); },
      onStopped: () => { setSpeaking(false); setStatus("ready"); },
      onError: () => { setSpeaking(false); setStatus("ready"); },
    });
  }, [state.profile.voice, voiceLanguage]);

  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    const hello = "Halo, saya Aira. Tekan mulai obrolan sekali. Saya akan mendengarkan ketika Anda berbicara dan menjawab setelah Anda berhenti.";
    setLines([{ role: "Aira", text: hello }]);
    say(hello);
  }, [say]);

  const finishRecording = useCallback(async () => {
    if (!recording.isRecording || processingRef.current) return;
    clearSilenceTimer();
    processingRef.current = true;
    setStatus("thinking");
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error("Rekaman belum tersedia.");
      const mime = Platform.OS === "web" ? "audio/webm" : "audio/mp4";
      const heard = await transcribe.mutateAsync({ audioDataUrl: await toDataUrl(uri, mime), language: state.profile.preferredLanguage });
      if (heard.error) throw new Error(heard.error);
      const userText = heard.text.trim();
      if (!userText) { setStatus("ready"); if (handsFreeRef.current && armedRef.current) setTimeout(() => { void beginRecordingRef.current(); }, 350); return; }
      const nextLines = [...lines, { role: "Anda" as const, text: userText }];
      setLines(nextLines);
      const response = await ai.mutateAsync({ messages: nextLines.map((line) => ({ role: line.role === "Aira" ? "assistant" as const : "user" as const, content: line.text })), language: state.profile.preferredLanguage, personalInstruction: scopedInstruction, aiMode: state.profile.aiMode, aiPersona: state.profile.aiPersona, knowledgeContext: scopedKnowledge });
      setLines((previous) => [...previous, { role: "Aira", text: response.reply }]);
      say(response.reply);
    } catch (error) {
      setVoicePath("fallback");
      setStatus("ready");
      const notice = "Jalur real-time sedang terganggu. Aira tetap siap menggunakan mode dengar cadangan.";
      setLines((previous) => [...previous, { role: "Aira", text: notice }]);
      showToast(error instanceof Error ? `${notice} ${error.message}` : notice, "info");
      if (handsFreeRef.current && armedRef.current) setTimeout(() => { void beginRecordingRef.current(); }, 650);
    } finally { processingRef.current = false; }
  }, [ai, lines, recorder, recording.isRecording, say, scopedInstruction, scopedKnowledge, showToast, state.profile, transcribe]);
  finishRecordingRef.current = finishRecording;

  const beginRecording = useCallback(async () => {
    if (recording.isRecording || ai.isPending || transcribe.isPending || speaking) return;
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) throw new Error("Izin mikrofon diperlukan untuk room suara.");
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    spokenRef.current = false;
    lastVoiceAt.current = Date.now();
    await recorder.prepareToRecordAsync();
    recorder.record();
    setSessionStarted(true);
    armedRef.current = true;
    setStatus("listening");
  }, [ai.isPending, recorder, recording.isRecording, speaking, transcribe.isPending]);
  beginRecordingRef.current = beginRecording;

  useEffect(() => {
    if (!recording.isRecording || !handsFree || speaking || processingRef.current) return;
    const meter = recording.metering;
    if (meter === undefined) {
      setVoicePath("fallback");
      if (!silenceTimerRef.current) silenceTimerRef.current = setTimeout(() => { void finishRecordingRef.current(); }, 6000);
      return;
    }
    setVoicePath("handsfree");
    if (meter > SPEECH_THRESHOLD) {
      spokenRef.current = true;
      lastVoiceAt.current = Date.now();
      clearSilenceTimer();
      return;
    }
    if (spokenRef.current && Date.now() - lastVoiceAt.current >= SILENCE_DELAY_MS && !silenceTimerRef.current) {
      silenceTimerRef.current = setTimeout(() => { void finishRecordingRef.current(); }, 120);
    }
  }, [handsFree, recording.isRecording, recording.metering, speaking]);

  const startConversation = async () => { try { setHandsFree(true); await beginRecording(); } catch (error) { Alert.alert("Mikrofon room", getUserFacingError(error, "Mikrofon belum siap.")); } };
  const stopConversation = async () => { armedRef.current = false; setHandsFree(false); clearSilenceTimer(); await Speech.stop(); if (recording.isRecording) await recorder.stop(); setSessionStarted(false); setStatus("ready"); showToast("Room obrolan dihentikan.", "info"); };
  const toggleMic = async () => { try { if (recording.isRecording) await finishRecording(); else await beginRecording(); } catch (error) { Alert.alert("Mikrofon room", getUserFacingError(error, "Mikrofon belum siap.")); } };
  const toggleCamera = async () => { if (cameraOn) { setCameraOn(false); showToast("Kamera dimatikan.", "info"); return; } const permission = await ImagePicker.requestCameraPermissionsAsync(); if (!permission.granted) { Alert.alert("Izin kamera diperlukan", "Izinkan kamera untuk menyalakan video Anda."); return; } setCameraOn(true); showToast("Kamera dinyalakan.", "info"); };
  const toggleScreen = () => { setScreenSharing((value) => !value); showToast(screenSharing ? "Berbagi layar dihentikan." : "Mode berbagi layar diaktifkan.", "info"); };
  const toggleSpeaker = async () => { const next = !speakerOn; setSpeakerOn(next); try { await setAudioModeAsync({ playsInSilentMode: true, ...(Platform.OS !== "web" ? { shouldRouteThroughEarpiece: !next } : {}) } as never); } catch { /* routing speaker differs by device */ } showToast(next ? "Loud speaker aktif." : "Earpiece aktif.", "info"); };
  const activeWave = recording.isRecording ? "user" : speaking ? "aira" : "idle";
  const statusCopy = status === "listening" ? "Aira diam dan mendengarkan…" : status === "thinking" ? "Aira menganalisis ucapan Anda…" : status === "speaking" ? "Aira sedang berbicara…" : sessionStarted ? "Menunggu giliran bicara berikutnya" : "Aira siap menyapa Anda";

  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><View style={styles.room}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><MaterialIcons name="arrow-back" color="#F1F6FF" size={21} /></Pressable><View style={styles.headerCopy}><Text style={styles.title}>Room obrolan Aira</Text><Text style={styles.subtitle}>{statusCopy}</Text></View><View style={styles.online}><View style={[styles.dot, voicePath === "fallback" && styles.fallbackDot]} /><Text style={styles.onlineText}>{voicePath === "handsfree" ? "HANDS-FREE" : "CADANGAN"}</Text></View></View>
    <View style={styles.modeRow}><View><Text style={styles.modeText}>Percakapan otomatis bergantian</Text><Text style={styles.modeHint}>{voicePath === "handsfree" ? "Jalur lokal: deteksi suara langsung · WebRTC belum aktif" : "Jalur cadangan: kirim setelah jeda aman"}</Text></View><Switch value={handsFree} onValueChange={(value) => { setHandsFree(value); if (!value && recording.isRecording) void finishRecording(); }} trackColor={{ false: "#283750", true: "#36B7FF" }} thumbColor="#FFFFFF" /></View>
    <View style={styles.waveArea}><View style={styles.waveLabel}><MaterialIcons name={activeWave === "user" ? "hearing" : activeWave === "aira" ? "graphic-eq" : "record-voice-over"} color={activeWave === "user" ? "#DFF7FF" : activeWave === "aira" ? "#FFB8F5" : "#8DBBFF"} size={22} /><Text style={styles.waveText}>{activeWave === "user" ? "AIRA MENDENGARKAN" : activeWave === "aira" ? "AIRA BERBICARA" : "SIAP MEMULAI"}</Text></View><GradientWave active={activeWave} metering={recording.metering} /><View style={[styles.core, { borderColor: activeWave === "user" ? "#E9FBFF" : activeWave === "aira" ? "#E5ADFF" : "#5C91FF" }]}><MaterialIcons name={recording.isRecording ? "hearing" : speaking ? "graphic-eq" : "smart-toy"} size={44} color="#FFFFFF" /></View></View>
    <ScrollView contentContainerStyle={styles.transcript}>{lines.map((line, index) => <View key={`${line.role}-${index}`} style={[styles.line, line.role === "Anda" ? styles.userLine : styles.airaLine]}><Text style={[styles.role, { color: line.role === "Anda" ? "#8DEBFF" : "#FFAEEB" }]}>{line.role}</Text><Text style={styles.lineText}>{line.text}</Text></View>)}</ScrollView>
    <View style={styles.statusStrip}><Text style={styles.statusText}>{cameraOn ? "Kamera aktif" : "Kamera mati"} · {screenSharing ? "Berbagi layar aktif" : "Layar privat"} · {speakerOn ? "Loud speaker" : "Earpiece"} · Relay TURN belum tersedia</Text></View>
    <View style={styles.controls}><Control icon={cameraOn ? "videocam" : "videocam-off"} label={cameraOn ? "Kamera" : "Kamera off"} active={cameraOn} onPress={() => { void toggleCamera(); }} /><Control icon={recording.isRecording ? "mic" : "mic-off"} label={recording.isRecording ? "Mendengar" : "Mic"} active={recording.isRecording} onPress={() => { void toggleMic(); }} /><Control icon={screenSharing ? "stop-screen-share" : "screen-share"} label={screenSharing ? "Stop layar" : "Bagikan layar"} active={screenSharing} onPress={toggleScreen} /><Control icon={speakerOn ? "volume-up" : "hearing"} label={speakerOn ? "Speaker" : "Earpiece"} active={speakerOn} onPress={() => { void toggleSpeaker(); }} /></View>
    <Pressable disabled={ai.isPending || transcribe.isPending} onPress={() => { if (sessionStarted) void stopConversation(); else void startConversation(); }} style={({ pressed }) => [styles.mainButton, sessionStarted ? styles.stopButton : styles.startButton, pressed && styles.pressed]}><MaterialIcons name={sessionStarted ? "stop" : "mic"} size={28} color="#FFFFFF" /><Text style={styles.mainButtonText}>{sessionStarted ? "Hentikan obrolan" : "Mulai obrolan otomatis"}</Text></Pressable>
  </View></ScreenContainer>;
}

function Control({ icon, label, active, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.control, active && styles.controlActive, pressed && styles.pressed]}><MaterialIcons name={icon} size={21} color={active ? "#E9FBFF" : "#8EA5C7"} /><Text style={[styles.controlText, active && styles.controlTextActive]}>{label}</Text></Pressable>; }

function GradientWave({ active, metering }: { active: "user" | "aira" | "idle"; metering?: number }) { const pulse = useRef(new Animated.Value(0.25)).current; useEffect(() => { if (active !== "aira") { pulse.setValue(active === "idle" ? 0.12 : 0.35); return undefined; } const loop = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 0.92, duration: 420, useNativeDriver: false }), Animated.timing(pulse, { toValue: 0.22, duration: 520, useNativeDriver: false })])); loop.start(); return () => { loop.stop(); }; }, [active, pulse]); const level = active === "user" && metering !== undefined ? Math.max(0.08, Math.min(1, (metering + 60) / 60)) : active === "aira" ? Number(pulse) : 0.12; const center = 48; const points = Array.from({ length: 17 }, (_, index) => { const x = 10 + index * 18.75; const envelope = Math.sin((index / 16) * Math.PI); const variation = 0.55 + 0.45 * Math.sin(index * 1.7 + 0.8); return { x, y: center - envelope * level * variation * 34 }; }); const upper = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" "); const lower = [...points].reverse().map((point) => `L ${point.x} ${center + (center - point.y)}`).join(" "); const d = `${upper} ${lower} Z`; return <View style={styles.waveform}><Svg width="320" height="96" viewBox="0 0 320 96"><Defs><LinearGradient id="airaWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%"><Stop offset="0%" stopColor="#35D6FF" /><Stop offset="45%" stopColor="#A78BFA" /><Stop offset="75%" stopColor="#F0A6FF" /><Stop offset="100%" stopColor="#FFD39A" /></LinearGradient></Defs><Path d={d} fill="url(#airaWaveGradient)" opacity={active === "idle" ? 0.35 : 0.9} /><Path d={upper} fill="none" stroke="url(#airaWaveGradient)" strokeWidth="3" strokeLinecap="round" opacity={active === "idle" ? 0.65 : 1} /><Path d={upper} fill="none" stroke="url(#airaWaveGradient)" strokeWidth="10" strokeLinecap="round" opacity={0.16} /></Svg></View>; }

const styles = StyleSheet.create({ room: { backgroundColor: "#050A15", flex: 1, gap: 10, paddingHorizontal: 3 }, header: { alignItems: "center", flexDirection: "row", gap: 11, paddingBottom: 5, paddingTop: 2 }, back: { alignItems: "center", borderColor: "#24324B", borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, height: 42, justifyContent: "center", width: 42 }, headerCopy: { flex: 1 }, title: { color: "#F1F6FF", fontSize: 19, fontWeight: "800" }, subtitle: { color: "#8EA5C7", fontSize: 11, marginTop: 2 }, online: { alignItems: "center", flexDirection: "row", gap: 5 }, dot: { backgroundColor: "#46E0AF", borderRadius: 5, height: 8, width: 8 }, fallbackDot: { backgroundColor: "#F5B83D" }, onlineText: { color: "#75E4C0", fontSize: 9, fontWeight: "900" }, modeRow: { alignItems: "center", backgroundColor: "#0B1425", borderColor: "#1C2B44", borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 13, paddingVertical: 7 }, modeText: { color: "#C9D9F2", fontSize: 12, fontWeight: "700" }, modeHint: { color: "#7792B9", fontSize: 9, marginTop: 2 }, waveArea: { alignItems: "center", backgroundColor: "#091326", borderColor: "#1E3A63", borderRadius: 26, borderWidth: 1, justifyContent: "center", minHeight: 235, overflow: "hidden", padding: 18 }, waveLabel: { alignItems: "center", flexDirection: "row", gap: 7, marginBottom: 10 }, waveText: { color: "#A7C4EB", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, waveform: { alignItems: "center", height: 112, justifyContent: "center", width: "100%" }, core: { alignItems: "center", borderRadius: 52, borderWidth: 2, height: 94, justifyContent: "center", marginTop: -98, shadowColor: "#52B7FF", shadowOpacity: 0.5, shadowRadius: 20, width: 94 }, transcript: { gap: 8, paddingBottom: 3 }, line: { borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, maxWidth: "88%", padding: 10 }, userLine: { alignSelf: "flex-end", backgroundColor: "#102D45", borderColor: "#2A83A5" }, airaLine: { alignSelf: "flex-start", backgroundColor: "#111B31", borderColor: "#293B5B" }, role: { fontSize: 9, fontWeight: "900", marginBottom: 3 }, lineText: { color: "#E7F0FF", fontSize: 12, lineHeight: 18 }, statusStrip: { alignItems: "center", backgroundColor: "#0B1425", borderRadius: 11, padding: 7 }, statusText: { color: "#7792B9", fontSize: 10 }, controls: { flexDirection: "row", gap: 6, justifyContent: "space-between" }, control: { alignItems: "center", backgroundColor: "#0C172A", borderColor: "#243652", borderRadius: 14, borderWidth: 1, flex: 1, gap: 4, justifyContent: "center", minHeight: 55, paddingHorizontal: 3 }, controlActive: { backgroundColor: "#123451", borderColor: "#32BDE9" }, controlText: { color: "#8EA5C7", fontSize: 9, fontWeight: "700", textAlign: "center" }, controlTextActive: { color: "#DDF8FF" }, mainButton: { alignItems: "center", borderRadius: 17, flexDirection: "row", gap: 9, justifyContent: "center", marginBottom: 2, padding: 14 }, startButton: { backgroundColor: "#1677D2" }, stopButton: { backgroundColor: "#B8335C" }, mainButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] } });
