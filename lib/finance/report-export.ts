import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import * as XLSX from "xlsx";

import { formatCurrency, formatDateTime, getConfirmedTransactions, getTotalBalance, getWalletBalance } from "./finance-utils";
import type { HouseholdAnalysis } from "./household-finance";
import type { AiraGeneratedResult, AiraGeneratedResultCollection, FinanceState, Transaction, TransactionEvidence } from "./types";

type ExportOptions = { transactions?: Transaction[]; periodLabel?: string };
type GeneratedResultsExportOptions = { collections?: AiraGeneratedResultCollection[]; label?: string };
const dateLabel = () => new Date().toISOString().slice(0, 10);
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[character] ?? character);
const asTransactions = (state: FinanceState, transactions?: Transaction[]) => transactions ?? getConfirmedTransactions(state);
const paymentMethodLabel = (value?: TransactionEvidence["paymentMethod"]) => {
  if (value === "bank_transfer") return "Transfer bank";
  if (value === "qris") return "QRIS";
  if (value === "cash") return "Tunai";
  return "Belum diketahui";
};

const transferStatusLabel = (value?: TransactionEvidence["transferStatus"]) => {
  if (value === "succeeded") return "Berhasil";
  if (value === "pending") return "Diproses";
  if (value === "failed") return "Gagal";
  return "Belum diketahui";
};

const transactionRows = (state: FinanceState, transactions?: Transaction[]) => asTransactions(state, transactions).map((transaction) => {
  const wallet = state.wallets.find((item) => item.id === transaction.walletId);
  const destination = state.wallets.find((item) => item.id === transaction.toWalletId);
  const evidence = transaction.evidence ?? {};
  return {
    Tanggal: new Date(transaction.occurredAt).toLocaleDateString("id-ID"),
    Waktu: new Date(transaction.occurredAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    Jenis: transaction.kind === "income" ? "Uang masuk" : transaction.kind === "expense" ? "Uang keluar" : "Pindah saldo",
    Nominal: transaction.amount,
    "Biaya Admin": transaction.feeAmount ?? evidence.adminFeeAmount ?? 0,
    "Sumber Dana": wallet?.name ?? "Tidak ditemukan",
    "Tujuan Dana": destination?.name ?? "—",
    "Metode Pembayaran": paymentMethodLabel(evidence.paymentMethod),
    "Status Transfer": transferStatusLabel(evidence.transferStatus),
    "Bank Pengirim": evidence.sourceBankName ?? "—",
    "Bank Penerima": evidence.destinationBankName ?? "—",
    "Nama Pengirim": evidence.senderAccountName ?? (transaction.kind === "income" ? transaction.counterpartyName : undefined) ?? "—",
    "Nama Penerima": evidence.recipientAccountName ?? (transaction.kind !== "income" ? transaction.counterpartyName : undefined) ?? "—",
    "Rekening Pengirim": evidence.senderAccountDisplay ?? evidence.senderAccountNumber ?? "—",
    "Rekening Penerima": evidence.recipientAccountDisplay ?? evidence.recipientAccountNumber ?? "—",
    Referensi: evidence.referenceNumber ?? "—",
    "Tujuan Transaksi": evidence.transactionPurpose ?? "—",
    "Nomor Urut": evidence.sequenceNumber ?? "—",
    Kategori: transaction.category,
    Keterangan: transaction.note || "—",
    Sumber: transaction.origin,
  };
});
const transactionColumnWidths = [13, 8, 15, 16, 14, 18, 18, 18, 16, 18, 18, 22, 22, 22, 22, 34, 24, 14, 18, 36, 12].map((wch) => ({ wch }));
const totals = (transactions: Transaction[]) => ({ income: transactions.filter((item) => item.kind === "income").reduce((sum, item) => sum + item.amount, 0), expense: transactions.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0), fees: transactions.filter((item) => item.kind === "transfer").reduce((sum, item) => sum + (item.feeAmount ?? 0), 0) });

async function shareExcel(workbook: XLSX.WorkBook, fileName: string, title: string) {
  if (Platform.OS === "web") { XLSX.writeFile(workbook, fileName, { compression: true }); return; }
  const encoded = XLSX.write(workbook, { type: "base64", bookType: "xlsx", compression: true });
  if (!FileSystem.documentDirectory) throw new Error("Penyimpanan dokumen tidak tersedia pada perangkat ini.");
  const uri = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, encoded, { encoding: FileSystem.EncodingType.Base64 });
  if (!(await Sharing.isAvailableAsync())) throw new Error("Berbagi file tidak tersedia pada perangkat ini.");
  await Sharing.shareAsync(uri, { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", dialogTitle: title });
}

async function sharePdf(html: string, title: string) {
  if (Platform.OS === "web") { await Print.printAsync({ html }); return; }
  const result = await Print.printToFileAsync({ html });
  if (!(await Sharing.isAvailableAsync())) throw new Error("Berbagi file tidak tersedia pada perangkat ini.");
  await Sharing.shareAsync(result.uri, { UTI: ".pdf", mimeType: "application/pdf", dialogTitle: title });
}

const pdfTransactionRow = (state: FinanceState, transaction: Transaction) => {
  const wallet = state.wallets.find((item) => item.id === transaction.walletId);
  const destination = state.wallets.find((item) => item.id === transaction.toWalletId);
  const evidence = transaction.evidence ?? {};
  const party = transaction.kind === "income" ? evidence.senderAccountName ?? transaction.counterpartyName : evidence.recipientAccountName ?? transaction.counterpartyName;
  const accounts = [evidence.senderAccountDisplay ?? evidence.senderAccountNumber, evidence.recipientAccountDisplay ?? evidence.recipientAccountNumber].filter(Boolean).join(" → ");
  const evidenceDetails = [
    `Metode: ${paymentMethodLabel(evidence.paymentMethod)}`,
    `Status: ${transferStatusLabel(evidence.transferStatus)}`,
    `Bank: ${[evidence.sourceBankName, evidence.destinationBankName].filter(Boolean).join(" → ") || "—"}`,
    `Pihak: ${party || "—"}`,
    `Rekening: ${accounts || "—"}`,
    `Referensi: ${evidence.referenceNumber || "—"}`,
    `Tujuan: ${evidence.transactionPurpose || "—"}`,
    `No. urut: ${evidence.sequenceNumber || "—"}`,
  ].map(escapeHtml).join("<br/>");
  return `<tr><td>${escapeHtml(formatDateTime(transaction.occurredAt))}</td><td>${escapeHtml(transaction.kind === "income" ? "Uang masuk" : transaction.kind === "expense" ? "Uang keluar" : "Pindah saldo")}</td><td>${escapeHtml(formatCurrency(transaction.amount))}</td><td>${escapeHtml(formatCurrency(transaction.feeAmount ?? evidence.adminFeeAmount ?? 0))}</td><td>${escapeHtml(wallet?.name ?? "—")}</td><td>${escapeHtml(destination?.name ?? "—")}</td><td>${evidenceDetails}</td><td>${escapeHtml(transaction.category)}</td><td>${escapeHtml(transaction.note || "—")}</td></tr>`;
};

function pdfDocument(title: string, state: FinanceState, transactions: Transaction[], periodLabel: string, includeWallets: boolean) {
  const summary = totals(transactions);
  const rows = transactions.length ? transactions.map((transaction) => pdfTransactionRow(state, transaction)).join("") : '<tr><td colspan="9">Tidak ada transaksi terkonfirmasi pada periode ini.</td></tr>';
  const wallets = includeWallets ? `<h2>Saldo per rekening</h2><table><thead><tr><th>Rekening</th><th>Jenis</th><th>Saldo terkini</th></tr></thead><tbody>${state.wallets.map((wallet) => `<tr><td>${escapeHtml(wallet.name)}</td><td>${escapeHtml(wallet.kind)}</td><td>${escapeHtml(formatCurrency(getWalletBalance(wallet, state.transactions)))}</td></tr>`).join("")}</tbody></table>` : "";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>@page{margin:22px}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#10233D}h1{font-size:23px;margin:0}h2{font-size:14px;margin:22px 0 8px}.meta{color:#66758A;font-size:11px}.metrics{display:flex;gap:9px;margin:18px 0}.metric{flex:1;background:#F4F8FF;border-radius:10px;padding:10px}.metric label{display:block;color:#66758A;font-size:10px}.metric strong{display:block;font-size:15px;margin-top:4px}table{border-collapse:collapse;font-size:9px;width:100%}th{background:#EAF1FC;text-align:left}th,td{border-bottom:1px solid #DCE5F2;padding:7px 4px;vertical-align:top}.income{color:#16885E;font-weight:700}.expense{color:#D55345;font-weight:700}</style></head><body><h1>${escapeHtml(title)}</h1><p class="meta">Periode: ${escapeHtml(periodLabel)} · Dibuat ${escapeHtml(new Date().toLocaleString("id-ID"))}</p><div class="metrics"><div class="metric"><label>Pemasukan</label><strong class="income">${escapeHtml(formatCurrency(summary.income))}</strong></div><div class="metric"><label>Pengeluaran</label><strong class="expense">${escapeHtml(formatCurrency(summary.expense))}</strong></div><div class="metric"><label>Biaya admin</label><strong>${escapeHtml(formatCurrency(summary.fees))}</strong></div><div class="metric"><label>Total saldo</label><strong>${escapeHtml(formatCurrency(getTotalBalance(state)))}</strong></div></div><h2>Rincian transaksi</h2><table><thead><tr><th>Waktu</th><th>Jenis</th><th>Nominal</th><th>Biaya admin</th><th>Sumber dana</th><th>Tujuan dana</th><th>Rincian bukti</th><th>Kategori</th><th>Keterangan</th></tr></thead><tbody>${rows}</tbody></table>${wallets}</body></html>`;
}

export async function exportExcelTransactions(state: FinanceState, options: ExportOptions = {}) {
  const transactions = asTransactions(state, options.transactions); const summary = totals(transactions); const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.json_to_sheet([{ Ringkasan: "Periode", Nilai: options.periodLabel ?? "Seluruh mutasi" }, { Ringkasan: "Jumlah mutasi", Nilai: transactions.length }, { Ringkasan: "Total pemasukan", Nilai: summary.income }, { Ringkasan: "Total pengeluaran", Nilai: summary.expense }, { Ringkasan: "Biaya admin", Nilai: summary.fees }, { Ringkasan: "Dibuat pada", Nilai: new Date().toLocaleString("id-ID") }]);
  const transactionSheet = XLSX.utils.json_to_sheet(transactionRows(state, transactions)); transactionSheet["!cols"] = transactionColumnWidths; transactionSheet["!autofilter"] = { ref: `A1:U${Math.max(1, transactions.length + 1)}` };
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan"); XLSX.utils.book_append_sheet(workbook, transactionSheet, "Mutasi");
  await shareExcel(workbook, `V A I R A  A I-Mutasi-${dateLabel()}.xlsx`, "Bagikan mutasi Excel V A I R A  A I");
}

export async function exportPdfTransactions(state: FinanceState, options: ExportOptions = {}) { const transactions = asTransactions(state, options.transactions); await sharePdf(pdfDocument("Mutasi Keuangan V A I R A  A I", state, transactions, options.periodLabel ?? "Seluruh mutasi", false), "Bagikan mutasi PDF V A I R A  A I"); }

export async function exportExcelReport(state: FinanceState, options: ExportOptions = {}) {
  const transactions = asTransactions(state, options.transactions); const workbook = XLSX.utils.book_new(); const summary = totals(transactions);
  const overview = XLSX.utils.json_to_sheet([{ Ringkasan: "Periode", Nilai: options.periodLabel ?? "Seluruh periode" }, { Ringkasan: "Total saldo", Nilai: getTotalBalance(state) }, { Ringkasan: "Pemasukan", Nilai: summary.income }, { Ringkasan: "Pengeluaran", Nilai: summary.expense }, { Ringkasan: "Biaya admin transfer", Nilai: summary.fees }, { Ringkasan: "Dibuat pada", Nilai: new Date().toLocaleString("id-ID") }]);
  const mutationSheet = XLSX.utils.json_to_sheet(transactionRows(state, transactions)); mutationSheet["!cols"] = transactionColumnWidths; mutationSheet["!autofilter"] = { ref: `A1:U${Math.max(1, transactions.length + 1)}` };
  const walletSheet = XLSX.utils.json_to_sheet(state.wallets.map((wallet) => ({ Nama: wallet.name, Jenis: wallet.kind, "Saldo Awal": wallet.openingBalance, "Saldo Terkini": getWalletBalance(wallet, state.transactions) })));
  XLSX.utils.book_append_sheet(workbook, overview, "Ringkasan"); XLSX.utils.book_append_sheet(workbook, mutationSheet, "Mutasi"); XLSX.utils.book_append_sheet(workbook, walletSheet, "Rekening");
  await shareExcel(workbook, `V A I R A  A I-Laporan-${dateLabel()}.xlsx`, "Bagikan laporan Excel V A I R A  A I");
}

export async function exportPdfReport(state: FinanceState, options: ExportOptions = {}) { const transactions = asTransactions(state, options.transactions); await sharePdf(pdfDocument("Laporan Keuangan V A I R A  A I", state, transactions, options.periodLabel ?? "Seluruh periode", true), "Bagikan laporan PDF V A I R A  A I"); }

function householdAnalysisPdf(analysis: HouseholdAnalysis) {
  const row = (label: string, amount: number) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(formatCurrency(amount))}</td></tr>`;
  const incomeRows = analysis.incomeRows.map((item) => row(`Masuk · ${item.label}`, item.monthlyAmount)).join("");
  const personalRows = analysis.personalByMember.flatMap((member) => member.rows.map((item) => row(`${member.memberLabel} · ${item.label}`, item.monthlyAmount))).join("");
  const sharedRows = analysis.sharedRows.map((item) => row(`Bersama · ${item.label}`, item.monthlyAmount)).join("");
  const priceRows = analysis.foodPriceRecommendations.map((item) => `<tr><td>${escapeHtml(item.label)}</td><td>${escapeHtml(formatCurrency(item.dailyAmount))}</td><td>${escapeHtml(formatCurrency(item.weeklyAmount))}</td><td>${escapeHtml(formatCurrency(item.monthlyAmount))}</td><td>${item.targetMonthlyAmount ? escapeHtml(formatCurrency(item.targetMonthlyAmount)) : "—"}</td></tr>`).join("");
  const noteList = (title: string, values: string[]) => `<h2>${escapeHtml(title)}</h2><ul>${(values.length ? values : ["Belum ada catatan dari data yang diisi."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>@page{margin:22px}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#10233D}h1{font-size:23px;margin:0}h2{font-size:14px;margin:22px 0 8px}.meta{color:#66758A;font-size:11px}.metrics{display:flex;gap:9px;margin:18px 0;flex-wrap:wrap}.metric{flex:1;min-width:120px;background:#F4F8FF;border-radius:10px;padding:10px}.metric label{display:block;color:#66758A;font-size:10px}.metric strong{display:block;font-size:15px;margin-top:4px}table{border-collapse:collapse;font-size:9px;width:100%}th{background:#EAF1FC;text-align:left}th,td{border-bottom:1px solid #DCE5F2;padding:7px 4px;vertical-align:top}tfoot td{font-weight:700;background:#F4F8FF}li{font-size:10px;line-height:1.45;margin:4px 0}.note{font-size:9px;color:#66758A;line-height:1.45}</style></head><body><h1>Perencana Rumah Tangga · V A I R A  A I</h1><p class="meta">Periode: ${escapeHtml(analysis.periodLabel)} · Dibuat ${escapeHtml(new Date(analysis.generatedAt).toLocaleString("id-ID"))}</p><div class="metrics"><div class="metric"><label>Total pendapatan</label><strong>${escapeHtml(formatCurrency(analysis.totalIncome))}</strong></div><div class="metric"><label>Pengeluaran pribadi</label><strong>${escapeHtml(formatCurrency(analysis.totalPersonalExpense))}</strong></div><div class="metric"><label>Pengeluaran bersama</label><strong>${escapeHtml(formatCurrency(analysis.totalSharedExpense))}</strong></div><div class="metric"><label>Sisa dana rencana</label><strong>${escapeHtml(formatCurrency(analysis.remaining))}</strong></div></div><h2>Rincian per bulan</h2><table><thead><tr><th>Komponen</th><th>Nilai per bulan</th></tr></thead><tbody>${incomeRows}${personalRows}${sharedRows || '<tr><td colspan="2">Belum ada rincian biaya bersama.</td></tr>'}</tbody><tfoot><tr><td>Total pengeluaran pribadi</td><td>${escapeHtml(formatCurrency(analysis.totalPersonalExpense))}</td></tr><tr><td>Total pengeluaran bersama</td><td>${escapeHtml(formatCurrency(analysis.totalSharedExpense))}</td></tr><tr><td>TOTAL SEMUA HARGA / BIAYA</td><td>${escapeHtml(formatCurrency(analysis.totalExpense))}</td></tr><tr><td>NILAI AKHIR RENCANA</td><td>${escapeHtml(formatCurrency(analysis.remaining))}</td></tr></tfoot></table>${priceRows ? `<h2>Rekomendasi harga pangan dari catatan Anda</h2><table><thead><tr><th>Item</th><th>Harian</th><th>Mingguan</th><th>Bulanan</th><th>Target hemat</th></tr></thead><tbody>${priceRows}</tbody></table><p class="note">Harga target hemat hanya berasal dari angka yang Anda masukkan untuk jumlah dan frekuensi sama; laporan tidak mengambil atau mengarang harga pasar.</p>` : ""}${noteList("Peringatan yang perlu diperiksa", analysis.alerts)}${noteList("Saran berdasarkan data", analysis.suggestions)}${noteList("Catatan belanja dan pangan", analysis.pantryNotes)}<p class="note">${escapeHtml(analysis.wellbeingNote)}</p><p class="note">${escapeHtml(analysis.privacyNote)}</p></body></html>`;
}

export async function exportHouseholdAnalysisPdf(analysis: HouseholdAnalysis) {
  await sharePdf(householdAnalysisPdf(analysis), "Ekspor analisis rumah tangga PDF V A I R A  A I");
}

export async function exportExcelGlobalRoomReports(reports: { id: number; reporterUsername: string; reportedUsername: string; reportedDisplayName: string; reason: string; priority: string; contextMessage: string | null; details: string | null; status: string; createdAt: string }[]) {
  const workbook = XLSX.utils.book_new();
  const rows = reports.map((report) => ({ ID: report.id, Pelapor: report.reporterUsername, Terlapor: report.reportedDisplayName, Username: report.reportedUsername, Kategori: report.reason, Prioritas: report.priority, "Konteks Pesan": report.contextMessage ?? "—", Keterangan: report.details ?? "—", Status: report.status, "Dibuat": new Date(report.createdAt).toLocaleString("id-ID") }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = [{ wch: 8 }, { wch: 18 }, { wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 50 }, { wch: 36 }, { wch: 14 }, { wch: 22 }];
  sheet["!autofilter"] = { ref: `A1:J${Math.max(1, rows.length + 1)}` };
  XLSX.utils.book_append_sheet(workbook, sheet, "Laporan Room");
  await shareExcel(workbook, `V-A-I-R-A-Laporan-Room-${dateLabel()}.xlsx`, "Ekspor laporan Room Global");
}

export async function exportExcelAdministratorAccounts(accounts: { fullName: string; username: string; birthDate: string; email: string; phone: string; status: string; createdAt: Date; lastLoginAt: Date | null }[]) {
  const workbook = XLSX.utils.book_new();
  const rows = accounts.map((account) => ({ "Nama Lengkap": account.fullName, Username: account.username, "Tanggal Lahir": account.birthDate, Email: account.email, WhatsApp: account.phone, Status: account.status, "Dibuat": new Date(account.createdAt).toLocaleString("id-ID"), "Login Terakhir": account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString("id-ID") : "Belum pernah" }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = [{ wch: 24 }, { wch: 18 }, { wch: 14 }, { wch: 31 }, { wch: 18 }, { wch: 14 }, { wch: 22 }, { wch: 22 }];
  sheet["!autofilter"] = { ref: `A1:H${Math.max(1, rows.length + 1)}` };
  XLSX.utils.book_append_sheet(workbook, sheet, "Akun V A I R A  A I");
  await shareExcel(workbook, `V A I R A  A I-Akun-${dateLabel()}.xlsx`, "Unduh daftar akun V A I R A  A I");
}

function generatedResultRows(results: AiraGeneratedResult[], collections: AiraGeneratedResultCollection[] = []) {
  const collectionName = (result: AiraGeneratedResult) => (result.collectionIds ?? []).map((id) => collections.find((collection) => collection.id === id)?.name).filter(Boolean).join(", ") || "—";
  return results.map((result) => ({ "Dibuat": formatDateTime(result.createdAt), Jenis: result.kind === "image" ? "Gambar" : "Dokumen", Nama: result.label, Prompt: result.prompt, Resolusi: result.kind === "image" ? result.quality === "high" ? "Tinggi" : "Standar" : "—", Favorit: result.isFavorite ? "Ya" : "Tidak", Koleksi: collectionName(result), Tautan: result.uri }));
}

function generatedResultsPdf(results: AiraGeneratedResult[], collections: AiraGeneratedResultCollection[], label: string) {
  const rows = generatedResultRows(results, collections);
  const body = rows.length ? rows.map((row) => `<tr><td>${escapeHtml(String(row.Dibuat))}</td><td>${escapeHtml(String(row.Jenis))}</td><td>${escapeHtml(String(row.Nama))}</td><td>${escapeHtml(String(row.Prompt))}</td><td>${escapeHtml(String(row.Resolusi))}</td><td>${escapeHtml(String(row.Favorit))}</td><td>${escapeHtml(String(row.Koleksi))}</td></tr>`).join("") : '<tr><td colspan="7">Belum ada hasil yang dapat diekspor.</td></tr>';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>@page{margin:22px}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#10233D}h1{font-size:23px;margin:0}.meta{color:#66758A;font-size:11px}.metric{background:#F4F8FF;border-radius:10px;margin:16px 0;padding:10px}.metric strong{font-size:16px}table{border-collapse:collapse;font-size:8px;width:100%}th{background:#EAF1FC;text-align:left}th,td{border-bottom:1px solid #DCE5F2;padding:6px 4px;vertical-align:top}</style></head><body><h1>Galeri Hasil Aira</h1><p class="meta">${escapeHtml(label)} · Diekspor ${escapeHtml(new Date().toLocaleString("id-ID"))}</p><div class="metric"><strong>${results.length} hasil</strong> · ${results.filter((item) => item.kind === "image").length} gambar · ${results.filter((item) => item.kind === "document").length} dokumen · ${results.filter((item) => item.isFavorite).length} favorit</div><table><thead><tr><th>Dibuat</th><th>Jenis</th><th>Nama</th><th>Prompt</th><th>Resolusi</th><th>Favorit</th><th>Koleksi</th></tr></thead><tbody>${body}</tbody></table></body></html>`;
}

export async function exportExcelGeneratedResults(results: AiraGeneratedResult[], options: GeneratedResultsExportOptions = {}) {
  const workbook = XLSX.utils.book_new();
  const rows = generatedResultRows(results, options.collections);
  const summary = XLSX.utils.json_to_sheet([{ Ringkasan: "Filter", Nilai: options.label ?? "Seluruh galeri" }, { Ringkasan: "Jumlah hasil", Nilai: results.length }, { Ringkasan: "Gambar", Nilai: results.filter((item) => item.kind === "image").length }, { Ringkasan: "Dokumen", Nilai: results.filter((item) => item.kind === "document").length }, { Ringkasan: "Favorit", Nilai: results.filter((item) => item.isFavorite).length }, { Ringkasan: "Diekspor", Nilai: new Date().toLocaleString("id-ID") }]);
  const sheet = XLSX.utils.json_to_sheet(rows); sheet["!cols"] = [{ wch: 21 }, { wch: 12 }, { wch: 28 }, { wch: 44 }, { wch: 13 }, { wch: 10 }, { wch: 24 }, { wch: 58 }]; sheet["!autofilter"] = { ref: `A1:H${Math.max(1, rows.length + 1)}` };
  XLSX.utils.book_append_sheet(workbook, summary, "Ringkasan"); XLSX.utils.book_append_sheet(workbook, sheet, "Hasil Aira");
  await shareExcel(workbook, `V A I R A  A I-Galeri-${dateLabel()}.xlsx`, "Ekspor galeri Aira ke Excel");
}

export async function exportPdfGeneratedResults(results: AiraGeneratedResult[], options: GeneratedResultsExportOptions = {}) {
  await sharePdf(generatedResultsPdf(results, options.collections ?? [], options.label ?? "Seluruh galeri"), "Ekspor galeri Aira ke PDF");
}
