import { boolean, int, mediumtext, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const financeSnapshots = mysqlTable("financeSnapshots", {
  userId: int("userId").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinanceSnapshot = typeof financeSnapshots.$inferSelect;

/** Snapshot pusat yang hanya digunakan untuk uji sinkronisasi aplikasi pribadi. */
export const globalTestSnapshots = mysqlTable("globalTestSnapshots", {
  scope: varchar("scope", { length: 40 }).primaryKey(),
  payload: text("payload").notNull(),
  updatedByUserId: int("updatedByUserId").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GlobalTestSnapshot = typeof globalTestSnapshots.$inferSelect;

/** Persetujuan pengguna sebelum memasuki Room Global. */
export const globalRoomConsents = mysqlTable("globalRoomConsents", {
  accountId: int("accountId").primaryKey(),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
  termsVersion: varchar("termsVersion", { length: 24 }).default("2026-08-v1").notNull(),
  ageConfirmed: boolean("ageConfirmed").default(false).notNull(),
});
export type GlobalRoomConsent = typeof globalRoomConsents.$inferSelect;

/** Pesan teks Room Global; audio real-time tidak diaktifkan tanpa provider khusus. */
export const globalRoomMessages = mysqlTable("globalRoomMessages", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  publicId: varchar("publicId", { length: 32 }).notNull(),
  displayName: varchar("displayName", { length: 120 }).notNull(),
  content: text("content").notNull(),
  replyToId: int("replyToId"),
  replyToDisplayName: varchar("replyToDisplayName", { length: 120 }),
  replyToContent: text("replyToContent"),
  deletedAt: timestamp("deletedAt"),
  deletedOriginalContent: text("deletedOriginalContent"),
  deletedOriginalReplyToId: int("deletedOriginalReplyToId"),
  deletedOriginalReplyToDisplayName: varchar("deletedOriginalReplyToDisplayName", { length: 120 }),
  deletedOriginalReplyToContent: text("deletedOriginalReplyToContent"),
  pinnedAt: timestamp("pinnedAt"),
  pinnedBy: varchar("pinnedBy", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GlobalRoomMessage = typeof globalRoomMessages.$inferSelect;

/** Reaksi ringan pada pesan Room Global; satu akun dapat mengganti atau menghapus reaksinya. */
export const globalRoomMessageReactions = mysqlTable("globalRoomMessageReactions", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  accountId: int("accountId").notNull(),
  emoji: varchar("emoji", { length: 16 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GlobalRoomMessageReaction = typeof globalRoomMessageReactions.$inferSelect;

/** Reaksi love pada profil ADMIN VAIRA; satu akun maksimal sekali setiap hari. */
export const globalRoomProfileLoves = mysqlTable("globalRoomProfileLoves", {
  id: int("id").autoincrement().primaryKey(),
  targetAccountId: int("targetAccountId").notNull(),
  accountId: int("accountId").notNull(),
  loveDate: varchar("loveDate", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GlobalRoomProfileLove = typeof globalRoomProfileLoves.$inferSelect;

/** Komentar foto profil; komentar baru selalu menunggu tinjauan administrator. */
export const globalRoomProfileComments = mysqlTable("globalRoomProfileComments", {
  id: int("id").autoincrement().primaryKey(),
  targetAccountId: int("targetAccountId").notNull(),
  authorAccountId: int("authorAccountId").notNull(),
  authorDisplayName: varchar("authorDisplayName", { length: 120 }).notNull(),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: varchar("reviewedBy", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GlobalRoomProfileComment = typeof globalRoomProfileComments.$inferSelect;

/** Status singkat pengguna Room Global; bukan followers dan bukan status kehadiran. */
export const globalRoomUserStatus = mysqlTable("globalRoomUserStatus", {
  accountId: int("accountId").primaryKey(),
  status: varchar("status", { length: 80 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GlobalRoomUserStatus = typeof globalRoomUserStatus.$inferSelect;

/** Peserta yang masih aktif di Room Global; heartbeat menentukan masa berlaku kontrol moderator. */
export const globalRoomPresence = mysqlTable("globalRoomPresence", {
  accountId: int("accountId").primaryKey(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().onUpdateNow().notNull(),
  leftAt: timestamp("leftAt"),
});
export type GlobalRoomPresence = typeof globalRoomPresence.$inferSelect;

/** Status moderasi yang berlaku selama peserta aktif di Room Global. */
export const globalRoomModeration = mysqlTable("globalRoomModeration", {
  accountId: int("accountId").primaryKey(),
  micMuted: boolean("micMuted").default(true).notNull(),
  roomAudioBlocked: boolean("roomAudioBlocked").default(false).notNull(),
  unmuteRequested: boolean("unmuteRequested").default(false).notNull(),
  reason: varchar("reason", { length: 240 }),
  updatedBy: varchar("updatedBy", { length: 80 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GlobalRoomModeration = typeof globalRoomModeration.$inferSelect;

/** Pengaturan tingkat ruang; moderator dapat mengunci room tanpa mengaktifkan perangkat peserta. */
export const globalRoomSettings = mysqlTable("globalRoomSettings", {
  roomKey: varchar("roomKey", { length: 40 }).primaryKey(),
  locked: boolean("locked").default(false).notNull(),
  bubbleScale: int("bubbleScale").default(100).notNull(),
  bubbleGap: int("bubbleGap").default(8).notNull(),
  bubbleScope: mysqlEnum("bubbleScope", ["admin", "all"]).default("admin").notNull(),
  updatedBy: varchar("updatedBy", { length: 80 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GlobalRoomSetting = typeof globalRoomSettings.$inferSelect;

/** Preferensi tampilan Room Global per akun; tidak mengubah moderasi atau isi pesan. */
export const globalRoomUserSettings = mysqlTable("globalRoomUserSettings", {
  accountId: int("accountId").primaryKey(),
  bubbleScale: int("bubbleScale").default(100).notNull(),
  bubbleGap: int("bubbleGap").default(8).notNull(),
  audioLabelsVisible: boolean("audioLabelsVisible").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GlobalRoomUserSetting = typeof globalRoomUserSettings.$inferSelect;

/** Blokir personal peserta Room Global. */
export const globalRoomBlocks = mysqlTable("globalRoomBlocks", {
  id: int("id").autoincrement().primaryKey(),
  blockerAccountId: int("blockerAccountId").notNull(),
  blockedAccountId: int("blockedAccountId").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GlobalRoomBlock = typeof globalRoomBlocks.$inferSelect;

/** Laporan peserta Room Global yang dapat ditinjau administrator. */
export const globalRoomReports = mysqlTable("globalRoomReports", {
  id: int("id").autoincrement().primaryKey(),
  reporterAccountId: int("reporterAccountId").notNull(),
  reporterUsername: varchar("reporterUsername", { length: 40 }).notNull(),
  reportedAccountId: int("reportedAccountId").notNull(),
  reportedUsername: varchar("reportedUsername", { length: 40 }).notNull(),
  reportedDisplayName: varchar("reportedDisplayName", { length: 120 }).notNull(),
  reason: mysqlEnum("reason", ["spam", "harassment", "harmful", "other"]).notNull(),
  details: text("details"),
  contextMessage: text("contextMessage"),
  priority: mysqlEnum("priority", ["normal", "high"]).default("normal").notNull(),
  status: mysqlEnum("status", ["pending", "reviewing", "resolved", "dismissed"]).default("pending").notNull(),
  reviewedBy: varchar("reviewedBy", { length: 80 }),
  reviewedAt: timestamp("reviewedAt"),
  deletedAt: timestamp("deletedAt"),
  deletedBy: varchar("deletedBy", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GlobalRoomReport = typeof globalRoomReports.$inferSelect;
export type InsertGlobalRoomReport = typeof globalRoomReports.$inferInsert;

/** Grup obrolan privat: hanya member aktif yang dapat melihat pesan dan profil grup. */
export const privateChatGroups = mysqlTable("privateChatGroups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  publicGroupId: varchar("publicGroupId", { length: 24 }).notNull(),
  publicGroupIdUpdatedAt: timestamp("publicGroupIdUpdatedAt").defaultNow().notNull(),
  photoStorageKey: varchar("photoStorageKey", { length: 320 }),
  createdByAccountId: int("createdByAccountId").notNull(),
  adminAccountId: int("adminAccountId").notNull(),
  status: mysqlEnum("status", ["active", "frozen", "deleted"]).default("active").notNull(),
  frozenAt: timestamp("frozenAt"),
  frozenBy: varchar("frozenBy", { length: 80 }),
  deletedAt: timestamp("deletedAt"),
  deletedBy: varchar("deletedBy", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("privateChatGroups_public_group_id_unique").on(table.publicGroupId)]);
export type PrivateChatGroup = typeof privateChatGroups.$inferSelect;

/** Satu pengguna dapat menjadi anggota aktif maksimal 10 grup privat. */
export const privateChatGroupMembers = mysqlTable("privateChatGroupMembers", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  accountId: int("accountId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("privateChatGroupMembers_group_account_unique").on(table.groupId, table.accountId)]);
export type PrivateChatGroupMember = typeof privateChatGroupMembers.$inferSelect;

/** Member yang dikeluarkan tidak dapat menggunakan link lama sampai admin memutar link undangan. */
export const privateChatGroupRemovedMembers = mysqlTable("privateChatGroupRemovedMembers", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  accountId: int("accountId").notNull(),
  blockedAt: timestamp("blockedAt").defaultNow().notNull(),
  removedByAccountId: int("removedByAccountId").notNull(),
}, (table) => [uniqueIndex("privateChatGroupRemovedMembers_group_account_unique").on(table.groupId, table.accountId)]);
export type PrivateChatGroupRemovedMember = typeof privateChatGroupRemovedMembers.$inferSelect;

/** Pesan grup privat menggunakan struktur balasan yang sama dengan Room Global. */
export const privateChatGroupMessages = mysqlTable("privateChatGroupMessages", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  accountId: int("accountId").notNull(),
  publicId: varchar("publicId", { length: 32 }).notNull(),
  displayName: varchar("displayName", { length: 120 }).notNull(),
  content: text("content").notNull(),
  replyToId: int("replyToId"),
  replyToDisplayName: varchar("replyToDisplayName", { length: 120 }),
  replyToContent: text("replyToContent"),
  deletedAt: timestamp("deletedAt"),
  deletedOriginalContent: text("deletedOriginalContent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PrivateChatGroupMessage = typeof privateChatGroupMessages.$inferSelect;

/** Tautan undangan bersifat rahasia, dapat diputar ulang admin, dan hanya berlaku untuk grup aktif. */
export const privateChatGroupInvites = mysqlTable("privateChatGroupInvites", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  createdByAccountId: int("createdByAccountId").notNull(),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PrivateChatGroupInvite = typeof privateChatGroupInvites.$inferSelect;

/** Arsip AiraXCloud: isi cadangan disimpan sebagai berkas privat, tabel hanya menyimpan metadata aman. */
export const airaxCloudBackups = mysqlTable("airaxCloudBackups", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  username: varchar("username", { length: 40 }).notNull(),
  fileName: varchar("fileName", { length: 180 }).notNull(),
  storageKey: varchar("storageKey", { length: 320 }).notNull().unique(),
  sizeBytes: int("sizeBytes").notNull(),
  status: mysqlEnum("status", ["active", "restricted", "deleted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiraXCloudBackup = typeof airaxCloudBackups.$inferSelect;
export type InsertAiraXCloudBackup = typeof airaxCloudBackups.$inferInsert;

/** Akun manual AiraX; kata sandi dan token cadangan hanya disimpan sebagai hash. */
export const manualAccounts = mysqlTable("manualAccounts", {
  id: int("id").autoincrement().primaryKey(),
  publicId: varchar("publicId", { length: 32 }).unique(),
  bio: varchar("bio", { length: 280 }),
  avatarUri: text("avatarUri"),
  featuredPhotoUris: text("featuredPhotoUris"),
  isVerified: boolean("isVerified").default(false).notNull(),
  createdByAdministrator: boolean("createdByAdministrator").default(false).notNull(),
  fullName: varchar("fullName", { length: 120 }).notNull(),
  username: varchar("username", { length: 40 }).notNull().unique(),
  birthDate: varchar("birthDate", { length: 10 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 32 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  mustChangePassword: boolean("mustChangePassword").default(false).notNull(),
  recoveryTokenHash: varchar("recoveryTokenHash", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "disabled", "blocked", "closing", "blacklisted"]).default("active").notNull(),
  failedLoginAttempts: int("failedLoginAttempts").default(0).notNull(),
  blockedAt: timestamp("blockedAt"),
  loginCooldownUntil: timestamp("loginCooldownUntil"),
  closeRequestedAt: timestamp("closeRequestedAt"),
  blacklistedAt: timestamp("blacklistedAt"),
  termsAcceptedAt: timestamp("termsAcceptedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
});

export type ManualAccount = typeof manualAccounts.$inferSelect;
export type InsertManualAccount = typeof manualAccounts.$inferInsert;

/** Ringkasan diagnostik SPCA; hanya menyimpan kode masalah dan ringkasan tersanitasi, bukan pesan, token, atau data keuangan. */
export const spcaDiagnosticReports = mysqlTable("spcaDiagnosticReports", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).notNull(),
  codes: varchar("codes", { length: 500 }).notNull(),
  summary: varchar("summary", { length: 700 }).notNull(),
  status: mysqlEnum("status", ["open", "resolved"]).default("open").notNull(),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: varchar("resolvedBy", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("spcaDiagnosticReports_account_created_index").on(table.accountId, table.createdAt)]);
export type SpcaDiagnosticReport = typeof spcaDiagnosticReports.$inferSelect;

/** Token sesi tidak disimpan mentah; server hanya menyimpan hash token. */
export const manualAccountSessions = mysqlTable("manualAccountSessions", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManualAccountSession = typeof manualAccountSessions.$inferSelect;

/** Riwayat percakapan Aira tersimpan per akun manual dan mode, agar tersedia kembali setelah login. */
export const airaConversationHistories = mysqlTable("airaConversationHistories", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  conversationId: varchar("conversationId", { length: 96 }).notNull(),
  mode: mysqlEnum("mode", ["aira", "hot_pro", "scientist"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  messagesJson: mediumtext("messagesJson").notNull(),
  isPrivate: boolean("isPrivate").default(false).notNull(),
  archivedAt: timestamp("archivedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  accountConversationUnique: uniqueIndex("aira_history_account_conversation_unique").on(table.accountId, table.conversationId),
}));
export type AiraConversationHistory = typeof airaConversationHistories.$inferSelect;

/** Token akses layanan AI; hanya hash yang disimpan, token mentah dikembalikan sekali saat dibuat administrator. */
export const airaAccessTokens = mysqlTable("airaAccessTokens", {
  id: int("id").autoincrement().primaryKey(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  criterion: mysqlEnum("criterion", ["pro", "premium", "admin"]).notNull(),
  durationDays: int("durationDays"),
  expiresAt: timestamp("expiresAt"),
  redeemedAt: timestamp("redeemedAt"),
  redeemedAccountId: int("redeemedAccountId"),
  revokedAt: timestamp("revokedAt"),
  revokedBy: varchar("revokedBy", { length: 80 }),
  tokenHistoryHiddenAt: timestamp("tokenHistoryHiddenAt"),
  redeemHistoryHiddenAt: timestamp("redeemHistoryHiddenAt"),
  createdBy: varchar("createdBy", { length: 80 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AiraAccessToken = typeof airaAccessTokens.$inferSelect;

/** Pengaturan retensi riwayat token; menyembunyikan riwayat tanpa mencabut akses token aktif. */
export const administratorTokenSettings = mysqlTable("administratorTokenSettings", {
  settingId: int("settingId").primaryKey(),
  autoDeleteDays: int("autoDeleteDays").default(0).notNull(),
  updatedBy: varchar("updatedBy", { length: 80 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AdministratorTokenSetting = typeof administratorTokenSettings.$inferSelect;

/** Jejak tindakan administratif; tidak menyimpan kata sandi, token, atau isi cadangan pengguna. */
export const administratorAuditLogs = mysqlTable("administratorAuditLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminUsername: varchar("adminUsername", { length: 80 }).notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  targetType: varchar("targetType", { length: 48 }).notNull(),
  targetId: varchar("targetId", { length: 100 }).notNull(),
  targetLabel: varchar("targetLabel", { length: 220 }).notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdministratorAuditLog = typeof administratorAuditLogs.$inferSelect;
export type InsertAdministratorAuditLog = typeof administratorAuditLogs.$inferInsert;
