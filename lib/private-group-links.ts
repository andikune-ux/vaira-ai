export const GROUP_LINK_DOMAIN = "https://vairaiapp-n9sw5cvx.manus.space";
export const GROUP_DOWNLOAD_URL = `${GROUP_LINK_DOMAIN}/download`;

export function createPrivateGroupInviteUrl(token: string) {
  return `${GROUP_LINK_DOMAIN}/private-group-join?token=${encodeURIComponent(token)}`;
}

export function getInviteTokenFromUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("token");
  } catch {
    return null;
  }
}
