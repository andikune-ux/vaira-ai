import { MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from "expo-audio";
import { useEffect } from "react";
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

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
    return () => { player.pause(); player.remove(); };
  }, [player]);

  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) player.seekTo(0);
      player.play();
    }
  };
  const progress = status.duration > 0 ? Math.min(1, Math.max(0, status.currentTime / status.duration)) : 0;
  const label = status.isBuffering ? "Memuat voice note…" : status.playing ? "Jeda voice note" : "Putar voice note";

  return (
    <View style={styles.wrapper}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={toggle} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialIcons name={status.playing ? "pause-circle" : "play-circle"} size={22 * scale} color={colors.primary} />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.foreground, fontSize: 13 * scale }]}>Voice note · {durationLabel}</Text>
          <View style={[styles.track, { backgroundColor: colors.border }]}><View style={[styles.fill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} /></View>
          <Text style={[styles.status, { color: status.isBuffering ? colors.primary : status.playing ? colors.primary : colors.muted }]}>{status.isBuffering ? "Memuat audio…" : status.playing ? "Sedang diputar" : "Ketuk untuk memutar"}</Text>
        </View>
      </Pressable>
      {transcript ? <Text numberOfLines={2} style={[styles.transcript, { color: colors.muted, fontSize: 12 * scale }]}>{transcript}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 5 },
  row: { alignItems: "center", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 8, minWidth: 190, paddingHorizontal: 8, paddingVertical: 7 },
  copy: { flex: 1, gap: 3 },
  title: { fontWeight: "800" },
  track: { borderRadius: 2, height: 3, overflow: "hidden", width: "100%" },
  fill: { height: 3 },
  status: { fontSize: 10, fontWeight: "700" },
  transcript: { lineHeight: 17, marginLeft: 4 },
});
