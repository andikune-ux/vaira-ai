import { MaterialIcons } from "@expo/vector-icons";
import { Image, type ImageProps } from "expo-image";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface RetryableMediaImageProps extends Omit<ImageProps, "source" | "onError" | "onLoad"> {
  uri: string;
  previewLabel?: string;
}

export function RetryableMediaImage({ uri, previewLabel = "Pratinjau foto", style, ...props }: RetryableMediaImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const retry = () => {
    setFailed(false);
    setAttempt((value) => value + 1);
  };

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={previewLabel} disabled={failed} onPress={() => setPreviewOpen(true)} style={styles.imagePressable}>
        <Image
          {...props}
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
      <Modal visible={previewOpen} animationType="fade" transparent onRequestClose={() => setPreviewOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable accessibilityLabel="Tutup pratinjau foto" onPress={() => setPreviewOpen(false)} style={styles.closeButton}><MaterialIcons name="close" size={24} color="#FFFFFF" /></Pressable>
          <Image {...props} key={`preview-${uri}-${attempt}`} source={{ uri }} contentFit="contain" style={styles.previewImage} onError={() => setFailed(true)} />
          {failed ? <View style={styles.previewError}><Text style={styles.errorText}>Gagal memuat pratinjau</Text><Pressable accessibilityRole="button" accessibilityLabel="Coba lagi memuat pratinjau" onPress={retry} style={styles.retryButton}><MaterialIcons name="refresh" size={15} color="#06101E" /><Text style={styles.retryText}>Coba lagi</Text></Pressable></View> : null}
          <Text style={styles.previewHint}>Ketuk di luar gambar untuk menutup</Text>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  imagePressable: { position: "relative" },
  errorOverlay: { alignItems: "center", backgroundColor: "rgba(111, 23, 42, .94)", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0, gap: 5, padding: 10 },
  errorText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800", textAlign: "center" },
  retryButton: { alignItems: "center", backgroundColor: "#8DEBFF", borderRadius: 8, flexDirection: "row", gap: 4, paddingHorizontal: 9, paddingVertical: 6 },
  retryText: { color: "#06101E", fontSize: 10, fontWeight: "900" },
  modalBackdrop: { alignItems: "center", backgroundColor: "rgba(0,0,0,.94)", flex: 1, justifyContent: "center", padding: 16 },
  closeButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,.14)", borderRadius: 20, height: 40, justifyContent: "center", position: "absolute", right: 18, top: 42, width: 40, zIndex: 2 },
  previewImage: { height: "82%", width: "100%" },
  previewError: { alignItems: "center", gap: 8, position: "absolute" },
  previewHint: { bottom: 28, color: "#BFC9D8", fontSize: 11, position: "absolute" },
});
