import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { CameraView, type CameraType, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

export type AiraCameraCaptureResult = {
  uri: string;
  kind: "image" | "video";
  mimeType: string;
  label: string;
  sourceFileName: string;
};

type Props = {
  visible: boolean;
  color: string;
  onClose: () => void;
  onCaptured: (capture: AiraCameraCaptureResult) => void;
};

/** Kamera langsung untuk Aira agar aksi Kamera tidak dapat jatuh ke pemilih Galeri. */
export function AiraCameraCapture({ visible, color, onClose, onCaptured }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const discardRecording = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [mode, setMode] = useState<"picture" | "video">("picture");
  const [cameraReady, setCameraReady] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cropWorking, setCropWorking] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    discardRecording.current = false;
    setCameraReady(false);
    setCameraError(null);
    setCapturedPhoto(null);
  }, [visible]);

  const close = () => {
    discardRecording.current = true;
    if (isRecording) cameraRef.current?.stopRecording();
    setCapturedPhoto(null);
    onClose();
  };

  const takePhoto = async () => {
    if (!cameraRef.current || !cameraReady || isWorking) return;
    setIsWorking(true);
    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (!picture?.uri || discardRecording.current) return;
      setCapturedPhoto(picture.uri);
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Foto tidak dapat diambil. Coba buka kamera lagi.");
    } finally {
      setIsWorking(false);
    }
  };

  const cropPhoto = async () => {
    if (!capturedPhoto || cropWorking) return;
    setCropWorking(true);
    try {
      const image = await ImageManipulator.manipulateAsync(capturedPhoto, [], { base64: false });
      const side = Math.min(image.width, image.height);
      const cropped = await ImageManipulator.manipulateAsync(
        capturedPhoto,
        [{ crop: { originX: Math.floor((image.width - side) / 2), originY: Math.floor((image.height - side) / 2), width: side, height: side } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
      );
      setCapturedPhoto(cropped.uri);
    } catch {
      setCameraError("Foto belum dapat dipotong. Silakan coba lagi.");
    } finally {
      setCropWorking(false);
    }
  };

  const confirmPhoto = () => {
    if (!capturedPhoto) return;
    onCaptured({ uri: capturedPhoto, kind: "image", mimeType: "image/jpeg", label: "Foto kamera", sourceFileName: `foto-kamera-${Date.now()}.jpg` });
    setCapturedPhoto(null);
    onClose();
  };

  const toggleRecording = async () => {
    if (!cameraRef.current || !cameraReady || isWorking) return;
    if (isRecording) {
      cameraRef.current.stopRecording();
      return;
    }
    discardRecording.current = false;
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 600 });
      if (!video?.uri || discardRecording.current) return;
      onCaptured({ uri: video.uri, kind: "video", mimeType: "video/mp4", label: "Video kamera", sourceFileName: `video-kamera-${Date.now()}.mp4` });
      onClose();
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Video tidak dapat direkam. Coba lagi.");
    } finally {
      setIsRecording(false);
    }
  };

  const openSettings = () => { void Linking.openSettings().catch(() => setCameraError("Buka Pengaturan perangkat, lalu izinkan akses Kamera untuk V A I R A  A I.")); };

  return <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={close}><View style={styles.page}>{capturedPhoto ? <View style={[styles.photoPreview, { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 16) }]}><View style={styles.previewTop}><Pressable accessibilityRole="button" accessibilityLabel="Batal dan kembali ke kamera" onPress={() => setCapturedPhoto(null)} style={styles.topAction}><MaterialIcons name="arrow-back" size={25} color="#FFFFFF" /></Pressable><Text style={styles.previewTitle}>Pratinjau foto</Text><View style={styles.topActionPlaceholder} /></View><Image source={{ uri: capturedPhoto }} contentFit="contain" style={styles.capturedImage} /><Text style={styles.previewHint}>Pastikan foto sudah sesuai sebelum dikirim ke Room Global.</Text><View style={styles.previewActions}><Pressable accessibilityRole="button" accessibilityLabel="Batal dan ambil ulang foto" onPress={() => setCapturedPhoto(null)} style={styles.previewSecondary}><MaterialIcons name="close" size={18} color="#FFFFFF" /><Text style={styles.previewButtonText}>Batal</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Potong foto" disabled={cropWorking} onPress={() => { void cropPhoto(); }} style={[styles.previewSecondary, cropWorking && styles.disabled]}><MaterialIcons name="crop" size={18} color="#FFFFFF" /><Text style={styles.previewButtonText}>{cropWorking ? "Memotong…" : "Crop"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Kirim foto ke Room Global" onPress={confirmPhoto} style={[styles.previewPrimary, { backgroundColor: color }]}><MaterialIcons name="send" size={19} color="#FFFFFF" /><Text style={styles.previewButtonText}>Kirim</Text></Pressable></View></View> : !permission ? <View style={styles.permission}><ActivityIndicator size="large" color={color} /><Text style={styles.permissionText}>Menyiapkan kamera…</Text></View> : !permission.granted ? <View style={styles.permission}><View style={[styles.permissionIcon, { backgroundColor: `${color}18` }]}><MaterialIcons name="photo-camera" size={35} color={color} /></View><Text style={styles.permissionTitle}>Izinkan kamera</Text><Text style={styles.permissionText}>Aira memerlukan akses kamera untuk mengambil foto atau merekam video baru. Galeri tidak akan dibuka dari aksi ini.</Text><Pressable onPress={() => { void requestPermission(); }} style={[styles.permissionButton, { backgroundColor: color }]}><Text style={styles.primaryText}>Izinkan kamera</Text></Pressable>{!permission.canAskAgain ? <Pressable onPress={openSettings} style={styles.settingsButton}><Text style={[styles.settingsText, { color }]}>Buka Pengaturan perangkat</Text></Pressable> : null}<Pressable onPress={close} style={styles.cancelButton}><Text style={styles.cancelText}>Batal</Text></Pressable></View> : <><CameraView ref={cameraRef} style={styles.camera} facing={facing} mode={mode} onCameraReady={() => setCameraReady(true)} onMountError={(event) => setCameraError(event.message)} /><View style={styles.topBar}><Pressable accessibilityLabel="Tutup kamera" onPress={close} style={styles.topAction}><MaterialIcons name="close" size={26} color="#FFFFFF" /></Pressable><View style={styles.modeChip}><MaterialIcons name={mode === "picture" ? "photo-camera" : "videocam"} size={15} color="#FFFFFF" /><Text style={styles.modeText}>{mode === "picture" ? "Foto" : "Video"}</Text></View></View>{cameraError ? <View style={styles.errorBanner}><MaterialIcons name="error-outline" size={19} color="#FFFFFF" /><Text style={styles.errorText}>{cameraError}</Text></View> : null}<View style={styles.controls}><Pressable accessibilityLabel="Ganti kamera depan atau belakang" disabled={isRecording} onPress={() => setFacing((current) => current === "back" ? "front" : "back")} style={[styles.secondaryAction, isRecording && styles.disabled]}><MaterialIcons name="flip-camera-android" size={25} color="#FFFFFF" /></Pressable><Pressable accessibilityLabel={mode === "picture" ? "Ambil foto" : isRecording ? "Hentikan perekaman video" : "Mulai rekam video"} disabled={!cameraReady || isWorking} onPress={() => { void (mode === "picture" ? takePhoto() : toggleRecording()); }} style={[styles.shutter, { borderColor: mode === "video" ? "#FF4D67" : "#FFFFFF" }, (isWorking || !cameraReady) && styles.disabled]}><View style={[styles.shutterInner, { backgroundColor: mode === "video" ? "#FF4D67" : "#FFFFFF" }, isRecording && styles.recording]}>{isWorking ? <ActivityIndicator color={mode === "video" ? "#FFFFFF" : "#102039"} /> : <MaterialIcons name={mode === "picture" ? "photo-camera" : isRecording ? "stop" : "fiber-manual-record"} size={30} color={mode === "video" ? "#FFFFFF" : "#102039"} />}</View></Pressable><Pressable accessibilityLabel={mode === "picture" ? "Pilih mode video" : "Pilih mode foto"} disabled={isRecording} onPress={() => setMode((current) => current === "picture" ? "video" : "picture")} style={[styles.secondaryAction, isRecording && styles.disabled]}><MaterialIcons name={mode === "picture" ? "videocam" : "photo-camera"} size={25} color="#FFFFFF" /></Pressable></View><Text style={styles.captureHint}>{mode === "picture" ? "Ketuk tombol tengah untuk mengambil foto" : isRecording ? "Perekaman berjalan · ketuk tombol tengah untuk berhenti" : "Ketuk tombol tengah untuk mulai merekam video"}</Text>{Platform.OS === "web" ? <Text style={styles.webHint}>Jika browser memblokir kamera di pratinjau, buka aplikasi dari tautan publik dan izinkan Kamera saat diminta.</Text> : null}</>}</View></Modal>;
}

const styles = StyleSheet.create({ page: { backgroundColor: "#07101D", flex: 1 }, camera: { flex: 1 }, photoPreview: { backgroundColor: "#07101D", flex: 1, justifyContent: "center", paddingHorizontal: 18 }, previewTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }, previewTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" }, topActionPlaceholder: { height: 44, width: 44 }, capturedImage: { alignSelf: "center", height: "54%", width: "100%" }, previewHint: { color: "#CBD5E1", fontSize: 12, lineHeight: 17, marginTop: 16, textAlign: "center" }, previewActions: { flexDirection: "row", flexWrap: "wrap", gap: 9, justifyContent: "center", marginTop: 20 }, previewSecondary: { alignItems: "center", borderColor: "#64748B", borderRadius: 12, borderWidth: 1, flex: 1, flexDirection: "row", gap: 6, justifyContent: "center", minWidth: 88, paddingHorizontal: 9, paddingVertical: 12 }, previewPrimary: { alignItems: "center", borderRadius: 12, flex: 1.25, flexDirection: "row", gap: 6, justifyContent: "center", minWidth: 104, paddingHorizontal: 10, paddingVertical: 12 }, previewButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" }, permission: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 32 }, permissionIcon: { alignItems: "center", borderRadius: 42, height: 84, justifyContent: "center", width: 84 }, permissionTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", marginTop: 22 }, permissionText: { color: "#CBD5E1", fontSize: 14, lineHeight: 21, marginTop: 9, textAlign: "center" }, permissionButton: { borderRadius: 14, marginTop: 24, paddingHorizontal: 20, paddingVertical: 13 }, primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, settingsButton: { marginTop: 17, padding: 8 }, settingsText: { fontSize: 13, fontWeight: "800" }, cancelButton: { marginTop: 12, padding: 8 }, cancelText: { color: "#94A3B8", fontSize: 13, fontWeight: "800" }, topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", left: 0, paddingHorizontal: 18, position: "absolute", right: 0, top: 54 }, topAction: { alignItems: "center", backgroundColor: "rgba(4,12,24,.56)", borderRadius: 22, height: 44, justifyContent: "center", width: 44 }, modeChip: { alignItems: "center", backgroundColor: "rgba(4,12,24,.56)", borderRadius: 14, flexDirection: "row", gap: 6, paddingHorizontal: 12, paddingVertical: 9 }, modeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" }, errorBanner: { alignItems: "center", backgroundColor: "rgba(185,28,28,.92)", borderRadius: 12, bottom: 166, flexDirection: "row", gap: 8, left: 18, padding: 10, position: "absolute", right: 18 }, errorText: { color: "#FFFFFF", flex: 1, fontSize: 11, lineHeight: 15 }, controls: { alignItems: "center", bottom: 64, flexDirection: "row", justifyContent: "space-between", left: 0, paddingHorizontal: 34, position: "absolute", right: 0 }, secondaryAction: { alignItems: "center", backgroundColor: "rgba(4,12,24,.56)", borderRadius: 26, height: 52, justifyContent: "center", width: 52 }, shutter: { alignItems: "center", borderRadius: 38, borderWidth: 4, height: 76, justifyContent: "center", width: 76 }, shutterInner: { alignItems: "center", borderRadius: 29, height: 58, justifyContent: "center", width: 58 }, recording: { borderRadius: 12, height: 30, width: 30 }, disabled: { opacity: .45 }, captureHint: { bottom: 32, color: "#FFFFFF", fontSize: 11, fontWeight: "700", left: 0, position: "absolute", right: 0, textAlign: "center" }, webHint: { bottom: 10, color: "#CBD5E1", fontSize: 10, left: 24, lineHeight: 14, position: "absolute", right: 24, textAlign: "center" } });
