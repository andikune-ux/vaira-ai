import { and, desc, eq, isNull } from "drizzle-orm";

import {
  manualAccounts,
  privateChatGroupInvites,
  privateChatGroupMembers,
  privateChatGroupMessages,
  privateChatGroups,
} from "../drizzle/schema";
import { getDb } from "./db";

export const PRIVATE_GROUP_MEMBERSHIP_LIMIT = 10;

function normalizedName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 80);
}

async function databaseOrThrow() {
  const database = await getDb();
  if (!database) throw new Error("Database grup privat belum tersedia.");
  return database;
}

async function groupOrThrow(groupId: number) {
  const database = await databaseOrThrow();
  const rows = await database.select().from(privateChatGroups).where(eq(privateChatGroups.id, groupId)).limit(1);
  if (!rows[0]) throw new Error("Grup tidak ditemukan.");
  return rows[0];
}

export async function getPrivateGroupMembership(groupId: number, accountId: number) {
  const database = await databaseOrThrow();
  const rows = await database.select().from(privateChatGroupMembers).where(and(eq(privateChatGroupMembers.groupId, groupId), eq(privateChatGroupMembers.accountId, accountId))).limit(1);
  return rows[0] ?? null;
}

export async function countActivePrivateGroupMemberships(accountId: number) {
  const database = await databaseOrThrow();
  const memberships = await database.select().from(privateChatGroupMembers).where(eq(privateChatGroupMembers.accountId, accountId));
  const groups = await Promise.all(memberships.map((member) => groupOrThrow(member.groupId).catch(() => null)));
  return groups.filter((group) => group && group.status !== "deleted").length;
}

async function assertCanJoinPrivateGroup(groupId: number, accountId: number) {
  const group = await groupOrThrow(groupId);
  if (group.status === "deleted") throw new Error("Grup sudah dihapus.");
  if (group.status === "frozen") throw new Error("Grup sedang dibekukan Administrator Vaira.");
  const existing = await getPrivateGroupMembership(groupId, accountId);
  if (existing) return { group, alreadyMember: true };
  const count = await countActivePrivateGroupMemberships(accountId);
  if (count >= PRIVATE_GROUP_MEMBERSHIP_LIMIT) throw new Error(`Batas ${PRIVATE_GROUP_MEMBERSHIP_LIMIT} grup aktif telah tercapai. Keluar dari grup lain terlebih dahulu.`);
  return { group, alreadyMember: false };
}

export async function createPrivateGroup(creatorAccountId: number, name: string) {
  const database = await databaseOrThrow();
  const current = await countActivePrivateGroupMemberships(creatorAccountId);
  if (current >= PRIVATE_GROUP_MEMBERSHIP_LIMIT) throw new Error(`Batas ${PRIVATE_GROUP_MEMBERSHIP_LIMIT} grup aktif telah tercapai. Keluar dari grup lain terlebih dahulu.`);
  const title = normalizedName(name);
  if (title.length < 2) throw new Error("Nama grup minimal 2 karakter.");
  const result = await database.insert(privateChatGroups).values({ name: title, createdByAccountId: creatorAccountId, adminAccountId: creatorAccountId, status: "active" });
  const groupId = Number(result[0].insertId);
  await database.insert(privateChatGroupMembers).values({ groupId, accountId: creatorAccountId });
  return getPrivateGroupDetail(groupId, creatorAccountId);
}

export async function listPrivateGroupsForAccount(accountId: number) {
  const database = await databaseOrThrow();
  const memberships = await database.select().from(privateChatGroupMembers).where(eq(privateChatGroupMembers.accountId, accountId)).orderBy(desc(privateChatGroupMembers.joinedAt));
  const result = await Promise.all(memberships.map(async (membership) => {
    const group = await groupOrThrow(membership.groupId).catch(() => null);
    if (!group || group.status === "deleted") return null;
    const members = await database.select().from(privateChatGroupMembers).where(eq(privateChatGroupMembers.groupId, group.id));
    return { id: group.id, name: group.name, status: group.status, adminAccountId: group.adminAccountId, memberCount: members.length, isAdmin: group.adminAccountId === accountId, updatedAt: group.updatedAt.toISOString(), createdAt: group.createdAt.toISOString() };
  }));
  return result.filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export async function getPrivateGroupDetail(groupId: number, viewerAccountId?: number) {
  const database = await databaseOrThrow();
  const group = await groupOrThrow(groupId);
  const memberRows = await database.select().from(privateChatGroupMembers).where(eq(privateChatGroupMembers.groupId, groupId)).orderBy(desc(privateChatGroupMembers.joinedAt));
  const members = await Promise.all(memberRows.map(async (membership) => {
    const accounts = await database.select({ id: manualAccounts.id, publicId: manualAccounts.publicId, fullName: manualAccounts.fullName, username: manualAccounts.username, featuredPhotoUris: manualAccounts.featuredPhotoUris, isVerified: manualAccounts.isVerified }).from(manualAccounts).where(eq(manualAccounts.id, membership.accountId)).limit(1);
    const account = accounts[0];
    return account ? { accountId: account.id, publicId: account.publicId, displayName: account.fullName, username: account.username, avatarUri: parseFirstPhoto(account.featuredPhotoUris), isVerified: account.isVerified, isAdmin: group.adminAccountId === account.id, joinedAt: membership.joinedAt.toISOString() } : null;
  }));
  return {
    id: group.id,
    name: group.name,
    status: group.status,
    adminAccountId: group.adminAccountId,
    createdByAccountId: group.createdByAccountId,
    frozenAt: group.frozenAt?.toISOString() ?? null,
    memberCount: memberRows.length,
    isMember: viewerAccountId ? Boolean(await getPrivateGroupMembership(groupId, viewerAccountId)) : false,
    isAdmin: viewerAccountId === group.adminAccountId,
    members: members.filter((item): item is NonNullable<typeof item> => Boolean(item)),
  };
}

function parseFirstPhoto(raw: string | null) {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) && typeof parsed[0] === "string" ? parsed[0] : null;
  } catch { return null; }
}

export async function updatePrivateGroupName(groupId: number, actorAccountId: number, name: string) {
  const database = await databaseOrThrow();
  const group = await groupOrThrow(groupId);
  if (group.adminAccountId !== actorAccountId) throw new Error("Hanya admin grup yang dapat mengubah nama grup.");
  if (group.status === "deleted") throw new Error("Grup sudah dihapus.");
  const title = normalizedName(name);
  if (title.length < 2) throw new Error("Nama grup minimal 2 karakter.");
  await database.update(privateChatGroups).set({ name: title }).where(eq(privateChatGroups.id, groupId));
  return getPrivateGroupDetail(groupId, actorAccountId);
}

export async function transferPrivateGroupAdmin(groupId: number, actorAccountId: number, targetAccountId: number) {
  const database = await databaseOrThrow();
  const group = await groupOrThrow(groupId);
  if (group.adminAccountId !== actorAccountId) throw new Error("Hanya admin grup yang dapat menyerahkan admin.");
  if (targetAccountId === actorAccountId) throw new Error("Pilih member lain untuk menjadi admin.");
  if (!await getPrivateGroupMembership(groupId, targetAccountId)) throw new Error("Pengguna tujuan bukan member grup.");
  await database.update(privateChatGroups).set({ adminAccountId: targetAccountId }).where(eq(privateChatGroups.id, groupId));
  return getPrivateGroupDetail(groupId, actorAccountId);
}

export async function addPrivateGroupMember(groupId: number, actorAccountId: number, targetAccountId: number) {
  const database = await databaseOrThrow();
  const group = await groupOrThrow(groupId);
  if (group.adminAccountId !== actorAccountId) throw new Error("Hanya admin grup yang dapat menambahkan member.");
  const target = await database.select({ id: manualAccounts.id, status: manualAccounts.status }).from(manualAccounts).where(eq(manualAccounts.id, targetAccountId)).limit(1);
  if (!target[0] || target[0].status !== "active") throw new Error("Akun pengguna tidak tersedia untuk ditambahkan.");
  const permission = await assertCanJoinPrivateGroup(groupId, targetAccountId);
  if (!permission.alreadyMember) await database.insert(privateChatGroupMembers).values({ groupId, accountId: targetAccountId });
  return getPrivateGroupDetail(groupId, actorAccountId);
}

export async function removePrivateGroupMember(groupId: number, actorAccountId: number, targetAccountId: number) {
  const database = await databaseOrThrow();
  const group = await groupOrThrow(groupId);
  if (group.adminAccountId !== actorAccountId) throw new Error("Hanya admin grup yang dapat mengeluarkan member.");
  if (targetAccountId === actorAccountId) throw new Error("Admin tidak dapat mengeluarkan diri sendiri. Gunakan keluar grup.");
  const membership = await getPrivateGroupMembership(groupId, targetAccountId);
  if (!membership) throw new Error("Pengguna bukan member grup.");
  await database.delete(privateChatGroupMembers).where(eq(privateChatGroupMembers.id, membership.id));
  return getPrivateGroupDetail(groupId, actorAccountId);
}

export async function leavePrivateGroup(groupId: number, accountId: number) {
  const database = await databaseOrThrow();
  const group = await groupOrThrow(groupId);
  const membership = await getPrivateGroupMembership(groupId, accountId);
  if (!membership) throw new Error("Anda bukan member grup ini.");
  const members = await database.select().from(privateChatGroupMembers).where(eq(privateChatGroupMembers.groupId, groupId)).orderBy(desc(privateChatGroupMembers.joinedAt));
  const remaining = members.filter((member) => member.accountId !== accountId);
  await database.delete(privateChatGroupMembers).where(eq(privateChatGroupMembers.id, membership.id));
  if (group.adminAccountId === accountId) {
    if (remaining[0]) await database.update(privateChatGroups).set({ adminAccountId: remaining[0].accountId }).where(eq(privateChatGroups.id, groupId));
    else await database.update(privateChatGroups).set({ status: "deleted", deletedAt: new Date(), deletedBy: "system:last-member-left" }).where(eq(privateChatGroups.id, groupId));
  }
  return { success: true, transferredToAccountId: group.adminAccountId === accountId ? remaining[0]?.accountId ?? null : null, groupDeleted: remaining.length === 0 };
}

export async function listPrivateGroupMessages(groupId: number, limit = 100) {
  const database = await databaseOrThrow();
  const messages = await database.select().from(privateChatGroupMessages).where(eq(privateChatGroupMessages.groupId, groupId)).orderBy(desc(privateChatGroupMessages.createdAt)).limit(Math.min(Math.max(limit, 1), 100));
  return messages.reverse().map((message) => ({ ...message, createdAt: message.createdAt.toISOString(), deletedAt: message.deletedAt?.toISOString() ?? null }));
}

export async function sendPrivateGroupMessage(groupId: number, account: { id: number; publicId: string | null; fullName: string }, values: { content: string; replyToId?: number | null; replyToDisplayName?: string | null; replyToContent?: string | null }) {
  const database = await databaseOrThrow();
  const group = await groupOrThrow(groupId);
  if (!await getPrivateGroupMembership(groupId, account.id)) throw new Error("Hanya member yang dapat mengirim pesan grup.");
  if (group.status === "deleted") throw new Error("Grup sudah dihapus.");
  if (group.status === "frozen") throw new Error("Grup sedang dibekukan Administrator Vaira dan hanya dapat dibaca.");
  const result = await database.insert(privateChatGroupMessages).values({ groupId, accountId: account.id, publicId: account.publicId ?? "", displayName: account.fullName, content: values.content, replyToId: values.replyToId ?? null, replyToDisplayName: values.replyToDisplayName ?? null, replyToContent: values.replyToContent ?? null });
  return Number(result[0].insertId);
}

export async function deleteOwnPrivateGroupMessage(groupId: number, messageId: number, accountId: number) {
  const database = await databaseOrThrow();
  const message = await database.select().from(privateChatGroupMessages).where(and(eq(privateChatGroupMessages.id, messageId), eq(privateChatGroupMessages.groupId, groupId), eq(privateChatGroupMessages.accountId, accountId))).limit(1);
  if (!message[0] || message[0].deletedAt) return false;
  await database.update(privateChatGroupMessages).set({ content: "Pesan dihapus oleh Anda", deletedAt: new Date(), deletedOriginalContent: message[0].content, replyToId: null, replyToDisplayName: null, replyToContent: null }).where(eq(privateChatGroupMessages.id, messageId));
  return true;
}

export async function createPrivateGroupInvite(groupId: number, actorAccountId: number, tokenHash: string) {
  const database = await databaseOrThrow();
  const group = await groupOrThrow(groupId);
  if (group.adminAccountId !== actorAccountId) throw new Error("Hanya admin grup yang dapat membagikan link undangan.");
  if (group.status !== "active") throw new Error("Link undangan hanya tersedia untuk grup aktif.");
  await database.update(privateChatGroupInvites).set({ revokedAt: new Date() }).where(and(eq(privateChatGroupInvites.groupId, groupId), isNull(privateChatGroupInvites.revokedAt)));
  await database.insert(privateChatGroupInvites).values({ groupId, tokenHash, createdByAccountId: actorAccountId });
  return { groupId, name: group.name };
}

export async function joinPrivateGroupByInvite(accountId: number, tokenHash: string) {
  const database = await databaseOrThrow();
  const invite = await database.select().from(privateChatGroupInvites).where(and(eq(privateChatGroupInvites.tokenHash, tokenHash), isNull(privateChatGroupInvites.revokedAt))).limit(1);
  if (!invite[0]) throw new Error("Link grup tidak valid atau sudah diganti admin.");
  const permission = await assertCanJoinPrivateGroup(invite[0].groupId, accountId);
  if (!permission.alreadyMember) await database.insert(privateChatGroupMembers).values({ groupId: invite[0].groupId, accountId });
  return getPrivateGroupDetail(invite[0].groupId, accountId);
}

export async function listPrivateGroupsForAdministrator() {
  const database = await databaseOrThrow();
  const groups = await database.select().from(privateChatGroups).orderBy(desc(privateChatGroups.updatedAt));
  return Promise.all(groups.map(async (group) => {
    const memberRows = await database.select().from(privateChatGroupMembers).where(eq(privateChatGroupMembers.groupId, group.id));
    const admin = await database.select({ fullName: manualAccounts.fullName, username: manualAccounts.username }).from(manualAccounts).where(eq(manualAccounts.id, group.adminAccountId)).limit(1);
    return { id: group.id, name: group.name, status: group.status, memberCount: memberRows.length, adminAccountId: group.adminAccountId, adminName: admin[0]?.fullName ?? "Akun tidak tersedia", adminUsername: admin[0]?.username ?? "", createdAt: group.createdAt.toISOString(), updatedAt: group.updatedAt.toISOString() };
  }));
}

export async function setPrivateGroupAdministratorStatus(groupId: number, status: "frozen" | "active" | "deleted", adminUsername: string) {
  const database = await databaseOrThrow();
  await groupOrThrow(groupId);
  if (status === "frozen") await database.update(privateChatGroups).set({ status, frozenAt: new Date(), frozenBy: adminUsername }).where(eq(privateChatGroups.id, groupId));
  else if (status === "active") await database.update(privateChatGroups).set({ status, frozenAt: null, frozenBy: null }).where(eq(privateChatGroups.id, groupId));
  else await database.update(privateChatGroups).set({ status, deletedAt: new Date(), deletedBy: adminUsername }).where(eq(privateChatGroups.id, groupId));
  return getPrivateGroupDetail(groupId);
}
