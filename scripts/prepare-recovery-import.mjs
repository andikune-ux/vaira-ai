import fs from "node:fs";
import path from "node:path";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/prepare-recovery-import.mjs <legacy-dump.sql> <data-only-output.sql>");
}

const approvedTables = new Set([
  "manualAccounts",
  "administratorAuditLogs",
  "administratorTokenSettings",
  "globalRoomConsents",
  "globalRoomMessages",
  "globalRoomModeration",
  "globalRoomPresence",
  "globalRoomProfileComments",
  "globalRoomProfileLoves",
  "globalRoomReports",
  "globalRoomSettings",
  "globalRoomUserSettings",
  "globalRoomUserStatus",
]);

const insertPattern = /^INSERT INTO `([^`]+)` VALUES /;
const sourceLines = fs.readFileSync(inputPath, "utf8").split(/\r?\n/);
const statements = [];
const importedTables = new Set();
const skippedTables = new Set();

for (const line of sourceLines) {
  const match = line.match(insertPattern);
  if (!match) continue;
  const [, tableName] = match;
  if (approvedTables.has(tableName)) {
    if (!line.endsWith(";")) throw new Error(`Statement INSERT untuk ${tableName} tidak lengkap.`);
    statements.push(line);
    importedTables.add(tableName);
  } else {
    skippedTables.add(tableName);
  }
}

if (!statements.length) {
  throw new Error("Tidak ada data tabel yang disetujui untuk dipulihkan.");
}

const banner = [
  "-- DATA-ONLY RECOVERY IMPORT FOR SERVER DATABASE 2",
  "-- Generated from a user-authorized legacy dump; no DROP TABLE, CREATE TABLE, ALTER TABLE, sessions, cloud objects, access tokens, or migrations.",
  "SET FOREIGN_KEY_CHECKS=0;",
].join("\n");
const footer = "SET FOREIGN_KEY_CHECKS=1;\n";
fs.writeFileSync(outputPath, `${banner}\n${statements.join("\n")}\n${footer}`, "utf8");

const manifestPath = `${outputPath}.manifest.json`;
fs.writeFileSync(manifestPath, `${JSON.stringify({
  source: path.basename(inputPath),
  importedTables: [...importedTables].sort(),
  skippedTables: [...skippedTables].sort(),
  statementCount: statements.length,
  generatedAt: new Date().toISOString(),
}, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  outputPath,
  manifestPath,
  statementCount: statements.length,
  importedTables: [...importedTables].sort(),
  skippedTables: [...skippedTables].sort(),
}));
