import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const chat = fs.readFileSync(path.resolve(__dirname, "../components/aira-chat-screen.tsx"), "utf8");
const studio = fs.readFileSync(path.resolve(__dirname, "../app/developer-studio.tsx"), "utf8");
const keyboard = fs.readFileSync(path.resolve(__dirname, "../components/chat-keyboard-avoiding.tsx"), "utf8");
const presentation = fs.readFileSync(path.resolve(__dirname, "../lib/aira-mode-presentation.ts"), "utf8");

describe("komposer dan respons Aira", () => {
  it("menampilkan tombol lampiran ringkas yang membuka kamera, galeri, musik, dan dokumen", () => {
    const sheet = fs.readFileSync(path.resolve(__dirname, "../components/aira-attachment-sheet.tsx"), "utf8");
    expect(chat).toContain("AiraAttachmentSheet");
    expect(chat).toContain("Buka pilihan lampiran");
    expect(sheet).toContain("Kamera");
    expect(sheet).toContain("Galeri");
    expect(sheet).toContain("Musik");
    expect(sheet).toContain("Dokumen");
    expect(chat).toContain("chooseAudio");
    expect(chat).toContain("hingga 200 MB");
  });

  it("menempatkan mikrofon dekat tombol kirim dan menunjukkan gelombang perekaman", () => {
    expect(chat).toContain("Rekam pesan suara");
    expect(chat).toContain("VoiceWave");
    expect(chat).toContain("isMeteringEnabled: true");
    expect(chat).toContain("Tinjau & konfirmasi lampiran");
    expect(chat).toContain("allowsEditing: true");
  });

  it("membuka kamera perangkat secara eksplisit dan tidak memakai jalur galeri", () => {
    const camera = fs.readFileSync(path.resolve(__dirname, "../components/aira-camera-capture.tsx"), "utf8");
    expect(chat).toContain("AiraCameraCapture");
    expect(chat).toContain("setCameraCaptureOpen(true)");
    expect(chat).toContain("chooseLibrary");
    expect(camera).toContain("CameraView");
    expect(camera).toContain("takePictureAsync");
    expect(camera).toContain("recordAsync");
    expect(camera).toContain("useCameraPermissions");
    expect(chat).toContain("ImagePicker.launchImageLibraryAsync(libraryOptions)");
  });

  it("menjamin preview foto memiliki Batal dan Kirim yang terhubung", () => {
    const camera = fs.readFileSync(path.resolve(__dirname, "../components/aira-camera-capture.tsx"), "utf8");
    expect(camera).toContain("useSafeAreaInsets");
    expect(camera).toContain("Batal dan ambil ulang foto");
    expect(camera).toContain("Kirim foto ke Room Global");
    expect(camera).toContain("onPress={confirmPhoto}");
    expect(camera).toContain("setCapturedPhoto(null)");
    expect(camera).toContain("cropPhoto");
  });

  it("menampilkan gelembung berpikir dan avatar Aira pada respons asisten", () => {
    expect(chat).toContain("presentation.thinkingLabel");
    expect(presentation).toContain("Aira sedang berpikir…");
    expect(chat).toContain("function AiraAvatar");
    expect(chat).toContain("fontStyle: \"italic\"");
    expect(studio).toContain("pickAiraAvatar");
    expect(studio).toContain("Pilih foto Aira Default");
  });

  it("menjaga komposer terangkat ketika keyboard web atau Android terbuka", () => {
    expect(keyboard).toContain("window.visualViewport");
    expect(keyboard).toContain("webKeyboardOffset");
    expect(keyboard).toContain("keyboardDidShow");
    expect(keyboard).toContain("keyboardDidHide");
    expect(keyboard).toContain("keyboardHeight");
    expect(keyboard).toContain("paddingBottom");
    expect(chat).toContain("onFocus={scrollToLatest}");
  });
});
