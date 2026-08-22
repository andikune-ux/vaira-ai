import { randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import type { Request } from "express";

import * as db from "./db";
import type { ManualAccount } from "../drizzle/schema";

const scrypt = promisify(scryptCallback);
const SESSION_HEADER = "x-airax-session";

export type ManualAccountPublic = { id: number; publicId: string | null; fullName: string; username: string; email: string; phone: string; birthDate: string; bio: string; avatarUri: string | null; featuredPhotoUris: string[]; isVerified: boolean; mustChangePassword: boolean; status: "active" | "disabled" | "blocked" | "closing" | "blacklisted"; createdAt: Date; lastLoginAt: Date | null };

export function toManualAccountPublic(account: ManualAccount): ManualAccountPublic {
  return { id: account.id, publicId: account.publicId ?? null, fullName: account.fullName, username: account.username, email: account.email, phone: account.phone, birthDate: account.birthDate, bio: account.bio ?? "", avatarUri: account.avatarUri ?? null, featuredPhotoUris: account.featuredPhotoUris ? (() => { try { const value = JSON.parse(account.featuredPhotoUris); return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; } catch { return []; } })() : [], isVerified: account.isVerified, mustChangePassword: account.mustChangePassword, status: account.status, createdAt: account.createdAt, lastLoginAt: account.lastLoginAt };
}

export function toManualAccountAdmin(account: ManualAccount) {
  return { ...toManualAccountPublic(account), createdByAdministrator: account.createdByAdministrator };
}

export async function hashSecret(value: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(value, salt, 64) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifySecret(value: string, storedHash: string) {
  const [salt, stored] = storedHash.split(":");
  if (!salt || !stored) return false;
  const derived = await scrypt(value, salt, 64) as Buffer;
  const expected = Buffer.from(stored, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function createPublicAccountId() { const length = randomInt(9, 13); let value = String(randomInt(1, 10)); while (value.length < length) value += String(randomInt(0, 10)); return value; }

export function createRecoveryToken() {
  return `ARX-${randomBytes(8).toString("hex").toUpperCase()}`;
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getManualAccountFromRequest(req: Request) {
  const raw = req.headers[SESSION_HEADER];
  const token = Array.isArray(raw) ? raw[0] : raw;
  if (!token || token.length < 20) return undefined;
  return db.getManualAccountBySession(hashSessionToken(token));
}
