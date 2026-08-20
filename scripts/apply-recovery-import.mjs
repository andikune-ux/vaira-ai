import fs from "node:fs";
import mysql from "mysql2/promise";

const [inputPath] = process.argv.slice(2);

if (!inputPath) {
  throw new Error("Usage: node scripts/apply-recovery-import.mjs <data-only-recovery.sql>");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tidak tersedia untuk impor SERVER DATABASE 2.");
}

const recoveryOrder = [
  "manualAccounts",
  "globalRoomSettings",
  "globalRoomConsents",
  "globalRoomUserSettings",
  "globalRoomUserStatus",
  "globalRoomPresence",
  "globalRoomMessages",
  "globalRoomModeration",
  "globalRoomProfileComments",
  "globalRoomProfileLoves",
  "globalRoomReports",
  "administratorTokenSettings",
  "administratorAuditLogs",
];

const statementByTable = new Map();
for (const line of fs.readFileSync(inputPath, "utf8").split(/\r?\n/)) {
  const match = line.match(/^INSERT INTO `([^`]+)` VALUES /);
  if (match) statementByTable.set(match[1], line);
}

const statements = recoveryOrder
  .map((tableName) => ({ tableName, statement: statementByTable.get(tableName) }))
  .filter((entry) => Boolean(entry.statement));

if (!statements.length) {
  throw new Error("Tidak ada pernyataan impor yang valid.");
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const preflight = [];
  for (const { tableName } of statements) {
    const [rows] = await connection.query(`SELECT COUNT(*) AS rowCount FROM \`${tableName}\``);
    const rowCount = Number(rows[0]?.rowCount ?? 0);
    preflight.push({ tableName, rowCount });
  }
  const occupied = preflight.filter((entry) => entry.rowCount !== 0);
  if (occupied.length) {
    throw new Error(`Impor dibatalkan: tabel standby tidak kosong (${occupied.map((entry) => entry.tableName).join(", ")}).`);
  }

  await connection.beginTransaction();
  for (const { statement } of statements) {
    await connection.query(statement);
  }
  const postflight = [];
  for (const { tableName } of statements) {
    const [rows] = await connection.query(`SELECT COUNT(*) AS rowCount FROM \`${tableName}\``);
    postflight.push({ tableName, rowCount: Number(rows[0]?.rowCount ?? 0) });
  }
  await connection.commit();
  console.log(JSON.stringify({ importedTables: postflight, legacyServerTouched: false, sessionsImported: false, cloudObjectsImported: false }, null, 2));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
