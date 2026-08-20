export type GlobalRoomAudioState = "unavailable" | "ready" | "joining" | "joined" | "muted" | "left";

export type GlobalRoomAudioAdapter = {
  readonly state: GlobalRoomAudioState;
  readonly provider: string | null;
  join: () => Promise<void>;
  leave: () => Promise<void>;
  setMuted: (muted: boolean) => Promise<void>;
};

/**
 * Audio remains unavailable until a reviewed WebRTC/WebSocket provider is configured.
 * The adapter keeps the UI honest and gives the future provider a stable lifecycle.
 */
export function createUnavailableGlobalRoomAudioAdapter(): GlobalRoomAudioAdapter {
  let state: GlobalRoomAudioState = "unavailable";
  return {
    get state() { return state; },
    provider: null,
    async join() { state = "unavailable"; },
    async leave() { state = "left"; },
    async setMuted() { state = "unavailable"; },
  };
}

export function canEnableGlobalRoomAudio(providerName: string | null | undefined) {
  return typeof providerName === "string" && providerName.trim().length > 0;
}
