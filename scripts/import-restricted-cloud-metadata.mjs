import fs from "node:fs";
import mysql from "mysql2/promise";

const [inputPath] = process.argv.slice(2);

if (!inputPath) throw new Error("Usage: node scripts/import-restricted-cloud-metadata.mjs <legacy-dump.sql>");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL tidak tersedia untuk impor metadata AiraXCloud.");

const sourceLine = fs.readFileSync(inputPath, "utf8").split(/\r?\n/).find((line) => line.startsWith("INSERT INTO `airaxCloudBackups` VALUES "));
if (!sourceLine || !sourceLine.endsWith(";")) throw new Error("Data metadata AiraXCloud tidak ditemukan atau tidak lengkap.");

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [beforeRows] = await connection.query("SELECT COUNT(*) AS rowCount FROM `airaxCloudBackups`");
  if (Number(beforeRows[0]?.rowCount ?? 0) !== 0) throw new Error("Impor metadata dibatalkan karena tabel airaxCloudBackups tidak kosong.");

  await connection.beginTransaction();
  await connection.query(sourceLine);
  await connection.query("UPDATE `airaxCloudBackups` SET `status` = 'restricted'");
  const [afterRows] = await connection.query("SELECT COUNT(*) AS rowCount FROM `airaxCloudBackups`");
  await connection.commit();
  console.log(JSON.stringify({ recoveredMetadata: Number(afterRows[0]?.rowCount ?? 0), status: "restricted", cloudObjectsImported: false }, null, 2));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
