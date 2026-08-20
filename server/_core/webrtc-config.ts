export type IceServerConfig = { urls: string | string[]; username?: string; credential?: string };

export function getIceServerConfig(): IceServerConfig[] {
  const urls = (process.env.AIRA_ICE_SERVER_URLS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.startsWith("stun:") || value.startsWith("turn:") || value.startsWith("turns:"));
  if (urls.length === 0) return [];
  const username = process.env.AIRA_TURN_USERNAME?.trim();
  const credential = process.env.AIRA_TURN_CREDENTIAL?.trim();
  const hasTurn = urls.some((url) => url.startsWith("turn:" ) || url.startsWith("turns:"));
  if (hasTurn && (!username || !credential)) return urls.filter((url) => url.startsWith("stun:")).map((url) => ({ urls: url }));
  return [{ urls: urls.length === 1 ? urls[0] : urls, ...(hasTurn ? { username, credential } : {}) }];
}
