import * as Audio from "expo-audio";
import { Camera as ExpoCamera } from "expo-camera";
import * as Location from "expo-location";
import * as Network from "expo-network";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getApiBaseUrl } from "@/constants/oauth";
import { getLastBugDiagnostic } from "@/lib/bug-diagnostics";
import { getTemporaryCacheSize } from "@/lib/spca-cache";
import { createSafeSpcaReport, createSpcaFindings, type SpcaFinding, type SpcaPermissionState, type SpcaRuntimeSnapshot } from "@/lib/spca-diagnostic-engine";

function permissionState(result: { granted?: boolean; status?: string } | null | undefined): SpcaPermissionState {
  if (!result) return "unavailable";
  if (result.granted) return "granted";
  return result.status === "undetermined" ? "undetermined" : "denied";
}

async function checkServerHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);
    const response = await fetch(`${getApiBaseUrl()}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return response.ok ? "healthy" as const : "unreachable" as const;
  } catch {
    return "unreachable" as const;
  }
}

export function useSpcaDiagnostics() {
  const [snapshot, setSnapshot] = useState<SpcaRuntimeSnapshot | null>(null);
  const [findings, setFindings] = useState<SpcaFinding[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const scan = useCallback(async () => {
    setIsScanning(true);
    try {
      const [network, server, camera, microphone, location, notifications, cache, lastError] = await Promise.all([
        Network.getNetworkStateAsync(),
        checkServerHealth(),
        ExpoCamera.getCameraPermissionsAsync().catch(() => null),
        Audio.getRecordingPermissionsAsync().catch(() => null),
        Location.getForegroundPermissionsAsync().catch(() => null),
        Notifications.getPermissionsAsync().catch(() => null),
        getTemporaryCacheSize().catch(() => 0),
        getLastBugDiagnostic(),
      ]);
      const next: SpcaRuntimeSnapshot = {
        capturedAt: new Date().toISOString(),
        network: network.isConnected === false ? "offline" : network.isConnected == null ? "unknown" : "online",
        internetReachable: network.isInternetReachable ?? null,
        server,
        camera: permissionState(camera),
        microphone: permissionState(microphone),
        location: permissionState(location),
        notifications: permissionState(notifications),
        temporaryCacheBytes: cache,
        runtimeErrorAt: lastError?.createdAt,
      };
      setSnapshot(next);
      setFindings(createSpcaFindings(next));
      return next;
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    void scan();
    const interval = setInterval(() => { void scan(); }, 120_000);
    return () => clearInterval(interval);
  }, [scan]);
  const report = useMemo(() => snapshot ? createSafeSpcaReport(snapshot, findings) : null, [findings, snapshot]);
  return { findings, isScanning, report, scan, snapshot };
}
