import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Linking, Platform, Share } from "react-native";

type GeneratedFile = {
  uri: string;
  label: string;
  mimeType: string;
};

function safeFileName(label: string, mimeType: string) {
  const existingExtension = label.match(/\.([a-z0-9]{2,8})$/i)?.[1];
  const extension = existingExtension ?? (mimeType === "image/png" ? "png" : mimeType === "application/pdf" ? "pdf" : mimeType.includes("word") ? "docx" : mimeType.includes("presentation") ? "pptx" : mimeType.includes("spreadsheet") ? "xlsx" : "bin");
  const stem = label.replace(/\.[a-z0-9]{2,8}$/i, "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 72) || "hasil-aira";
  return `${stem}-${Date.now()}.${extension}`;
}

export async function openGeneratedResultDownload({ uri, label, mimeType }: GeneratedFile) {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    const link = document.createElement("a");
    link.href = uri;
    link.download = safeFileName(label, mimeType);
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return;
  }
  await Linking.openURL(uri);
}

export async function shareGeneratedResult(file: GeneratedFile) {
  if (Platform.OS === "web") {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      await navigator.share({ title: file.label, text: file.label, url: file.uri });
      return;
    }
    await Share.share({ title: file.label, message: `${file.label}\n${file.uri}` });
    return;
  }

  if (!FileSystem.cacheDirectory || !(await Sharing.isAvailableAsync())) {
    await Share.share({ title: file.label, message: `${file.label}\n${file.uri}` });
    return;
  }

  const downloaded = await FileSystem.downloadAsync(file.uri, `${FileSystem.cacheDirectory}${safeFileName(file.label, file.mimeType)}`);
  await Sharing.shareAsync(downloaded.uri, { dialogTitle: `Bagikan ${file.label}`, mimeType: file.mimeType, UTI: file.mimeType });
}

export async function shareGeneratedResults(files: GeneratedFile[]) {
  if (files.length === 0) return;
  if (files.length === 1) {
    await shareGeneratedResult(files[0]);
    return;
  }
  const message = files.map((file, index) => `${index + 1}. ${file.label}\n${file.uri}`).join("\n\n");
  if (Platform.OS === "web" && typeof navigator !== "undefined" && "share" in navigator) {
    await navigator.share({ title: "Hasil Aira", text: message });
    return;
  }
  await Share.share({ title: "Hasil Aira", message });
}
