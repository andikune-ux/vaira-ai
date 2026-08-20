export type WebRtcClientMessage =
  | { type: "join"; roomId: string }
  | { type: "offer" | "answer"; roomId: string; description: RTCSessionDescriptionInit }
  | { type: "ice"; roomId: string; candidate: RTCIceCandidateInit }
  | { type: "leave"; roomId: string };

export type WebRtcServerMessage =
  | { type: "joined"; roomId: string; participants: number }
  | { type: "peer-joined"; userId: number }
  | { type: "peer-left"; userId: number }
  | { type: "offer" | "answer"; roomId: string; description: RTCSessionDescriptionInit; fromUserId: number }
  | { type: "ice"; roomId: string; candidate: RTCIceCandidateInit; fromUserId: number }
  | { type: "left"; roomId: string }
  | { type: "error"; code: string };

export function buildWebRtcSignalingUrl(apiBaseUrl: string) {
  const url = new URL(apiBaseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/webrtc";
  url.search = "";
  return url.toString();
}

export async function fetchIceServers(apiBaseUrl: string, fetcher: typeof fetch = fetch): Promise<RTCIceServer[]> {
  const response = await fetcher(`${apiBaseUrl.replace(/\/$/, "")}/api/webrtc/config`, { credentials: "include" });
  if (!response.ok) throw new Error("Konfigurasi koneksi real-time belum tersedia.");
  const payload = (await response.json()) as { iceServers?: RTCIceServer[] };
  return Array.isArray(payload.iceServers) ? payload.iceServers : [];
}

export function isWebRtcServerMessage(value: unknown): value is WebRtcServerMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return typeof message.type === "string" && ["joined", "peer-joined", "peer-left", "offer", "answer", "ice", "left", "error"].includes(message.type);
}
