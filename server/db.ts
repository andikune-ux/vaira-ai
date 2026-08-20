import { and, count, desc, eq, gt, isNotNull, isNull, lt, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { administratorAuditLogs, airaAccessTokens, airaxCloudBackups, financeSnapshots, globalRoomBlocks, globalRoomConsents, globalRoomMessages, globalRoomModeration, globalRoomPresence, globalRoomReports, globalRoomSettings, globalRoomUserSettings, globalRoomMessageReactions, globalRoomProfileComments, globalRoomProfileLoves, globalRoomUserStatus, globalTestSnapshots, administratorTokenSettings, InsertAdministratorAuditLog, InsertAiraXCloudBackup, InsertManualAccount, InsertUser, manualAccounts, manualAccountSessions, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { storageGetSignedUrl } from "./storage";

let _db: ReturnType<typeof drizzle> | null = null;

// Status mengetik bersifat sementara: tidak menyimpan isi pesan dan otomatis kedaluwarsa.
const globalRoomTypingUntil = new Map<number, number>();
const GLOBAL_ROOM_TYPING_TTL_MS = 4_000;

export function setGlobalRoomTyping(accountId: number, typing: boolean) {
  if (typing) globalRoomTypingUntil.set(accountId, Date.now() + GLOBAL_ROOM_TYPING_TTL_MS);
  else globalRoomTypingUntil.delete(accountId);
  return { success: true };
}

export function getGlobalRoomTypingCount(exceptAccountId: number) {
  const now = Date.now();
  for (const [accountId, expiresAt] of globalRoomTypingUntil) if (expiresAt <= now) globalRoomTypingUntil.delete(accountId);
  return Array.from(globalRoomTypingUntil.keys()).filter((accountId) => accountId !== exceptAccountId).length;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function getServerDatabase2RecoveryStatus() {
  const db = await getDb();
  if (!db) throw new Error("SERVER DATABASE 2 belum tersedia.");
  const [manualAccountsRows, auditLogsRows, roomMessagesRows, cloudMetadataRows, restrictedCloudMetadataRows] = await Promise.all([
    db.select({ total: count() }).from(manualAccounts),
    db.select({ total: count() }).from(administratorAuditLogs),
    db.select({ total: count() }).from(globalRoomMessages),
    db.select({ total: count() }).from(airaxCloudBackups),
    db.select({ total: count() }).from(airaxCloudBackups).where(eq(airaxCloudBackups.status, "restricted")),
  ]);
  return {
    manualAccountsCount: Number(manualAccountsRows[0]?.total ?? 0),
    auditLogsCount: Number(auditLogsRows[0]?.total ?? 0),
    roomMessagesCount: Number(roomMessagesRows[0]?.total ?? 0),
    cloudMetadataCount: Number(cloudMetadataRows[0]?.total ?? 0),
    restrictedCloudMetadataCount: Number(restrictedCloudMetadataRows[0]?.total ?? 0),
  };
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getFinanceSnapshot(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(financeSnapshots).where(eq(financeSnapshots.userId, userId)).limit(1);
  return result[0];
}

export async function saveFinanceSnapshot(userId: number, payload: string) {
  const db = await getDb();
  if (!db) throw new Error("Database tidak tersedia untuk sinkronisasi.");
  await db.insert(financeSnapshots).values({ userId, payload }).onDuplicateKeyUpdate({ set: { payload, updatedAt: new Date() } });
}

export async function getGlobalTestSnapshot() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(globalTestSnapshots).where(eq(globalTestSnapshots.scope, "personal-test")).limit(1);
  return result[0];
}

export async function saveGlobalTestSnapshot(userId: number, payload: string) {
  const db = await getDb();
  if (!db) throw new Error("Database tidak tersedia untuk snapshot global uji.");
  await db.insert(globalTestSnapshots).values({ scope: "personal-test", payload, updatedByUserId: userId }).onDuplicateKeyUpdate({ set: { payload, updatedByUserId: userId, updatedAt: new Date() } });
}

export async function createAiraXCloudBackup(values: InsertAiraXCloudBackup) {
  const db = await getDb();
  if (!db) throw new Error("AiraXCloud belum tersedia.");
  const result = await db.insert(airaxCloudBackups).values(values);
  return Number(result[0].insertId);
}

export async function getLatestAiraXCloudBackup(accountId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(airaxCloudBackups).where(and(eq(airaxCloudBackups.accountId, accountId), eq(airaxCloudBackups.status, "active"))).orderBy(desc(airaxCloudBackups.createdAt)).limit(1);
  return rows[0];
}

export async function listAiraXCloudBackupsForAccount(accountId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(airaxCloudBackups).where(and(eq(airaxCloudBackups.accountId, accountId), eq(airaxCloudBackups.status, "active"))).orderBy(desc(airaxCloudBackups.createdAt));
}

export async function listAiraXCloudBackupsAdmin(query?: string) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(airaxCloudBackups).orderBy(desc(airaxCloudBackups.createdAt));
  const needle = query?.trim().toLowerCase();
  return needle ? rows.filter((backup) => backup.username.toLowerCase().includes(needle) || backup.fileName.toLowerCase().includes(needle)) : rows;
}

export async function getAiraXCloudBackupById(backupId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(airaxCloudBackups).where(eq(airaxCloudBackups.id, backupId)).limit(1);
  return rows[0];
}

export async function updateAiraXCloudBackupStatus(backupId: number, status: "active" | "restricted" | "deleted") {
  const db = await getDb();
  if (!db) throw new Error("AiraXCloud belum tersedia.");
  await db.update(airaxCloudBackups).set({ status }).where(eq(airaxCloudBackups.id, backupId));
}

export async function deleteAiraXCloudBackupPermanently(backupId: number) {
  const db = await getDb();
  if (!db) throw new Error("AiraXCloud belum tersedia.");
  await db.delete(airaxCloudBackups).where(eq(airaxCloudBackups.id, backupId));
}

/** Menjaga satu cadangan terbaru tetap tersedia dan menghapus satu cadangan tertua yang sudah berumur minimal satu bulan. */
export async function pruneOldestAiraXCloudBackup(accountId: number, now = new Date()) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(airaxCloudBackups).where(and(eq(airaxCloudBackups.accountId, accountId), eq(airaxCloudBackups.status, "active"))).orderBy(desc(airaxCloudBackups.createdAt));
  if (rows.length < 2) return undefined;
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oldest = rows[rows.length - 1];
  if (oldest.createdAt > cutoff) return undefined;
  await db.delete(airaxCloudBackups).where(eq(airaxCloudBackups.id, oldest.id));
  return oldest;
}

export async function findManualAccountByPublicId(publicId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(manualAccounts).where(eq(manualAccounts.publicId, publicId)).limit(1);
  return result[0];
}

export async function findManualAccountByIdentifier(identifier: string) {
  const db = await getDb();
  if (!db) return undefined;
  const normalized = identifier.trim().toLowerCase();
  const result = await db.select().from(manualAccounts).where(or(eq(manualAccounts.username, normalized), eq(manualAccounts.email, normalized), eq(manualAccounts.phone, identifier.trim()))).limit(1);
  return result[0];
}

export async function getManualAccountById(accountId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(manualAccounts).where(eq(manualAccounts.id, accountId)).limit(1);
  return result[0];
}

export async function createManualAccount(values: InsertManualAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database akun belum tersedia.");
  const result = await db.insert(manualAccounts).values(values);
  return Number(result[0].insertId);
}

export async function createManualAccountSession(accountId: number, tokenHash: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database sesi belum tersedia.");
  await db.insert(manualAccountSessions).values({ accountId, tokenHash, expiresAt });
}

export async function createAiraAccessToken(values: { tokenHash: string; criterion: "pro" | "premium" | "admin"; durationDays: number | null; expiresAt: Date | null; createdBy: string }) {
  const database = await getDb();
  if (!database) throw new Error("Database token belum tersedia.");
  const result = await database.insert(airaAccessTokens).values(values);
  return Number(result[0].insertId);
}

export async function getAdministratorTokenSettings() {
  const database = await getDb();
  if (!database) return { settingId: 1, autoDeleteDays: 0, updatedBy: null, updatedAt: new Date() };
  const rows = await database.select().from(administratorTokenSettings).where(eq(administratorTokenSettings.settingId, 1)).limit(1);
  return rows[0] ?? { settingId: 1, autoDeleteDays: 0, updatedBy: null, updatedAt: new Date() };
}
export async function setAdministratorTokenSettings(autoDeleteDays: number, updatedBy: string) {
  const database = await getDb();
  if (!database) throw new Error("Database pengaturan token belum tersedia.");
  await database.insert(administratorTokenSettings).values({ settingId: 1, autoDeleteDays, updatedBy }).onDuplicateKeyUpdate({ set: { autoDeleteDays, updatedBy, updatedAt: new Date() } });
}
export async function applyAdministratorTokenRetention() {
  const database = await getDb();
  if (!database) return;
  const settings = await getAdministratorTokenSettings();
  if (!settings.autoDeleteDays) return;
  const cutoff = new Date(Date.now() - settings.autoDeleteDays * 24 * 60 * 60 * 1000);
  const inactiveToken = or(isNotNull(airaAccessTokens.revokedAt), and(isNotNull(airaAccessTokens.expiresAt), lt(airaAccessTokens.expiresAt, new Date())));
  await database.update(airaAccessTokens).set({ tokenHistoryHiddenAt: new Date() }).where(and(isNull(airaAccessTokens.tokenHistoryHiddenAt), lt(airaAccessTokens.createdAt, cutoff), inactiveToken));
  await database.update(airaAccessTokens).set({ redeemHistoryHiddenAt: new Date() }).where(and(isNull(airaAccessTokens.redeemHistoryHiddenAt), isNotNull(airaAccessTokens.redeemedAt), lt(airaAccessTokens.redeemedAt, cutoff)));
}
export async function listAiraAccessTokens() {
  const database = await getDb();
  if (!database) return [];
  await applyAdministratorTokenRetention();
  return database.select({ id: airaAccessTokens.id, criterion: airaAccessTokens.criterion, durationDays: airaAccessTokens.durationDays, expiresAt: airaAccessTokens.expiresAt, redeemedAt: airaAccessTokens.redeemedAt, redeemedAccountId: airaAccessTokens.redeemedAccountId, revokedAt: airaAccessTokens.revokedAt, revokedBy: airaAccessTokens.revokedBy, createdBy: airaAccessTokens.createdBy, createdAt: airaAccessTokens.createdAt }).from(airaAccessTokens).where(isNull(airaAccessTokens.tokenHistoryHiddenAt)).orderBy(desc(airaAccessTokens.createdAt));
}
export async function listAiraAccessTokenRedeems() {
  const database = await getDb();
  if (!database) return [];
  await applyAdministratorTokenRetention();
  return database.select({ id: airaAccessTokens.id, criterion: airaAccessTokens.criterion, durationDays: airaAccessTokens.durationDays, expiresAt: airaAccessTokens.expiresAt, redeemedAt: airaAccessTokens.redeemedAt, redeemedAccountId: airaAccessTokens.redeemedAccountId, revokedAt: airaAccessTokens.revokedAt, username: manualAccounts.username, fullName: manualAccounts.fullName }).from(airaAccessTokens).leftJoin(manualAccounts, eq(airaAccessTokens.redeemedAccountId, manualAccounts.id)).where(and(isNotNull(airaAccessTokens.redeemedAt), isNull(airaAccessTokens.redeemHistoryHiddenAt))).orderBy(desc(airaAccessTokens.redeemedAt));
}
export async function hideAiraTokenHistory() {
  const database = await getDb();
  if (!database) throw new Error("Database riwayat token belum tersedia.");
  const inactiveToken = or(isNotNull(airaAccessTokens.revokedAt), and(isNotNull(airaAccessTokens.expiresAt), lt(airaAccessTokens.expiresAt, new Date())));
  await database.update(airaAccessTokens).set({ tokenHistoryHiddenAt: new Date() }).where(and(isNull(airaAccessTokens.tokenHistoryHiddenAt), inactiveToken));
}
export async function hideAiraRedeemHistory() {
  const database = await getDb();
  if (!database) throw new Error("Database riwayat redeem belum tersedia.");
  await database.update(airaAccessTokens).set({ redeemHistoryHiddenAt: new Date() }).where(and(isNotNull(airaAccessTokens.redeemedAt), isNull(airaAccessTokens.redeemHistoryHiddenAt)));
}

export async function revokeAiraAccessToken(id: number, revokedBy: string) {
  const database = await getDb();
  if (!database) throw new Error("Database token belum tersedia.");
  await database.update(airaAccessTokens).set({ revokedAt: new Date(), revokedBy }).where(and(eq(airaAccessTokens.id, id), isNull(airaAccessTokens.revokedAt)));
}

export async function redeemAiraAccessToken(tokenHash: string, accountId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database token belum tersedia.");
  const result = await database.update(airaAccessTokens).set({ redeemedAt: new Date(), redeemedAccountId: accountId }).where(and(eq(airaAccessTokens.tokenHash, tokenHash), isNull(airaAccessTokens.redeemedAt), isNull(airaAccessTokens.revokedAt), or(isNull(airaAccessTokens.expiresAt), gt(airaAccessTokens.expiresAt, new Date()))));
  if (!Number(result[0].affectedRows ?? 0)) return undefined;
  const rows = await database.select().from(airaAccessTokens).where(eq(airaAccessTokens.tokenHash, tokenHash)).limit(1);
  return rows[0];
}

export async function getActiveAiraAccess(accountId: number) {
  const database = await getDb();
  if (!database) return undefined;
  const rows = await database.select().from(airaAccessTokens).where(and(eq(airaAccessTokens.redeemedAccountId, accountId), isNotNull(airaAccessTokens.redeemedAt), isNull(airaAccessTokens.revokedAt), or(isNull(airaAccessTokens.expiresAt), gt(airaAccessTokens.expiresAt, new Date()))));
  return rows.sort((a, b) => ({ admin: 3, premium: 2, pro: 1 }[b.criterion] - { admin: 3, premium: 2, pro: 1 }[a.criterion]))[0];
}

export async function getManualAccountBySession(tokenHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({ account: manualAccounts }).from(manualAccountSessions).innerJoin(manualAccounts, eq(manualAccountSessions.accountId, manualAccounts.id)).where(and(eq(manualAccountSessions.tokenHash, tokenHash), gt(manualAccountSessions.expiresAt, new Date()))).limit(1);
  return result[0]?.account;
}

export async function deleteManualAccountSession(tokenHash: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(manualAccountSessions).where(eq(manualAccountSessions.tokenHash, tokenHash));
}

export async function updateManualAccountLogin(accountId: number, values: { failedLoginAttempts?: number; status?: "active" | "disabled" | "blocked" | "closing" | "blacklisted"; blockedAt?: Date | null; loginCooldownUntil?: Date | null; lastLoginAt?: Date | null; passwordHash?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database akun belum tersedia.");
  await db.update(manualAccounts).set(values).where(eq(manualAccounts.id, accountId));
}

export async function requestManualAccountClosure(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database akun belum tersedia.");
  await db.update(manualAccounts).set({ status: "closing", closeRequestedAt: new Date() }).where(eq(manualAccounts.id, accountId));
}

export async function restoreManualAccount(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database akun belum tersedia.");
  await db.update(manualAccounts).set({ status: "active", closeRequestedAt: null, blacklistedAt: null }).where(eq(manualAccounts.id, accountId));
}

export async function blacklistExpiredManualAccounts(reference = new Date()) {
  const db = await getDb();
  if (!db) return 0;
  const cutoff = new Date(reference.getTime() - 30 * 24 * 60 * 60 * 1000);
  const result = await db.update(manualAccounts).set({ status: "blacklisted", blacklistedAt: reference }).where(and(eq(manualAccounts.status, "closing"), lt(manualAccounts.closeRequestedAt, cutoff)));
  return Number(result[0].affectedRows ?? 0);
}

export async function listManualAccounts(query?: string) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(manualAccounts).orderBy(manualAccounts.createdAt);
  const needle = query?.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((account) => [account.fullName, account.username, account.email, account.phone].some((value) => value.toLowerCase().includes(needle)));
}

export async function findManualAccountIdentifierConflict(accountId: number, values: { username?: string; email?: string; phone?: string }) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(manualAccounts);
  return rows.find((item) => item.id !== accountId && (
    (values.username !== undefined && item.username === values.username)
    || (values.email !== undefined && item.email === values.email)
    || (values.phone !== undefined && item.phone === values.phone)
  ));
}

export async function revokeManualAccountSessions(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database sesi belum tersedia.");
  await db.delete(manualAccountSessions).where(eq(manualAccountSessions.accountId, accountId));
}

export async function updateManualAccountAdmin(accountId: number, values: Partial<Pick<typeof manualAccounts.$inferInsert, "fullName" | "publicId" | "username" | "birthDate" | "email" | "phone" | "status" | "isVerified" | "failedLoginAttempts" | "blockedAt" | "loginCooldownUntil" | "closeRequestedAt" | "blacklistedAt" | "passwordHash" | "createdByAdministrator">>) {
  const db = await getDb();
  if (!db) throw new Error("Database akun belum tersedia.");
  await db.update(manualAccounts).set(values).where(eq(manualAccounts.id, accountId));
}

export async function createAdministratorAuditLog(values: InsertAdministratorAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database audit administrator belum tersedia.");
  await db.insert(administratorAuditLogs).values(values);
}

export async function listAdministratorAuditLogs(limit = 60) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(administratorAuditLogs).orderBy(desc(administratorAuditLogs.createdAt)).limit(Math.max(1, Math.min(100, limit)));
}

export async function deleteAdministratorAuditLogs(ids: number[] | "all") {
  const db = await getDb();
  if (!db) throw new Error("Database audit administrator belum tersedia.");
  const condition = ids === "all" ? undefined : ids.length ? or(...ids.map((id) => eq(administratorAuditLogs.id, id))) : eq(administratorAuditLogs.id, -1);
  if (condition) await db.delete(administratorAuditLogs).where(condition);
  else await db.delete(administratorAuditLogs);
}


export async function getLatestGlobalRoomMessage(accountId: number) {
  const database = await getDb();
  if (!database) return undefined;
  const rows = await database.select().from(globalRoomMessages).where(eq(globalRoomMessages.accountId, accountId)).orderBy(desc(globalRoomMessages.createdAt)).limit(1);
  return rows[0];
}

export async function hasRecentGlobalRoomReport(reporterAccountId: number, reportedAccountId: number, windowMs = 10 * 60 * 1000) {
  const database = await getDb();
  if (!database) return false;
  const rows = await database.select().from(globalRoomReports).where(and(eq(globalRoomReports.reporterAccountId, reporterAccountId), eq(globalRoomReports.reportedAccountId, reportedAccountId))).orderBy(desc(globalRoomReports.createdAt)).limit(1);
  return Boolean(rows[0] && rows[0].createdAt.getTime() >= Date.now() - windowMs);
}

export async function createGlobalRoomReport(values: { reporterAccountId: number; reporterUsername: string; reportedAccountId: number; reportedUsername: string; reportedDisplayName: string; reason: "spam" | "harassment" | "harmful" | "other"; details?: string; contextMessage?: string; priority?: "normal" | "high" }) {
  const database = await getDb();
  if (!database) throw new Error("Database laporan Room Global belum tersedia.");
  const result = await database.insert(globalRoomReports).values({ ...values, details: values.details ?? null, contextMessage: values.contextMessage ?? null, priority: values.priority ?? "normal" });
  return Number(result[0].insertId);
}

export async function listGlobalRoomReports(status?: "pending" | "reviewing" | "resolved" | "dismissed") {
  const database = await getDb();
  if (!database) return [];
  const rows = await database.select().from(globalRoomReports).where(isNull(globalRoomReports.deletedAt)).orderBy(desc(globalRoomReports.createdAt));
  return status ? rows.filter((row) => row.status === status) : rows;
}

export async function softDeleteGlobalRoomReports(reportIds: number[] | "all", deletedBy: string) {
  const database = await getDb();
  if (!database) throw new Error("Database laporan Room Global belum tersedia.");
  const condition = reportIds === "all" ? isNull(globalRoomReports.deletedAt) : and(isNull(globalRoomReports.deletedAt), reportIds.length ? or(...reportIds.map((id) => eq(globalRoomReports.id, id))) : eq(globalRoomReports.id, -1));
  await database.update(globalRoomReports).set({ deletedAt: new Date(), deletedBy }).where(condition);
}

export async function updateGlobalRoomReport(reportId: number, values: { status: "reviewing" | "resolved" | "dismissed"; reviewedBy: string }) {
  const database = await getDb();
  if (!database) throw new Error("Database laporan Room Global belum tersedia.");
  await database.update(globalRoomReports).set({ status: values.status, reviewedBy: values.reviewedBy, reviewedAt: new Date() }).where(eq(globalRoomReports.id, reportId));
}

export async function getGlobalRoomConsent(accountId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(globalRoomConsents).where(eq(globalRoomConsents.accountId, accountId)).limit(1);
  return rows[0];
}

export const GLOBAL_ROOM_TERMS_VERSION = "2026-08-v1";

export async function saveGlobalRoomConsent(accountId: number, ageConfirmed: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  await db.insert(globalRoomConsents).values({ accountId, ageConfirmed, termsVersion: GLOBAL_ROOM_TERMS_VERSION }).onDuplicateKeyUpdate({ set: { acceptedAt: new Date(), ageConfirmed, termsVersion: GLOBAL_ROOM_TERMS_VERSION } });
}

export async function listGlobalRoomMessages(accountId: number, limit = 80) {
  const db = await getDb();
  if (!db) return [];
  const blocked = await db.select({ blockedAccountId: globalRoomBlocks.blockedAccountId }).from(globalRoomBlocks).where(eq(globalRoomBlocks.blockerAccountId, accountId));
  const blockedIds = new Set(blocked.map((item) => item.blockedAccountId));
  const rows = await db.select().from(globalRoomMessages).orderBy(desc(globalRoomMessages.createdAt)).limit(Math.min(Math.max(limit, 1), 100));
  const accounts = await db.select({ id: manualAccounts.id, featuredPhotoUris: manualAccounts.featuredPhotoUris, isVerified: manualAccounts.isVerified }).from(manualAccounts);
  const avatarByAccountId = new Map(accounts.map((account) => {
    let avatarUri: string | null = null;
    if (account.featuredPhotoUris) {
      try { const parsed = JSON.parse(account.featuredPhotoUris); avatarUri = Array.isArray(parsed) && typeof parsed[0] === "string" ? parsed[0] : null; } catch { avatarUri = null; }
    }
    return [account.id, avatarUri] as const;
  }));
  const reactionRows = await db.select().from(globalRoomMessageReactions);
  const reactionSummary = new Map<number, Record<string, number>>();
  for (const reaction of reactionRows) { const current = reactionSummary.get(reaction.messageId) ?? {}; current[reaction.emoji] = (current[reaction.emoji] ?? 0) + 1; reactionSummary.set(reaction.messageId, current); }
  return rows.filter((row) => !blockedIds.has(row.accountId)).reverse().map((row) => ({ ...row, avatarUri: avatarByAccountId.get(row.accountId) ?? null, isVerified: row.accountId === 0 ? true : Boolean(accounts.find((account) => account.id === row.accountId)?.isVerified), reactions: reactionSummary.get(row.id) ?? {} }));
}

export async function createGlobalRoomMessage(values: { accountId: number; publicId: string; displayName: string; content: string; replyToId?: number | null; replyToDisplayName?: string | null; replyToContent?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  const result = await db.insert(globalRoomMessages).values(values);
  return Number(result[0].insertId);
}
export async function getPinnedGlobalRoomMessage() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(globalRoomMessages).where(and(isNotNull(globalRoomMessages.pinnedAt), isNull(globalRoomMessages.deletedAt))).orderBy(desc(globalRoomMessages.pinnedAt)).limit(1);
  return rows[0] ?? null;
}
export async function setGlobalRoomMessagePinned(messageId: number, pinned: boolean, pinnedBy: string) {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  if (pinned) {
    await db.update(globalRoomMessages).set({ pinnedAt: null, pinnedBy: null });
    const result = await db.update(globalRoomMessages).set({ pinnedAt: new Date(), pinnedBy }).where(eq(globalRoomMessages.id, messageId));
    return Number(result[0].affectedRows ?? 0) > 0;
  }
  const result = await db.update(globalRoomMessages).set({ pinnedAt: null, pinnedBy: null }).where(eq(globalRoomMessages.id, messageId));
  return Number(result[0].affectedRows ?? 0) > 0;
}
export async function toggleGlobalRoomMessageReaction(messageId: number, accountId: number, emoji: string) {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  const existing = await db.select().from(globalRoomMessageReactions).where(and(eq(globalRoomMessageReactions.messageId, messageId), eq(globalRoomMessageReactions.accountId, accountId))).limit(1);
  if (existing[0]?.emoji === emoji) { await db.delete(globalRoomMessageReactions).where(eq(globalRoomMessageReactions.id, existing[0].id)); return { active: false }; }
  if (existing[0]) await db.update(globalRoomMessageReactions).set({ emoji }).where(eq(globalRoomMessageReactions.id, existing[0].id));
  else await db.insert(globalRoomMessageReactions).values({ messageId, accountId, emoji });
  return { active: true };
}
export async function getGlobalRoomUserStatus(accountId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(globalRoomUserStatus).where(eq(globalRoomUserStatus.accountId, accountId)).limit(1);
  return rows[0] ?? null;
}
export async function saveGlobalRoomUserStatus(accountId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  if (!status.trim()) { await db.delete(globalRoomUserStatus).where(eq(globalRoomUserStatus.accountId, accountId)); return null; }
  await db.insert(globalRoomUserStatus).values({ accountId, status: status.trim().slice(0, 80) }).onDuplicateKeyUpdate({ set: { status: status.trim().slice(0, 80), updatedAt: new Date() } });
  return getGlobalRoomUserStatus(accountId);
}
export async function deleteAllGlobalRoomMessagesByAdmin() {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  const result = await db.update(globalRoomMessages).set({ content: "Pesan dihapus admin", replyToId: null, replyToDisplayName: null, replyToContent: null, deletedAt: new Date(), pinnedAt: null, pinnedBy: null }).where(isNull(globalRoomMessages.deletedAt));
  return Number(result[0].affectedRows ?? 0);
}

export async function deleteGlobalRoomMessagesByAdmin(messageIds: number[] | "all") {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  if (messageIds === "all") return deleteAllGlobalRoomMessagesByAdmin();
  if (!messageIds.length) return 0;
  const result = await db.update(globalRoomMessages).set({ content: "Pesan dihapus admin", replyToId: null, replyToDisplayName: null, replyToContent: null, deletedAt: new Date(), pinnedAt: null, pinnedBy: null }).where(and(isNull(globalRoomMessages.deletedAt), or(...messageIds.map((id) => eq(globalRoomMessages.id, id)))));
  return Number(result[0].affectedRows ?? 0);
}
export async function deleteGlobalRoomMessageByAdmin(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  const result = await db.update(globalRoomMessages).set({ content: "Pesan dihapus admin", replyToId: null, replyToDisplayName: null, replyToContent: null }).where(eq(globalRoomMessages.id, messageId));
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function deleteGlobalRoomMessageByOwner(messageId: number, accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  const existing = await db.select().from(globalRoomMessages).where(and(eq(globalRoomMessages.id, messageId), eq(globalRoomMessages.accountId, accountId))).limit(1);
  const message = existing[0];
  if (!message || message.deletedAt) return false;
  const result = await db.update(globalRoomMessages).set({ content: "Pesan dihapus oleh Anda", replyToId: null, replyToDisplayName: null, replyToContent: null, deletedAt: new Date(), deletedOriginalContent: message.content, deletedOriginalReplyToId: message.replyToId, deletedOriginalReplyToDisplayName: message.replyToDisplayName, deletedOriginalReplyToContent: message.replyToContent }).where(and(eq(globalRoomMessages.id, messageId), eq(globalRoomMessages.accountId, accountId)));
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function undoGlobalRoomMessageDelete(messageId: number, accountId: number, windowSeconds = 8) {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  const existing = await db.select().from(globalRoomMessages).where(and(eq(globalRoomMessages.id, messageId), eq(globalRoomMessages.accountId, accountId))).limit(1);
  const message = existing[0];
  if (!message?.deletedAt || !message.deletedOriginalContent) return false;
  if (Date.now() - message.deletedAt.getTime() > windowSeconds * 1000) return false;
  const result = await db.update(globalRoomMessages).set({ content: message.deletedOriginalContent, replyToId: message.deletedOriginalReplyToId, replyToDisplayName: message.deletedOriginalReplyToDisplayName, replyToContent: message.deletedOriginalReplyToContent, deletedAt: null, deletedOriginalContent: null, deletedOriginalReplyToId: null, deletedOriginalReplyToDisplayName: null, deletedOriginalReplyToContent: null }).where(and(eq(globalRoomMessages.id, messageId), eq(globalRoomMessages.accountId, accountId), eq(globalRoomMessages.deletedAt, message.deletedAt)));
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function blockGlobalRoomAccount(blockerAccountId: number, blockedAccountId: number, durationSeconds?: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  if (blockerAccountId === blockedAccountId) return;
  const expiresAt = durationSeconds && durationSeconds > 0 ? new Date(Date.now() + durationSeconds * 1000) : null;
  const existing = await db.select().from(globalRoomBlocks).where(and(eq(globalRoomBlocks.blockerAccountId, blockerAccountId), eq(globalRoomBlocks.blockedAccountId, blockedAccountId))).limit(1);
  if (!existing[0]) await db.insert(globalRoomBlocks).values({ blockerAccountId, blockedAccountId, expiresAt });
  else await db.update(globalRoomBlocks).set({ expiresAt }).where(eq(globalRoomBlocks.id, existing[0].id));
}

export async function listGlobalRoomBlocks(blockerAccountId: number) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const rows = await db.select().from(globalRoomBlocks).where(eq(globalRoomBlocks.blockerAccountId, blockerAccountId));
  const active = rows.filter((row) => !row.expiresAt || row.expiresAt > now);
  const expired = rows.filter((row) => row.expiresAt && row.expiresAt <= now);
  if (expired.length) await Promise.all(expired.map((row) => db.delete(globalRoomBlocks).where(eq(globalRoomBlocks.id, row.id))));
  return active;
}

export async function isGlobalRoomBlocked(blockerAccountId: number, blockedAccountId: number) {
  const rows = await listGlobalRoomBlocks(blockerAccountId);
  return rows.some((row) => row.blockedAccountId === blockedAccountId);
}

export async function unblockGlobalRoomAccount(blockerAccountId: number, blockedAccountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database Room Global belum tersedia.");
  await db.delete(globalRoomBlocks).where(and(eq(globalRoomBlocks.blockerAccountId, blockerAccountId), eq(globalRoomBlocks.blockedAccountId, blockedAccountId)));
}


export async function updateManualAccountProfile(accountId: number, values: { bio: string; featuredPhotoUris: string[] }) {
  const db = await getDb();
  if (!db) throw new Error("Database profil belum tersedia.");
  await db.update(manualAccounts).set({ bio: values.bio.slice(0, 280), featuredPhotoUris: JSON.stringify(values.featuredPhotoUris) }).where(eq(manualAccounts.id, accountId));
}


const GLOBAL_ROOM_KEY = "global";
const GLOBAL_ROOM_ACTIVE_WINDOW_MS = 2 * 60 * 1000;

export async function enterGlobalRoom(accountId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database Room Global belum tersedia.");
  const setting = await database.select().from(globalRoomSettings).where(eq(globalRoomSettings.roomKey, GLOBAL_ROOM_KEY)).limit(1);
  if (setting[0]?.locked) throw new Error("Room Global sedang dikunci moderator.");
  await database.insert(globalRoomPresence).values({ accountId, joinedAt: new Date(), lastSeenAt: new Date(), leftAt: null }).onDuplicateKeyUpdate({ set: { lastSeenAt: new Date(), leftAt: null } });
  await database.insert(globalRoomModeration).values({ accountId, micMuted: false, roomAudioBlocked: false, unmuteRequested: false }).onDuplicateKeyUpdate({ set: { micMuted: false, roomAudioBlocked: false, unmuteRequested: false, updatedAt: new Date() } });
}

export async function heartbeatGlobalRoom(accountId: number) {
  const database = await getDb();
  if (!database) return;
  await database.update(globalRoomPresence).set({ lastSeenAt: new Date(), leftAt: null }).where(eq(globalRoomPresence.accountId, accountId));
}

export async function leaveGlobalRoom(accountId: number) {
  const database = await getDb();
  if (!database) return;
  await database.update(globalRoomPresence).set({ leftAt: new Date() }).where(eq(globalRoomPresence.accountId, accountId));
  await database.delete(globalRoomModeration).where(eq(globalRoomModeration.accountId, accountId));
}

export function selectActiveGlobalRoomParticipants(
  presenceRows: Array<typeof globalRoomPresence.$inferSelect>,
  accounts: Array<Pick<typeof manualAccounts.$inferSelect, "id" | "publicId" | "fullName" | "username" | "featuredPhotoUris" | "status"> & { isVerified?: boolean }>,
  now = Date.now(),
) {
  const activeSince = now - GLOBAL_ROOM_ACTIVE_WINDOW_MS;
  const byId = new Map(accounts.map((account) => [account.id, account]));
  return presenceRows
    .filter((presence) => !presence.leftAt && presence.lastSeenAt.getTime() > activeSince)
    .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime())
    .flatMap((presence) => {
      if (presence.accountId === 0) return [{ accountId: 0, publicId: "ADMIN-VAIRA", displayName: "ADMIN VAIRA", username: "admin-vaira", avatarUri: null, role: "Administrator", isVerified: true, lastSeenAt: presence.lastSeenAt }];
      const account = byId.get(presence.accountId);
      if (!account || account.status !== "active") return [];
      let avatarUri: string | null = null;
      if (account.featuredPhotoUris) {
        try {
          const parsed = JSON.parse(account.featuredPhotoUris);
          avatarUri = Array.isArray(parsed) && typeof parsed[0] === "string" ? parsed[0] : null;
        } catch {
          avatarUri = null;
        }
      }
      return [{ accountId: account.id, publicId: account.publicId, displayName: account.fullName, username: account.username, avatarUri, role: account.username === "andik.une" ? "Administrator" : "Peserta", isVerified: Boolean(account.isVerified), lastSeenAt: presence.lastSeenAt }];
    });
}

export async function getGlobalRoomPublicProfile(accountId: number) {
  const database = await getDb();
  if (!database) return null;
  if (accountId === 0) return { publicId: "ADMIN-VAIRA", displayName: "ADMIN VAIRA", bio: "", avatarUri: null, featuredPhotos: [], isVerified: true, lastSeenAt: new Date().toISOString() };
  const activeParticipants = await listGlobalRoomParticipants();
  const account = await database.select({ id: manualAccounts.id, publicId: manualAccounts.publicId, fullName: manualAccounts.fullName, bio: manualAccounts.bio, featuredPhotoUris: manualAccounts.featuredPhotoUris, isVerified: manualAccounts.isVerified, status: manualAccounts.status }).from(manualAccounts).where(eq(manualAccounts.id, accountId)).limit(1);
  const profile = account[0];
  if (!profile || profile.status !== "active") return null;
  let featuredPhotos: string[] = [];
  if (profile.featuredPhotoUris) {
    try { const parsed = JSON.parse(profile.featuredPhotoUris); featuredPhotos = Array.isArray(parsed) ? parsed.filter((uri): uri is string => typeof uri === "string").slice(0, 3) : []; } catch { featuredPhotos = []; }
  }
  const refreshMediaUrl = async (uri: string) => {
    try {
      if (!/^https?:\/\//i.test(uri)) return await storageGetSignedUrl(uri);
      const parsedUrl = new URL(uri);
      const storagePath = parsedUrl.searchParams.get("path") ?? parsedUrl.searchParams.get("key");
      return storagePath ? await storageGetSignedUrl(storagePath) : uri;
    } catch {
      return uri;
    }
  };
  const refreshedPhotos = await Promise.all(featuredPhotos.map(refreshMediaUrl));
  const presence = activeParticipants.find((participant) => participant.accountId === accountId); return { publicId: profile.publicId, displayName: profile.fullName, bio: profile.bio ?? "", avatarUri: refreshedPhotos[0] ?? null, featuredPhotos: refreshedPhotos, isVerified: Boolean(profile.isVerified), lastSeenAt: presence?.lastSeenAt?.toISOString() ?? null };
}

export async function toggleGlobalRoomProfileLove(targetAccountId: number, accountId: number) {
  const database = await getDb();
  if (!database) return { active: false, count: 0, alreadyReacted: false };
  const loveDate = new Date().toISOString().slice(0, 10);
  const existing = await database.select().from(globalRoomProfileLoves).where(and(eq(globalRoomProfileLoves.targetAccountId, targetAccountId), eq(globalRoomProfileLoves.accountId, accountId), eq(globalRoomProfileLoves.loveDate, loveDate))).limit(1);
  if (existing[0]) return { active: true, count: (await database.select().from(globalRoomProfileLoves).where(eq(globalRoomProfileLoves.targetAccountId, targetAccountId))).length, alreadyReacted: true };
  await database.insert(globalRoomProfileLoves).values({ targetAccountId, accountId, loveDate });
  return { active: true, count: (await database.select().from(globalRoomProfileLoves).where(eq(globalRoomProfileLoves.targetAccountId, targetAccountId))).length, alreadyReacted: false };
}
export async function getGlobalRoomProfileSocial(targetAccountId: number, viewerAccountId: number) {
  const database = await getDb();
  if (!database) return { loveCount: 0, lovedToday: false, comments: [] };
  const loveDate = new Date().toISOString().slice(0, 10);
  const loves = await database.select().from(globalRoomProfileLoves).where(eq(globalRoomProfileLoves.targetAccountId, targetAccountId));
  const today = loves.some((love) => love.accountId === viewerAccountId && love.loveDate === loveDate);
  const comments = await database.select().from(globalRoomProfileComments).where(and(eq(globalRoomProfileComments.targetAccountId, targetAccountId), eq(globalRoomProfileComments.status, "approved"))).orderBy(desc(globalRoomProfileComments.createdAt));
  return { loveCount: loves.length, lovedToday: today, comments };
}
export async function createGlobalRoomProfileComment(values: { targetAccountId: number; authorAccountId: number; authorDisplayName: string; content: string }) {
  const database = await getDb();
  if (!database) return null;
  const result = await database.insert(globalRoomProfileComments).values({ ...values, status: "pending" });
  return Number(result[0].insertId);
}
export async function listPendingGlobalRoomProfileComments() {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(globalRoomProfileComments).where(eq(globalRoomProfileComments.status, "pending")).orderBy(desc(globalRoomProfileComments.createdAt));
}
export async function moderateGlobalRoomProfileComment(commentId: number, status: "approved" | "rejected", reviewedBy: string) {
  const database = await getDb();
  if (!database) return false;
  await database.update(globalRoomProfileComments).set({ status, reviewedAt: new Date(), reviewedBy }).where(eq(globalRoomProfileComments.id, commentId));
  return true;
}
export async function listGlobalRoomParticipants() {
  const database = await getDb();
  if (!database) return [];
  const presenceRows = await database.select().from(globalRoomPresence);
  const accounts = await database.select({ id: manualAccounts.id, publicId: manualAccounts.publicId, fullName: manualAccounts.fullName, username: manualAccounts.username, featuredPhotoUris: manualAccounts.featuredPhotoUris, status: manualAccounts.status }).from(manualAccounts);
  return selectActiveGlobalRoomParticipants(presenceRows, accounts);
}

export async function getGlobalRoomParticipantCount() {
  const database = await getDb();
  if (!database) return 0;
  const activeSince = new Date(Date.now() - GLOBAL_ROOM_ACTIVE_WINDOW_MS);
  const rows = await database.select({ accountId: globalRoomPresence.accountId }).from(globalRoomPresence).where(and(isNull(globalRoomPresence.leftAt), gt(globalRoomPresence.lastSeenAt, activeSince)));
  return rows.length;
}

export async function getGlobalRoomModeration(accountId: number) {
  const database = await getDb();
  if (!database) return { active: false, micMuted: true, roomAudioBlocked: false, unmuteRequested: false, roomLocked: false };
  const [presence, moderation, setting] = await Promise.all([
    database.select().from(globalRoomPresence).where(eq(globalRoomPresence.accountId, accountId)).limit(1),
    database.select().from(globalRoomModeration).where(eq(globalRoomModeration.accountId, accountId)).limit(1),
    database.select().from(globalRoomSettings).where(eq(globalRoomSettings.roomKey, GLOBAL_ROOM_KEY)).limit(1),
  ]);
  const active = Boolean(presence[0] && !presence[0].leftAt && presence[0].lastSeenAt.getTime() >= Date.now() - GLOBAL_ROOM_ACTIVE_WINDOW_MS);
  return { active, micMuted: moderation[0]?.micMuted ?? true, roomAudioBlocked: moderation[0]?.roomAudioBlocked ?? false, unmuteRequested: moderation[0]?.unmuteRequested ?? false, roomLocked: setting[0]?.locked ?? false };
}

export async function updateGlobalRoomModeration(accountId: number, values: { micMuted?: boolean; roomAudioBlocked?: boolean; unmuteRequested?: boolean; reason?: string | null; updatedBy: string }) {
  const database = await getDb();
  if (!database) throw new Error("Database Room Global belum tersedia.");
  const presence = await database.select().from(globalRoomPresence).where(eq(globalRoomPresence.accountId, accountId)).limit(1);
  if (!presence[0] || presence[0].leftAt || presence[0].lastSeenAt.getTime() < Date.now() - GLOBAL_ROOM_ACTIVE_WINDOW_MS) throw new Error("Peserta tidak sedang aktif di Room Global.");
  await database.insert(globalRoomModeration).values({ accountId, micMuted: values.micMuted ?? true, roomAudioBlocked: values.roomAudioBlocked ?? false, unmuteRequested: values.unmuteRequested ?? false, reason: values.reason ?? null, updatedBy: values.updatedBy }).onDuplicateKeyUpdate({ set: { ...values, updatedBy: values.updatedBy, updatedAt: new Date() } });
}

export async function getGlobalRoomUserSettings(accountId: number) {
  const database = await getDb();
  if (!database) return { bubbleScale: 100, bubbleGap: 8, audioLabelsVisible: false };
  const rows = await database.select().from(globalRoomUserSettings).where(eq(globalRoomUserSettings.accountId, accountId)).limit(1);
  const row = rows[0];
  return { bubbleScale: Math.min(120, Math.max(75, row?.bubbleScale ?? 100)), bubbleGap: Math.min(18, Math.max(4, row?.bubbleGap ?? 8)), audioLabelsVisible: row?.audioLabelsVisible ?? false };
}

export async function updateGlobalRoomUserSettings(accountId: number, values: { bubbleScale: number; bubbleGap: number; audioLabelsVisible: boolean }) {
  const database = await getDb();
  if (!database) throw new Error("Database Room Global belum tersedia.");
  await database.insert(globalRoomUserSettings).values({ accountId, bubbleScale: values.bubbleScale, bubbleGap: values.bubbleGap, audioLabelsVisible: values.audioLabelsVisible }).onDuplicateKeyUpdate({ set: { bubbleScale: values.bubbleScale, bubbleGap: values.bubbleGap, audioLabelsVisible: values.audioLabelsVisible, updatedAt: new Date() } });
}

export async function getGlobalRoomSettings() {
  const database = await getDb();
  if (!database) return { locked: false, bubbleScale: 100, bubbleGap: 8, bubbleScope: "admin" as const };
  const rows = await database.select().from(globalRoomSettings).where(eq(globalRoomSettings.roomKey, GLOBAL_ROOM_KEY)).limit(1);
  const row = rows[0];
  return { locked: row?.locked ?? false, bubbleScale: Math.min(120, Math.max(75, row?.bubbleScale ?? 100)), bubbleGap: Math.min(18, Math.max(4, row?.bubbleGap ?? 8)), bubbleScope: row?.bubbleScope ?? "admin" };
}

export async function updateGlobalRoomBubbleSettings(values: { bubbleScale: number; bubbleGap: number; bubbleScope: "admin" | "all"; updatedBy: string }) {
  const database = await getDb();
  if (!database) throw new Error("Database Room Global belum tersedia.");
  await database.insert(globalRoomSettings).values({ roomKey: GLOBAL_ROOM_KEY, bubbleScale: values.bubbleScale, bubbleGap: values.bubbleGap, bubbleScope: values.bubbleScope, updatedBy: values.updatedBy }).onDuplicateKeyUpdate({ set: { bubbleScale: values.bubbleScale, bubbleGap: values.bubbleGap, bubbleScope: values.bubbleScope, updatedBy: values.updatedBy, updatedAt: new Date() } });
}

export async function updateGlobalRoomLock(locked: boolean, updatedBy: string) {
  const database = await getDb();
  if (!database) throw new Error("Database Room Global belum tersedia.");
  await database.insert(globalRoomSettings).values({ roomKey: GLOBAL_ROOM_KEY, locked, updatedBy }).onDuplicateKeyUpdate({ set: { locked, updatedBy, updatedAt: new Date() } });
}
