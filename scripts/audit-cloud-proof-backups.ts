import "./load-env.js";
import { desc, eq } from "drizzle-orm";

import { airaxCloudBackups } from "../drizzle/schema";
import { getDb } from "../server/db";
import { storageGetSignedUrl } from "../server/storage";

type BackupPayload = { transactions?: Array<{ proofUri?: unknown }> };

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Database tidak tersedia untuk audit cadangan.");

  const backups = await db
    .select({ accountId: airaxCloudBackups.accountId, storageKey: airaxCloudBackups.storageKey, createdAt: airaxCloudBackups.createdAt })
    .from(airaxCloudBackups)
    .where(eq(airaxCloudBackups.status, "active"))
    .orderBy(desc(airaxCloudBackups.createdAt));

  for (const backup of backups) {
    const signedUrl = await storageGetSignedUrl(backup.storageKey);
    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error(`Cadangan tidak dapat dibaca (${response.status}).`);
    const payload = JSON.parse(await response.text()) as BackupPayload;
    const transactions = payload.transactions ?? [];
    const proofReferences = transactions
      .map((transaction) => typeof transaction.proofUri === "string" ? transaction.proofUri : "")
      .filter(Boolean);
    const storageKeys = proofReferences.filter((value) => value.startsWith("finance-proofs/"));
    const localUris = proofReferences.filter((value) => /^(?:file|content|ph|data):/i.test(value));
    const webUrls = proofReferences.filter((value) => /^https?:/i.test(value));
    console.log(JSON.stringify({
      accountId: backup.accountId,
      createdAt: backup.createdAt.toISOString(),
      transactionCount: transactions.length,
      proofReferenceCount: proofReferences.length,
      privateStorageKeyCount: storageKeys.length,
      localUriCount: localUris.length,
      webUrlCount: webUrls.length,
    }));
  }
}

void main();
