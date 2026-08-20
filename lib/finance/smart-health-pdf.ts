import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { healthFoodGroupLabel, monthlyFoodCost, type SmartHealthProfile } from "./smart-health";

const escapeHtml = (value: string) => value.replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[character] ?? character);

export async function exportSmartHealthPdf(profile: SmartHealthProfile) {
  const people = profile.people.length ? profile.people.map((person) => `<tr><td>${escapeHtml(person.name)}</td><td>${person.ageYears ?? "—"}</td><td>${person.heightCm ?? "—"}</td><td>${person.weightKg ?? "—"}</td></tr>`).join("") : `<tr><td colspan="4">Belum ada profil individu.</td></tr>`;
  const foods = profile.foods.length ? profile.foods.map((food) => `<tr><td>${escapeHtml(healthFoodGroupLabel(food.group))}</td><td>${escapeHtml(food.name)}</td><td>${food.quantity} ${escapeHtml(food.unit)}</td><td>Rp${food.price.toLocaleString("id-ID")}</td><td>${food.frequency}</td><td>Rp${Math.round(monthlyFoodCost(food)).toLocaleString("id-ID")}</td></tr>`).join("") : `<tr><td colspan="6">Belum ada bahan pangan.</td></tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"/><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#10233D;padding:18px}h1{color:#B8892E}h2{margin-top:24px;font-size:16px}p{color:#66758A;font-size:11px}table{border-collapse:collapse;width:100%;font-size:10px}th,td{border-bottom:1px solid #DCE5F2;padding:7px;text-align:left}th{background:#FFF7E7}</style></head><body><h1>V A I R A  A I · Keuangan Sehat</h1><p>Data lokal perangkat · dibuat ${escapeHtml(new Date().toLocaleString("id-ID"))}</p><p>Dokumen ini adalah catatan perencanaan umum, bukan diagnosis medis atau nasihat keuangan profesional.</p><h2>Profil individu</h2><table><thead><tr><th>Nama</th><th>Umur</th><th>Tinggi cm</th><th>Berat kg</th></tr></thead><tbody>${people}</tbody></table><h2>Rincian bahan pangan</h2><table><thead><tr><th>Kelompok</th><th>Bahan</th><th>Jumlah</th><th>Harga</th><th>Frekuensi</th><th>Estimasi/bulan</th></tr></thead><tbody>${foods}</tbody></table><p>Perkiraan total pangan: Rp${Math.round(profile.foods.reduce((total, food) => total + monthlyFoodCost(food), 0)).toLocaleString("id-ID")}/bulan.</p></body></html>`;
  if (Platform.OS === "web") { await Print.printAsync({ html }); return; }
  const result = await Print.printToFileAsync({ html });
  if (!(await Sharing.isAvailableAsync())) throw new Error("Berbagi file tidak tersedia pada perangkat ini.");
  await Sharing.shareAsync(result.uri, { UTI: ".pdf", mimeType: "application/pdf", dialogTitle: "Bagikan Keuangan Sehat PDF" });
}
