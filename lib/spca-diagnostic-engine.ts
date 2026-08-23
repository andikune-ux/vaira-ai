export type SpcaSeverity = "info" | "warning" | "critical";
export type SpcaActionId = "retry" | "camera-permission" | "microphone-permission" | "location-permission" | "notification-permission" | "clear-cache" | "report";
export type SpcaPermissionState = "granted" | "denied" | "undetermined" | "unavailable";

export type SpcaRuntimeSnapshot = {
  capturedAt: string;
  network: "online" | "offline" | "unknown";
  internetReachable: boolean | null;
  server: "healthy" | "unreachable" | "unknown";
  camera: SpcaPermissionState;
  microphone: SpcaPermissionState;
  location: SpcaPermissionState;
  notifications: SpcaPermissionState;
  temporaryCacheBytes: number;
  runtimeErrorAt?: string;
};

export type SpcaFinding = {
  id: string;
  severity: SpcaSeverity;
  title: string;
  summary: string;
  action?: { id: SpcaActionId; label: string };
};

export const SPCA_CACHE_WARNING_BYTES = 50 * 1024 * 1024;

export function createSpcaFindings(snapshot: SpcaRuntimeSnapshot): SpcaFinding[] {
  const findings: SpcaFinding[] = [];
  if (snapshot.network === "offline") findings.push({ id: "network-offline", severity: "critical", title: "Perangkat sedang offline", summary: "SPCA tidak dapat memeriksa server atau mengirim laporan sampai jaringan kembali tersedia.", action: { id: "retry", label: "Periksa ulang" } });
  else if (snapshot.internetReachable === false) findings.push({ id: "internet-unreachable", severity: "warning", title: "Internet belum dapat dijangkau", summary: "Perangkat tampak tersambung ke jaringan, tetapi layanan online belum dapat dijangkau.", action: { id: "retry", label: "Periksa ulang" } });
  else if (snapshot.server === "unreachable") findings.push({ id: "server-unreachable", severity: "warning", title: "Server aplikasi belum merespons", summary: "Internet tersedia, tetapi pemeriksaan kesehatan server belum menerima respons. Layanan Aira dan sinkronisasi dapat terpengaruh.", action: { id: "retry", label: "Periksa ulang" } });
  if (snapshot.runtimeErrorAt) findings.push({ id: "runtime-error", severity: "warning", title: "Kesalahan aplikasi terbaru terdeteksi", summary: "SPCA menyimpan ringkasan yang sudah disaring agar dapat ditinjau atau dilaporkan tanpa isi percakapan dan data rahasia.", action: { id: "report", label: "Siapkan laporan" } });
  const permissions: Array<[SpcaPermissionState, string, string, SpcaActionId]> = [
    [snapshot.camera, "Kamera", "Pindai Bukti dan kamera Aira tidak dapat dipakai sampai izin kamera diberikan.", "camera-permission"],
    [snapshot.microphone, "Mikrofon", "Pesan suara dan rekaman tidak dapat dipakai sampai izin mikrofon diberikan.", "microphone-permission"],
    [snapshot.location, "Lokasi", "Jadwal salat dan cuaca presisi memerlukan izin lokasi.", "location-permission"],
    [snapshot.notifications, "Notifikasi", "Pengingat dan alarm salat tidak dapat muncul sampai izin notifikasi diberikan.", "notification-permission"],
  ];
  for (const [state, label, summary, action] of permissions) {
    if (state === "denied") findings.push({ id: `${action}-denied`, severity: "warning", title: `Izin ${label} ditolak`, summary, action: { id: action, label: "Periksa izin" } });
    else if (state === "undetermined") findings.push({ id: `${action}-needed`, severity: "info", title: `Izin ${label} belum diperiksa`, summary, action: { id: action, label: "Periksa izin" } });
  }
  if (snapshot.temporaryCacheBytes >= SPCA_CACHE_WARNING_BYTES) findings.push({ id: "cache-large", severity: "warning", title: "Cache sementara cukup besar", summary: "Pembersihan cache hanya menghapus berkas sementara; data keuangan, chat, pengaturan, dan cadangan tetap aman.", action: { id: "clear-cache", label: "Bersihkan cache" } });
  if (!findings.length) findings.push({ id: "healthy", severity: "info", title: "SPCA tidak menemukan masalah utama", summary: "Jaringan, izin yang diperiksa, cache, dan catatan error terakhir tampak normal. SPCA tetap akan memantau perubahan.", action: { id: "retry", label: "Pindai ulang" } });
  return findings;
}

export function createSafeSpcaReport(snapshot: SpcaRuntimeSnapshot, findings: SpcaFinding[]) {
  return {
    createdAt: snapshot.capturedAt,
    severity: findings.some((item) => item.severity === "critical") ? "critical" as const : findings.some((item) => item.severity === "warning") ? "warning" as const : "info" as const,
    codes: findings.map((item) => item.id).slice(0, 12),
    summary: findings.map((item) => item.title).join("; ").slice(0, 600),
  };
}
