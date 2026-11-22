import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type ReleaseOffer = {
  version: string;
  downloadUrl: string;
  headline: string;
  summary: string;
  changes: string[];
};

type GitHubRelease = {
  tag_name?: string;
  name?: string | null;
  body?: string | null;
  draft?: boolean;
  prerelease?: boolean;
  assets?: Array<{
    name?: string;
    content_type?: string;
    browser_download_url?: string;
  }>;
};

const RELEASE_API = "https://api.github.com/repos/andikune-ux/vaira-ai/releases/latest";
const RELEASE_CACHE_KEY = "vaira:github-latest-release";
const RELEASE_CACHE_TTL_MS = 15 * 60 * 1000;

function isOlderVersion(current: string, latest: string) {
  const currentParts = current.split(".").map((part) => Number(part) || 0);
  const latestParts = latest.split(".").map((part) => Number(part) || 0);
  for (let index = 0; index < Math.max(currentParts.length, latestParts.length); index += 1) {
    if ((currentParts[index] ?? 0) !== (latestParts[index] ?? 0)) return (currentParts[index] ?? 0) < (latestParts[index] ?? 0);
  }
  return false;
}

function toReleaseOffer(release: GitHubRelease): ReleaseOffer | null {
  if (!release.tag_name || release.draft || release.prerelease) return null;
  const version = release.tag_name.replace(/^v/i, "");
  if (!/^\d+(\.\d+){1,3}$/.test(version)) return null;

  const apk = release.assets?.find((asset) =>
    asset.name?.toLowerCase().endsWith(".apk") &&
    typeof asset.browser_download_url === "string" &&
    asset.browser_download_url.length > 0
  );
  if (!apk?.browser_download_url) return null;

  const changes = (release.body ?? "")
    .split("\n")
    .map((line) => line.trim().replace(/^[-*]\s*/, ""))
    .filter((line) =>
      line.length > 0 &&
      !/^full changelog/i.test(line) &&
      !/^package android:/i.test(line) &&
      !/^backend:/i.test(line) &&
      !/^build:/i.test(line)
    );
  const summary = changes.length
    ? changes.slice(0, 2).join(" ")
    : "Pembaruan V A I R A  A I tersedia. Unduh APK terbaru dari GitHub Release.";

  return {
    version,
    downloadUrl: apk.browser_download_url,
    headline: release.name?.trim() || `V A I R A  A I ${version}`,
    summary,
    changes: changes.length ? changes : ["APK terbaru tersedia melalui GitHub Releases."],
  };
}

async function readCachedRelease(): Promise<ReleaseOffer | null> {
  try {
    const raw = await AsyncStorage.getItem(RELEASE_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { savedAt?: number; offer?: ReleaseOffer };
    if (!cached.savedAt || Date.now() - cached.savedAt > RELEASE_CACHE_TTL_MS || !cached.offer?.version || !cached.offer.downloadUrl) return null;
    return cached.offer;
  } catch {
    return null;
  }
}

async function fetchLatestRelease(): Promise<ReleaseOffer> {
  const response = await fetch(RELEASE_API, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error(`GitHub Releases returned HTTP ${response.status}`);
  const offer = toReleaseOffer((await response.json()) as GitHubRelease);
  if (!offer) throw new Error("GitHub Release terbaru belum memiliki asset APK yang valid.");
  await AsyncStorage.setItem(RELEASE_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), offer }));
  return offer;
}

export function AppUpdatePrompt() {
  const currentVersion = Constants.expoConfig?.version ?? "1.0.0";
  const [release, setRelease] = useState<ReleaseOffer | null>(null);
  const [visible, setVisible] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const skipKey = useMemo(() => release ? `vaira:skipped-update:${release.version}` : "", [release?.version]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const cached = await readCachedRelease();
      if (active && cached) setRelease(cached);
      try {
        const latest = await fetchLatestRelease();
        if (active) setRelease(latest);
      } catch {
        // Use a fresh cached release when GitHub is temporarily unreachable.
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!release || !skipKey || !isOlderVersion(currentVersion, release.version)) {
      setVisible(false);
      return;
    }
    let active = true;
    void AsyncStorage.getItem(skipKey).then((value) => {
      if (active) setVisible(!value);
    }).catch(() => {
      if (active) setVisible(true);
    });
    return () => { active = false; };
  }, [currentVersion, release, skipKey]);

  const skip = async () => {
    if (skipKey) await AsyncStorage.setItem(skipKey, "1");
    setVisible(false);
  };
  const update = () => {
    if (!release?.downloadUrl) return;
    void WebBrowser.openBrowserAsync(release.downloadUrl).catch(() =>
      Alert.alert("Unduhan belum tersedia", "APK dari GitHub Release belum dapat dibuka. Periksa koneksi internet lalu coba kembali.")
    );
  };

  if (!release) return null;

  return <><Modal visible={visible} transparent animationType="fade" onRequestClose={() => { void skip(); }}><View style={styles.backdrop}><View style={styles.card}><Text style={styles.eyebrow}>PEMBARUAN TERSEDIA</Text><Text style={styles.title}>V A I R A  A I {release.version}</Text><Text style={styles.description}>{release.summary}</Text><View style={styles.changeList}>{release.changes.slice(0, 4).map((change) => <View key={change} style={styles.changeRow}><Text style={styles.bullet}>-</Text><Text numberOfLines={2} style={styles.changeText}>{change}</Text></View>)}</View><Pressable onPress={() => setDetailsOpen(true)} style={styles.detailButton}><Text style={styles.detailButtonText}>Lihat selengkapnya</Text></Pressable><View style={styles.actions}><Pressable onPress={() => { void skip(); }} style={styles.skip}><Text style={styles.skipText}>Skip</Text></Pressable><Pressable onPress={update} style={styles.update}><Text style={styles.updateText}>Update</Text></Pressable></View></View></View></Modal><Modal visible={detailsOpen} transparent animationType="slide" onRequestClose={() => setDetailsOpen(false)}><View style={styles.backdrop}><View style={styles.detailCard}><Text style={styles.title}>Catatan pembaruan</Text><Text style={styles.description}>Perubahan pada versi {release.version}</Text><ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailScrollContent}>{release.changes.map((change) => <View key={change} style={styles.changeRow}><Text style={styles.bullet}>-</Text><Text style={styles.changeText}>{change}</Text></View>)}</ScrollView><Pressable onPress={() => setDetailsOpen(false)} style={styles.update}><Text style={styles.updateText}>Kembali</Text></Pressable></View></View></Modal></>;
}

const styles = StyleSheet.create({ backdrop: { alignItems: "center", backgroundColor: "#020814B8", flex: 1, justifyContent: "center", padding: 22 }, card: { backgroundColor: "#0B1425", borderColor: "#36B7FF66", borderRadius: 18, borderWidth: 1, gap: 12, maxWidth: 460, padding: 18, width: "100%" }, detailCard: { backgroundColor: "#0B1425", borderColor: "#36B7FF66", borderRadius: 18, borderWidth: 1, gap: 12, maxHeight: "76%", maxWidth: 460, padding: 18, width: "100%" }, eyebrow: { color: "#36B7FF", fontSize: 10, fontWeight: "900", letterSpacing: 1 }, title: { color: "#F1F6FF", fontSize: 20, fontWeight: "900" }, description: { color: "#A6B9D3", fontSize: 12, lineHeight: 18 }, changeList: { gap: 7 }, changeRow: { flexDirection: "row", gap: 7 }, bullet: { color: "#36B7FF", fontSize: 13, fontWeight: "900" }, changeText: { color: "#DCE8F8", flex: 1, fontSize: 11, lineHeight: 16 }, detailButton: { alignSelf: "flex-start", paddingVertical: 3 }, detailButtonText: { color: "#8DEBFF", fontSize: 11, fontWeight: "900" }, actions: { flexDirection: "row", gap: 9, justifyContent: "flex-end", marginTop: 2 }, skip: { alignItems: "center", borderColor: "#5F738F", borderRadius: 10, borderWidth: 1, justifyContent: "center", minHeight: 42, minWidth: 82, paddingHorizontal: 14 }, skipText: { color: "#B7C8DF", fontSize: 12, fontWeight: "900" }, update: { alignItems: "center", backgroundColor: "#36B7FF", borderRadius: 10, justifyContent: "center", minHeight: 42, minWidth: 92, paddingHorizontal: 14 }, updateText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, detailScroll: { maxHeight: 360 }, detailScrollContent: { gap: 9, paddingBottom: 6 } });
