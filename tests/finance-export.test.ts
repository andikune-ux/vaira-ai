import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("ekspor keuangan", () => {
  it("menyediakan ekspor PDF dan Excel khusus untuk mutasi", () => {
    const exporter = read("lib/finance/report-export.ts");
    const transactions = read("app/transactions.tsx");
    expect(exporter).toContain("exportExcelTransactions");
    expect(exporter).toContain("exportPdfTransactions");
    expect(transactions).toContain("Ekspor Excel");
    expect(transactions).toContain("Ekspor PDF");
  });

  it("mengekspor laporan sesuai transaksi periode yang dipilih", () => {
    const report = read("app/report.tsx");
    expect(report).toContain("transactions: report.transactions");
    expect(report).toContain("periodLabel");
  });

  it("menyelaraskan PDF dan Excel dengan field form transaksi terbaru", () => {
    const exporter = read("lib/finance/report-export.ts");
    ["Metode Pembayaran", "Status Transfer", "Bank Pengirim", "Bank Penerima", "Nama Pengirim", "Nama Penerima", "Rekening Pengirim", "Rekening Penerima", "Referensi", "Tujuan Transaksi", "Nomor Urut", "transactionColumnWidths", "A1:U"].forEach((field) => expect(exporter).toContain(field));
  });

  it("tidak merender nama pengirim dan keterangan tambahan sebagai input terpisah di Pindai Bukti", () => {
    const scan = read("app/scan-receipt.tsx");
    expect(scan).not.toContain("Nama pengirim (opsional)");
    expect(scan).not.toContain("Keterangan tambahan (opsional)");
    expect(scan).not.toContain("Tambah nama atau keterangan lain");
  });
});

describe("wallet picker and target chicken icon", () => {
  it("uses a compact picker modal with search and manual fallback", () => {
    const source = read("app/wallets.tsx");
    expect(source).toContain("Pilih sumber dana");
    expect(source).toContain("Cari nama bank");
    expect(source).toContain("Pilih manual / isi sendiri");
    expect(source).toContain("setPickerVisible(false)");
  });

  it("maps only verified local brand assets into the wallet picker", () => {
    const source = read("app/wallets.tsx");
    expect(source).toContain('cimb: require("@/assets/images/brands/cimb-niaga-provider.png")');
    expect(source).toContain('bri: require("@/assets/images/brands/bri-provider.png")');
    expect(source).toContain('bsi: require("@/assets/images/brands/bsi-provider.png")');
    expect(source).toContain('danamon: require("@/assets/images/brands/danamon-provider.png")');
    expect(source).toContain('permata: require("@/assets/images/brands/permata-provider.png")');
    expect(source).toContain('jago: require("@/assets/images/brands/jago-official.svg")');
    expect(source).toContain('blu: require("@/assets/images/brands/blu-official.png")');
    expect(source).toContain('ovo: require("@/assets/images/brands/ovo-official.png")');
    expect(source).toContain('dana: require("@/assets/images/brands/dana-official.png")');
    expect(source).toContain('linkaja: require("@/assets/images/brands/linkaja-official.png")');
    expect(source).toContain('superbank: require("@/assets/images/brands/superbank-official.png")');
    expect(source).toContain('astrapay: require("@/assets/images/brands/astrapay-fixed.webp")');
    expect(source).toContain('doku: require("@/assets/images/brands/doku-official.svg")');
    expect(source).toContain('kaspro: require("@/assets/images/brands/kaspro-official.png")');
    expect(source).toContain('"true money": require("@/assets/images/brands/truemoney-official.png")');
    expect(source).toContain('bca: require("@/assets/images/brands/bca-official.png")');
    expect(source).toContain('ocbc: require("@/assets/images/brands/ocbc-official.png")');
    expect(source).toContain('maybank: require("@/assets/images/brands/maybank-official.svg")');
    expect(source).toContain('btn: require("@/assets/images/brands/btn-official.png")');
    expect(source).toContain('mega: require("@/assets/images/brands/bankmega-official.png")');
    expect(source).toContain('bjb: require("@/assets/images/brands/bjb-official.png")');
    expect(source).toContain('sinarmas: require("@/assets/images/brands/sinarmas-official.png")');
    expect(source).toContain('seabank: require("@/assets/images/brands/seabank-official.svg")');
    expect(source).toContain('neo: require("@/assets/images/brands/bnc-official.png")');
    expect(source).toContain('krom: require("@/assets/images/brands/krom-public-wordmark.png")');
    expect(source).toContain('sakuku: require("@/assets/images/brands/sakuku-official.jpg")');
    expect(source).toContain('hibank: require("@/assets/images/brands/hibank-official.png")');
    expect(source).toContain('allo: require("@/assets/images/brands/allo-official.png")');
    expect(source).toContain('amar: require("@/assets/images/brands/amar-official.webp")');
    expect(source).toContain('raya: require("@/assets/images/brands/raya-official.png")');
    expect(source).toContain('isaku: require("@/assets/images/brands/isaku-official.png")');
    expect(source).toContain('bni: require("@/assets/images/brands/bni-official.png")');
    expect(source).toContain('jatim: require("@/assets/images/brands/bank-jatim-official.png")');
    expect(source).toContain('panin: require("@/assets/images/brands/panin-official.png")');
    expect(source).toContain('pospay: require("@/assets/images/brands/pospay-official.png")');
    expect(source).toContain("OFFICIAL_DOMAINS");
  });

  it("keeps the target icon in finance actions while the home status card stays focused on rotation", () => {
    const statusCard = read("components/aira-mode-status-card.tsx");
    const icon = read("components/chicken-icon.tsx");
    expect(statusCard).toContain("GestureDetector");
    expect(statusCard).not.toContain("manualNavigation");
    expect(icon).toContain("Ikon ayam VAIRA");
    expect(icon).toContain('vaira-chicken-target-transparent.webp');
    expect(icon).not.toContain('vaira-chicken-target-clean.webp');
    expect(icon).not.toContain('vaira-chicken-target.png');
  });
});

describe("target chicken icon coverage", () => {
  it("uses the shared ChickenIcon on the home target shortcut", () => {
    const home = read("app/(tabs)/index.tsx");
    expect(home).toContain('import { ChickenIcon } from "@/components/chicken-icon"');
    expect(home).toContain("chicken: true");
    expect(home).toContain("AiraModeStatusCard");
    expect(home).not.toContain('assetUri: "/manus-storage/vaira-chicken-target_e1b64891.png"');
  });
  it("uses ChickenIcon on the tab target shortcut and rute Rencana terpadu untuk formulir Target", () => {
    const plans = read("app/(tabs)/plans.tsx");
    const planForm = read("app/plan-form.tsx");
    const status = read("components/aira-mode-status-card.tsx");
    expect(plans).toContain("<ChickenIcon size={31} />");
    expect(planForm).toContain('["goal", "savings", "Target"]');
    expect(planForm).toContain('mode === "goal" ? "Target"');
    expect(status).toContain("GestureDetector");
  });
});
