import { MaterialIcons } from "@expo/vector-icons";
import { Image, type ImageProps } from "expo-image";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface RetryableMediaImageProps extends Omit<ImageProps, "source" | "onError" | "onLoad"> {
  uri: string;
  previewLabel?: string;
  onPreview?: (uri: string) => void;
}

export function RetryableMediaImage({ uri, previewLabel = "Pratinjau foto", onPreview, style, cachePolicy = "memory-disk", ...props }: RetryableMediaImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const [localPreviewOpen, setLocalPreviewOpen] = useState(false);

  const retry = () => {
    setFailed(false);
    setAttempt((value) => value + 1);
  };

  const openPreview = () => {
    if (onPreview) onPreview(uri);
    else setLocalPreviewOpen(true);
  };

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={previewLabel} disabled={failed} onPress={openPreview} style={styles.imagePressable}>
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
      {!onPreview ? (
        <Modal visible={localPreviewOpen} transparent animationType="fade" onRequestClose={() => setLocalPreviewOpen(false)}>
          <View style={styles.previewBackdrop}>
            <Pressable accessibilityRole="button" accessibilityLabel="Tutup pratinjau foto" onPress={() => setLocalPreviewOpen(false)} style={styles.previewClose}>
              <MaterialIcons name="close" size={25} color="#FFFFFF" />
            </Pressable>
            <Image {...props} cachePolicy={cachePolicy} source={{ uri }} contentFit="contain" style={styles.previewImage} />
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  imagePressable: { position: "relative" },
  errorOverlay: { alignItems: "center", backgroundColor: "rgba(111, 23, 42, .94)", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0, gap: 5, padding: 10 },
  errorText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800", textAlign: "center" },
  retryButton: { alignItems: "center", backgroundColor: "#8DEBFF", borderRadius: 8, flexDirection: "row", gap: 4, paddingHorizontal: 9, paddingVertical: 6 },
  retryText: { color: "#06101E", fontSize: 10, fontWeight: "900" },
  previewBackdrop: { alignItems: "center", backgroundColor: "rgba(0,0,0,.94)", flex: 1, justifyContent: "center", padding: 18 },
  previewClose: { alignSelf: "flex-end", padding: 8 },
  previewImage: { flex: 1, maxHeight: "88%", width: "100%" },
});
