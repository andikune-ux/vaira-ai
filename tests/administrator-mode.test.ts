import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Mode Administrator", () => {
  it("menempatkan pemicu ikon dengan dua puluh ketukan pada Studio Developer", () => {
    const studio = source("app/developer-studio.tsx");
    expect(studio).toContain("const [, setAdminTapCount] = useState(0)");
    expect(studio).toContain("if (next >= 20)");
    expect(studio).toContain("if (next >= 10)");
    expect(studio).toContain("${20 - next} ketukan lagi");
    expect(studio).toContain("onPress={tapAdministrator}");
    expect(studio).not.toContain("delayLongPress={30_000}");
    expect(studio).toContain("ⓘ");
  });

  it("menyediakan urutan boot dua menit, autentikasi server, dan konsol database", () => {
    const administrator = source("app/administrator.tsx");
    expect(administrator).toContain("ADMIN_BOOT_DURATION_MS = 120_000");
    expect(administrator).toContain("MatrixRain");
    expect(administrator).toContain("SERVER DATABASE");
    expect(administrator).toContain("administrator.verify");
    expect(administrator).not.toContain("Zahradavi123@");
  });

  it("membuka pintasan 🚀 setelah sepuluh ketukan wajah Robot SPCA dan mengganti ekspresi tanpa memberi petunjuk skip", () => {
    const administrator = source("app/administrator.tsx");
    expect(administrator).toContain("BOOT_SPCA_EXPRESSIONS");
    expect(administrator).toContain("const skipUnlocked = bootSpcaTaps >= 10");
    expect(administrator).toContain("onPress={tapBootSpca}");
    expect(administrator).toContain("Pintasan administrator");
    expect(administrator).not.toContain("Mode roket terdeteksi");
    expect(administrator).toContain("setStage(\"login\")");
    expect(administrator).toContain("🚀");
  });

  it("menyediakan daftar blacklist dan panel konfirmasi tindakan akun yang terlihat", () => {
    const administrator = source("app/administrator.tsx");
    const accountPage = source("app/administrator-account-edit.tsx");
    expect(administrator).toContain("/administrator-accounts");
    expect(source("app/administrator-accounts.tsx")).toContain("/administrator-account-edit");
    expect(accountPage).toContain("Kelola Akun");
    expect(administrator).toContain("pendingAccountAction");
    expect(administrator).toContain("confirmPendingAccountAction");
    expect(accountPage).toContain("Simpan perubahan");
    expect(accountPage).toContain("manualAccount.adminUpdate");
  });

  it("menandai akun yang dibuat administrator hanya pada daftar admin", () => {
    const schema = source("drizzle/schema.ts");
    const auth = source("server/manual-auth.ts");
    const db = source("server/db.ts");
    const routers = source("server/routers.ts");
    const accounts = source("app/administrator-accounts.tsx");
    expect(schema).toContain('createdByAdministrator: boolean("createdByAdministrator")');
    expect(auth).toContain("toManualAccountAdmin");
    expect(db).toContain("createdByAdministrator");
    expect(routers).toContain("createdByAdministrator: z.boolean().optional()");
    expect(routers).toContain("label dibuat administrator");
    expect(accounts).toContain("Akun dibuat oleh administrator");
    expect(accounts).toContain("Tandai admin");
    expect(accounts).toContain("Cabut label akun dibuat administrator");
    expect(auth).not.toContain("passwordHash: account.passwordHash");
    expect(auth).not.toContain("recoveryTokenHash: account.recoveryTokenHash");
  });

  it("menyediakan penghapusan audit terpilih dan seluruh riwayat tanpa menampilkan panel lanjutan", () => {
    const administrator = source("app/administrator.tsx");
    const auditPage = source("app/administrator-audit.tsx");
    const routers = source("server/routers.ts");
    expect(administrator).not.toContain("Tampilkan panel lanjutan");
    expect(auditPage).toContain("Hapus ditandai");
    expect(auditPage).toContain("Hapus semua");
    expect(auditPage).toContain("Pilih semua");
    expect(routers).toContain("deleteAuditLogs");
    expect(routers).toContain("deleteAdministratorAuditLogs");
  });

  it("menampilkan riwayat audit tanpa menyertakan kredensial atau isi cadangan", () => {
    const administrator = source("app/administrator.tsx");
    const schema = source("drizzle/schema.ts");
    const routers = source("server/routers.ts");
    const auditPage = source("app/administrator-audit.tsx");
    expect(auditPage).toContain("Riwayat Audit");
    expect(schema).toContain("administratorAuditLogs");
    expect(routers).toContain("createAdministratorAuditLog");
    expect(routers).toContain("auditLog:");
  });

  it("tidak lagi menarik snapshot keuangan global ketika aplikasi dibuka atau aktif kembali", () => {
    const sync = source("components/global-test-sync.tsx");
    const routers = source("server/routers.ts");
    expect(sync).toContain("return null;");
    expect(sync).not.toContain("globalTestSnapshot");
    expect(routers).not.toContain("globalTestSnapshot");
  });

  it("mempertahankan seluruh panel manajemen Administrator setelah cleanup Room Global", () => {
    const administrator = source("app/administrator.tsx");
    expect(administrator).toContain("AKUN TERDAFTAR");
    expect(administrator).toContain("DAFTAR AKUN BLACKLIST");
    expect(administrator).toContain("Simpan pembaruan data");
    expect(administrator).toContain("AIRAXCLOUD");
    expect(administrator).toContain("RIWAYAT AUDIT ADMINISTRATOR");
    expect(administrator).toContain("MODERASI ROOM GLOBAL");
    expect(administrator).toContain("LAPORAN ROOM GLOBAL");
  });

  it("menampilkan tombol masuk Room Global dari console administrator", () => {
    const administrator = source("app/administrator.tsx");
    expect(administrator).toContain("Masuk Room Global");
    expect(administrator).toContain('pathname: "/global-room"');
    expect(administrator).toContain('adminMode: "1"');
  });
});


describe("Administrator dedicated management windows", () => {
  it("provides dedicated routes for audit, cloud, room reports, and account editing", () => {
    const administrator = source("app/administrator.tsx");
    expect(administrator).toContain("/administrator-audit");
    expect(administrator).toContain("/administrator-cloud");
    expect(administrator).toContain("/administrator-room-reports");
    const accountPage = source("app/administrator-account-edit.tsx");
    expect(accountPage).toContain("Kelola Akun");
  });
});
