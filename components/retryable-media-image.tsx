import { MaterialIcons } from "@expo/vector-icons";
import { Image, type ImageProps } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface RetryableMediaImageProps extends Omit<ImageProps, "source" | "onError" | "onLoad"> {
  uri: string;
  previewLabel?: string;
  onPreview?: (uri: string) => void;
}

export function RetryableMediaImage({ uri, previewLabel = "Pratinjau foto", onPreview, style, cachePolicy = "memory-disk", ...props }: RetryableMediaImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const retry = () => {
    setFailed(false);
    setAttempt((value) => value + 1);
  };

  return (
    <Pressable accessibilityRole={onPreview ? "button" : undefined} accessibilityLabel={previewLabel} disabled={failed || !onPreview} onPress={() => onPreview?.(uri)} style={styles.imagePressable}>
      <Image
        {...props}
        cachePolicy={cachePolicy}
        key={`${uri}-${attempt}`}
        source={{ uri }}
        style={style}
        onLoad={() => setFailed(false)}
        onError={() => setFailed(true)}
      />
      {failed ? (
        <View style={styles.errorOverlay}>
          <MaterialIcons name="broken-image" size={22} color="#FFFFFF" />
          <Text style={styles.errorText}>Gagal memuat</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Coba lagi memuat foto" onPress={retry} style={styles.retryButton}>
            <MaterialIcons name="refresh" size={15} color="#06101E" />
            <Text style={styles.retryText}>Coba lagi</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imagePressable: { position: "relative" },
  errorOverlay: { alignItems: "center", backgroundColor: "rgba(111, 23, 42, .94)", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0, gap: 5, padding: 10 },
  errorText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800", textAlign: "center" },
  retryButton: { alignItems: "center", backgroundColor: "#8DEBFF", borderRadius: 8, flexDirection: "row", gap: 4, paddingHorizontal: 9, paddingVertical: 6 },
  retryText: { color: "#06101E", fontSize: 10, fontWeight: "900" },
});
