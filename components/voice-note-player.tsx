import { MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from "expo-audio";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface VoiceNotePlayerProps {
  uri: string;
  durationLabel: string;
  transcript?: string;
  scale?: number;
  colors: { primary: string; foreground: string; muted: string; surface: string; border: string; error: string };
}

export function VoiceNotePlayer({ uri, durationLabel, transcript, scale = 1, colors }: VoiceNotePlayerProps) {
  const player = useAudioPlayer(uri, { updateInterval: 250, downloadFirst: true });
  const status = useAudioPlayerStatus(player);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
    return () => { player.pause(); player.remove(); };
  }, [player]);

  const toggle = () => {
    try {
      setLoadError(false);
      if (status.playing) player.pause();
      else {
        if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) player.seekTo(0);
        player.play();
      }
    } catch {
      setLoadError(true);
    }
  };
  const retry = () => {
    setLoadError(false);
    try { player.replace(uri); } catch { setLoadError(true); }
  };
  const progress = status.duration > 0 ? Math.min(1, Math.max(0, status.currentTime / status.duration)) : 0;
  const actualDuration = status.duration > 0 ? formatDuration(status.duration) : durationLabel;
  const label = loadError ? "Voice note gagal dimuat" : status.isBuffering || !status.isLoaded ? "Memuat voice note…" : status.playing ? "Jeda voice note" : "Putar voice note";

  return (
    <View style={styles.wrapper}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={toggle} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialIcons name={loadError ? "error-outline" : status.playing ? "pause-circle" : "play-circle"} size={22 * scale} color={loadError ? colors.error : colors.primary} />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.foreground, fontSize: 13 * scale }]}>Voice note · {actualDuration}</Text>
          <View style={[styles.track, { backgroundColor: colors.border }]}><View style={[styles.fill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} /></View>
          <Text style={[styles.status, { color: loadError ? colors.error : status.isBuffering || !status.isLoaded ? colors.primary : status.playing ? colors.primary : colors.muted }]}>{loadError ? "Gagal memuat audio" : status.isBuffering || !status.isLoaded ? "Memuat audio…" : status.playing ? "Sedang diputar" : "Ketuk untuk memutar"}</Text>
          {loadError ? <Pressable accessibilityRole="button" accessibilityLabel="Coba lagi memuat voice note" onPress={retry} style={[styles.retryButton, { borderColor: colors.error }]}><MaterialIcons name="refresh" size={14} color={colors.error} /><Text style={[styles.retryText, { color: colors.error }]}>Coba lagi</Text></Pressable> : null}
        </View>
      </Pressable>
      {transcript ? <Text numberOfLines={2} style={[styles.transcript, { color: colors.muted, fontSize: 12 * scale }]}>{transcript}</Text> : null}
    </View>
  );
}

function formatDuration(seconds: number) { const rounded = Math.max(0, Math.round(seconds)); const minutes = Math.floor(rounded / 60); const remainder = rounded % 60; return `${minutes}:${String(remainder).padStart(2, "0")}`; }

const styles = StyleSheet.create({
  wrapper: { gap: 5 },
  row: { alignItems: "center", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 8, minWidth: 190, paddingHorizontal: 8, paddingVertical: 7 },
  copy: { flex: 1, gap: 3 },
  title: { fontWeight: "800" },
  track: { borderRadius: 2, height: 3, overflow: "hidden", width: "100%" },
  fill: { height: 3 },
  status: { fontSize: 10, fontWeight: "700" },
  retryButton: { alignItems: "center", borderRadius: 7, borderWidth: 1, flexDirection: "row", gap: 3, paddingHorizontal: 7, paddingVertical: 4, alignSelf: "flex-start" },
  retryText: { fontSize: 10, fontWeight: "900" },
  transcript: { lineHeight: 17, marginLeft: 4 },
});
