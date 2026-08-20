export type GlobalRoomProvider = "daily" | "livekit" | "twilio";
export type ProviderAttempt = { provider: GlobalRoomProvider; ok: boolean; reason?: string };

export const GLOBAL_ROOM_PROVIDER_ORDER: readonly GlobalRoomProvider[] = ["daily", "livekit", "twilio"];

export type ProviderConnector = {
  provider: GlobalRoomProvider;
  healthCheck: () => Promise<boolean>;
  join: () => Promise<void>;
  leave: () => Promise<void>;
};

export type FailoverResult = {
  provider: GlobalRoomProvider | null;
  mode: "audio" | "polling";
  attempts: ProviderAttempt[];
};

/**
 * Provider connectors are injected only after their official SDK and server token
 * flow are configured. The controller itself never enables a microphone.
 */
export async function connectWithFailover(connectors: readonly ProviderConnector[]): Promise<FailoverResult> {
  const attempts: ProviderAttempt[] = [];
  for (const provider of GLOBAL_ROOM_PROVIDER_ORDER) {
    const connector = connectors.find((candidate) => candidate.provider === provider);
    if (!connector) {
      attempts.push({ provider, ok: false, reason: "provider-not-configured" });
      continue;
    }
    try {
      if (!(await connector.healthCheck())) {
        attempts.push({ provider, ok: false, reason: "health-check-failed" });
        continue;
      }
      await connector.join();
      attempts.push({ provider, ok: true });
      return { provider, mode: "audio", attempts };
    } catch (error) {
      attempts.push({ provider, ok: false, reason: error instanceof Error ? error.message : "join-failed" });
    }
  }
  return { provider: null, mode: "polling", attempts };
}
