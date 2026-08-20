export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // OpenAI-compatible self-host provider. API key may be empty for trusted local networks.
  selfHostApiUrl: process.env.AIRA_SELF_HOST_API_URL ?? "",
  selfHostApiKey: process.env.AIRA_SELF_HOST_API_KEY ?? "",
  selfHostModel: process.env.AIRA_SELF_HOST_MODEL ?? "",
  // Optional free-tier backup provider, configured only on the server.
  backupApiUrl: process.env.AIRA_BACKUP_API_URL ?? "",
  backupApiKey: process.env.AIRA_BACKUP_API_KEY ?? "",
  backupModel: process.env.AIRA_BACKUP_MODEL ?? "",
};
