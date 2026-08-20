import type { IncomingMessage, Server as HttpServer } from "http";
import type { Request as ExpressRequest } from "express";
import { parse as parseUrl } from "url";
import { WebSocket, WebSocketServer } from "ws";

import { sdk } from "./sdk";

export type WebRtcSignalMessage =
  | { type: "join"; roomId: string }
  | { type: "offer" | "answer"; roomId: string; description: unknown }
  | { type: "ice"; roomId: string; candidate: unknown }
  | { type: "leave"; roomId: string };

type Peer = { socket: WebSocket; userId: number; roomId: string };

const MAX_PEERS_PER_ROOM = 2;
const peersByRoom = new Map<string, Set<Peer>>();

function send(socket: WebSocket, payload: Record<string, unknown>) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
}

function relay(roomId: string, sender: Peer, payload: Record<string, unknown>) {
  const peers = peersByRoom.get(roomId);
  if (!peers) return;
  for (const peer of peers) {
    if (peer !== sender) send(peer.socket, payload);
  }
}

function removePeer(peer: Peer) {
  const peers = peersByRoom.get(peer.roomId);
  if (!peers) return;
  peers.delete(peer);
  relay(peer.roomId, peer, { type: "peer-left", userId: peer.userId });
  if (peers.size === 0) peersByRoom.delete(peer.roomId);
}

function isSignalMessage(value: unknown): value is WebRtcSignalMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  if (typeof message.type !== "string") return false;
  if (message.type === "join" || message.type === "leave") return typeof message.roomId === "string" && message.roomId.length > 0 && message.roomId.length <= 100;
  if (message.type === "offer" || message.type === "answer") return typeof message.roomId === "string" && message.description !== undefined;
  if (message.type === "ice") return typeof message.roomId === "string" && message.candidate !== undefined;
  return false;
}

export async function attachWebRtcSignaling(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 256 * 1024 });

  server.on("upgrade", async (request, socket, head) => {
    const url = parseUrl(request.url ?? "", true);
    if (url.pathname !== "/ws/webrtc") return;
    try {
      const user = await sdk.authenticateRequest(request as unknown as ExpressRequest);
      wss.handleUpgrade(request, socket, head, (client) => wss.emit("connection", client, request, user.id));
    } catch {
      socket.write("HTTP/1.1 401 Unauthorized\\r\\nConnection: close\\r\\n\\r\\n");
      socket.destroy();
    }
  });

  wss.on("connection", (socket: WebSocket, _request: IncomingMessage, userId: number) => {
    let peer: Peer | null = null;

    socket.on("message", (raw) => {
      try {
        const message: unknown = JSON.parse(raw.toString());
        if (!isSignalMessage(message)) return send(socket, { type: "error", code: "INVALID_MESSAGE" });
        if (message.type === "join") {
          if (peer) return send(socket, { type: "error", code: "ALREADY_JOINED" });
          const peers = peersByRoom.get(message.roomId) ?? new Set<Peer>();
          if (peers.size >= MAX_PEERS_PER_ROOM) return send(socket, { type: "error", code: "ROOM_FULL" });
          peer = { socket, userId, roomId: message.roomId };
          peers.add(peer);
          peersByRoom.set(message.roomId, peers);
          send(socket, { type: "joined", roomId: message.roomId, participants: peers.size });
          relay(message.roomId, peer, { type: "peer-joined", userId });
          return;
        }
        if (!peer || message.roomId !== peer.roomId) return send(socket, { type: "error", code: "NOT_IN_ROOM" });
        if (message.type === "leave") {
          removePeer(peer);
          peer = null;
          send(socket, { type: "left", roomId: message.roomId });
          return;
        }
        relay(message.roomId, peer, { ...message, fromUserId: userId });
      } catch {
        send(socket, { type: "error", code: "MALFORMED_MESSAGE" });
      }
    });

    socket.on("close", () => { if (peer) removePeer(peer); });
    socket.on("error", () => { if (peer) removePeer(peer); });
  });
}
