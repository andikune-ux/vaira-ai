import { describe, expect, it } from "vitest";

import { buildWebRtcSignalingUrl, fetchIceServers, isWebRtcServerMessage } from "../lib/webrtc-signaling";

describe("WebRTC signaling Aira", () => {
  it("mengubah endpoint API HTTPS menjadi endpoint WSS signaling", () => {
    expect(buildWebRtcSignalingUrl("https://aira.example.test/api")).toBe("wss://aira.example.test/ws/webrtc");
    expect(buildWebRtcSignalingUrl("http://localhost:3000")).toBe("ws://localhost:3000/ws/webrtc");
  });

  it("mengambil konfigurasi ICE dari endpoint terproteksi", async () => {
    const servers = await fetchIceServers("https://aira.example.test/", async () => new Response(JSON.stringify({ iceServers: [{ urls: "stun:stun.example.test" }] }), { status: 200 }));
    expect(servers).toEqual([{ urls: "stun:stun.example.test" }]);
  });

  it("menerima event signaling yang dikenal dan menolak bentuk sembarang", () => {
    expect(isWebRtcServerMessage({ type: "joined", roomId: "room-1", participants: 1 })).toBe(true);
    expect(isWebRtcServerMessage({ type: "peer-left", userId: 12 })).toBe(true);
    expect(isWebRtcServerMessage({ type: "unknown" })).toBe(false);
    expect(isWebRtcServerMessage(null)).toBe(false);
  });
});
