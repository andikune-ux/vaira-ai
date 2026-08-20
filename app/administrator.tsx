import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { Animated, Alert, Easing, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";

import { OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { AiraAccessTokenPanel } from "@/components/aira-access-token-panel";
import { ScreenContainer } from "@/components/screen-container";
import { useFinance } from "@/lib/finance/finance-context";
import { exportExcelAdministratorAccounts, exportExcelGlobalRoomReports } from "@/lib/finance/report-export";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

const ADMIN_BOOT_DURATION_MS = 120_000;
const SPCA_ROBOT_ASSET = { uri: "/manus-storage/spca-robot-transparent_36305bef.png" };
const BOOT_SPCA_EXPRESSIONS = [
  { label: "Menganalisis jaringan", face: "⌕", accessory: "⌁" },
  { label: "Terkaget", face: "!◉", accessory: "✦" },
  { label: "Senang", face: "•ᴗ•", accessory: "♡" },
  { label: "Mengumpulkan energi", face: "^ᴗ^", accessory: "⚡" },
  { label: "Menjaga konsol", face: "◉_◉", accessory: "◌" },
  { label: "Bingung", face: "◔_◔", accessory: "?" },
  { label: "Ngambek", face: "¬_¬", accessory: "☁" },
  { label: "Tertawa", face: "˶^ᴗ^˶", accessory: "✧" },
  { label: "Mengantuk", face: "-ᴗ-", accessory: "zZ" },
  { label: "Siap bertugas", face: "◕ᴗ◕", accessory: "✓" },
];
type Stage = "boot" | "login" | "console";
type AccountStatus = "active" | "disabled" | "blocked" | "closing" | "blacklisted";
type AdminAccount = {
  id: number; publicId: string | null; fullName: string; username: string; birthDate: string; email: string; phone: string;
  status: AccountStatus; createdAt: Date; lastLoginAt: Date | null;
};
type AccountPatch = {
  fullName?: string; publicId?: string; accountUsername?: string; birthDate?: string; email?: string; phone?: string;
  status?: AccountStatus; newPassword?: string;
};
type CloudBackupStatus = "active" | "restricted" | "deleted";
type PendingAccountAction = { account: AdminAccount; status: AccountStatus; title: string; detail: string };

function MatrixRain() {
  const columns = useMemo(() => Array.from({ length: 18 }, (_, index) => index), []);
  const values = useRef(columns.map(() => new Animated.Value(Math.random()))).current;
  useEffect(() => {
    const loops = values.map((value, index) => Animated.loop(Animated.sequence([
      Animated.timing(value, { toValue: 1, duration: 4200 + (index % 6) * 710, delay: (index % 5) * 160, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])));
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [values]);
  return <View pointerEvents="none" style={styles.matrix}>{columns.map((column, index) => <Animated.Text key={column} style={[styles.matrixColumn, { left: `${(index / columns.length) * 100}%`, opacity: values[index].interpolate({ inputRange: [0, .15, .8, 1], outputRange: [.1, .65, .28, .08] }), transform: [{ translateY: values[index].interpolate({ inputRange: [0, 1], outputRange: [-280, 720] }) }] }]}>{"010110\nA1RAX\n> SYS\n00101\nDB::\n11010\nSYNC\n00101\nROOT\n11010\n"}</Animated.Text>)}</View>;
}

function AccountAction({ label, icon, tone = "normal", onPress }: { label: string; icon: React.ComponentProps<typeof MaterialIcons>["name"]; tone?: "normal" | "warning" | "danger"; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.accountAction, tone === "warning" && styles.accountActionWarning, tone === "danger" && styles.accountActionDanger, pressed && styles.pressed]}><MaterialIcons name={icon} size={14} color="#eaffef" /><Text style={styles.accountActionText}>{label}</Text></Pressable>;
}

function AdminMenuButton({ icon, label, detail, onPress }: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; label: string; detail: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.adminMenuButton, pressed && styles.pressed]}><View style={styles.adminMenuIcon}><MaterialIcons name={icon} size={21} color="#58ff9a" /></View><Text style={styles.adminMenuLabel}>{label}</Text><Text style={styles.adminMenuDetail}>{detail}</Text></Pressable>;
}

export default function AdministratorScreen() {
  const { state, replaceAllData } = useFinance();
  const [stage, setStage] = useState<Stage>("boot");
  const [percent, setPercent] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountQuery, setAccountQuery] = useState("");
  const [moderationAccountId, setModerationAccountId] = useState("");
  const [moderationReason, setModerationReason] = useState("");
  const [globalBlockDuration, setGlobalBlockDuration] = useState("0");
  const [editor, setEditor] = useState<AdminAccount | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [bootSpcaTaps, setBootSpcaTaps] = useState(0);
  const [bootExpressionIndex, setBootExpressionIndex] = useState(0);
  const [accountListMode, setAccountListMode] = useState<"regular" | "blacklist">("regular");
  const [pendingAccountAction, setPendingAccountAction] = useState<PendingAccountAction | null>(null);
  const [accountActionNotice, setAccountActionNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [reportStatusFilter, setReportStatusFilter] = useState<"all" | "pending" | "reviewing" | "resolved" | "dismissed">("all");
  const [roomLocked, setRoomLocked] = useState(false);
  const previousPendingReports = useRef<number | null>(null);
  const verify = trpc.administrator.verify.useMutation();
  const status = trpc.administrator.globalTestSnapshot.status.useQuery({ username, password }, { enabled: stage === "console" && username.length > 0 && password.length > 0, retry: false });
  const pull = trpc.administrator.globalTestSnapshot.pull.useQuery(undefined, { enabled: false, retry: false });
  const push = trpc.administrator.globalTestSnapshot.push.useMutation();
  const accounts = trpc.manualAccount.adminList.useQuery({ username, password, query: accountQuery || undefined }, { enabled: stage === "console", retry: false });
  const updateAccount = trpc.manualAccount.adminUpdate.useMutation();
  const cloudBackups = trpc.airaxCloud.adminList.useQuery({ username, password, query: accountQuery || undefined }, { enabled: stage === "console", retry: false });
  const updateCloudBackup = trpc.airaxCloud.adminUpdate.useMutation();
  const moderateRoom = trpc.globalRoom.adminModerate.useMutation();
  const adminBlockRoom = trpc.globalRoom.adminBlock.useMutation();
  const auditLogs = trpc.administrator.auditLog.useQuery({ username, password, limit: 60 }, { enabled: stage === "console", retry: false });
  const reports = trpc.administrator.reports.useQuery({ username, password }, { enabled: stage === "console", retry: false, refetchInterval: 10000 });
  const adminMessages = trpc.globalRoom.adminMessages.useQuery({ username, password }, { enabled: stage === "console", retry: false, refetchInterval: 5000 });
  const pendingProfileComments = trpc.globalRoom.adminPendingProfileComments.useQuery({ username, password }, { enabled: stage === "console", retry: false, refetchInterval: 10000 });
  const moderateProfileComment = trpc.globalRoom.adminModerateProfileComment.useMutation({ onSuccess: () => { void pendingProfileComments.refetch(); } });
  const deleteRoomMessage = trpc.globalRoom.adminDeleteMessage.useMutation();
  const reviewReport = trpc.administrator.reviewReport.useMutation();
  const visibleReports = (reports.data ?? []).filter((report) => reportStatusFilter === "all" || report.status === reportStatusFilter);
  const pendingReportCount = (reports.data ?? []).filter((report) => report.status === "pending").length;
  const [selectedReport, setSelectedReport] = useState<NonNullable<typeof reports.data>[number] | null>(null);
  const showAdvancedPanels = false;

  useEffect(() => {
    if (stage === "console" && previousPendingReports.current !== null && pendingReportCount > previousPendingReports.current) Alert.alert("Laporan Room Global baru", `${pendingReportCount - previousPendingReports.current} laporan baru menunggu tinjauan.`);
    previousPendingReports.current = pendingReportCount;
  }, [stage, pendingReportCount]);

  useEffect(() => {
    if (stage !== "boot") return;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const value = Math.min(100, Math.round(((Date.now() - startedAt) / ADMIN_BOOT_DURATION_MS) * 100));
      setPercent(value);
      if (value >= 100) { clearInterval(interval); setStage("login"); }
    }, 250);
    return () => clearInterval(interval);
  }, [stage]);

  const progressExpression = percent < 22 ? { label: "Menganalisis jaringan", face: "⌕" } : percent < 48 ? { label: "Memeriksa modul", face: "•ᴗ•" } : percent < 78 ? { label: "Menyiapkan konsol", face: "◉_◉" } : { label: "Hampir selesai", face: "^ᴗ^" };
  const bootExpression = bootSpcaTaps > 0 ? BOOT_SPCA_EXPRESSIONS[bootExpressionIndex % BOOT_SPCA_EXPRESSIONS.length] : { ...progressExpression, accessory: "" };
  const skipUnlocked = bootSpcaTaps >= 10;
  const visibleAccounts = (accounts.data ?? []).filter((account) => accountListMode === "blacklist" ? account.status === "blacklisted" : account.status !== "blacklisted");
  const statusText = (value: AccountStatus) => ({ active: "Aktif", disabled: "Nonaktif", blocked: "Diblokir", closing: "Penutupan 30 hari", blacklisted: "Dihapus / blacklist" })[value];

  const verifyAccess = async () => {
    try {
      const result = await verify.mutateAsync({ username, password });
      if (!result.verified) { Alert.alert("Akses ditolak", "Nama pengguna atau kata sandi administrator tidak sesuai."); return; }
      setStage("console");
    } catch { Alert.alert("Verifikasi belum tersedia", "Periksa koneksi server lalu coba lagi."); }
  };
  const tapBootSpca = () => {
    setBootSpcaTaps((current) => current + 1);
    setBootExpressionIndex((current) => (current + 1) % BOOT_SPCA_EXPRESSIONS.length);
  };
  const pullSnapshot = async () => {
    try {
      const result = await pull.refetch();
      if (!result.data) { Alert.alert("Snapshot belum tersedia", "Belum ada snapshot global untuk lingkungan uji."); return; }
      await replaceAllData(JSON.parse(result.data.payload));
      Alert.alert("Snapshot diterapkan", "Data lokal telah diganti oleh snapshot global lingkungan uji.");
    } catch { Alert.alert("Unduhan belum berhasil", "Periksa koneksi server lalu coba lagi."); }
  };
  const pushSnapshot = async () => {
    try {
      const result = await push.mutateAsync({ payload: JSON.stringify(state), username, password });
      Alert.alert("Snapshot global diperbarui", `Data uji tersimpan pada ${new Date(result.updatedAt).toLocaleTimeString("id-ID")}.`);
      await status.refetch();
      await auditLogs.refetch();
    } catch { Alert.alert("Penyimpanan ditolak", "Verifikasi administrator dan koneksi server diperlukan."); }
  };
  const applyAccountUpdate = async (accountId: number, patch: AccountPatch, successMessage: string) => {
    try {
      await updateAccount.mutateAsync({ username, password, accountId, ...patch });
      setTemporaryPassword("");
      await accounts.refetch();
      await auditLogs.refetch();
      setAccountActionNotice({ tone: "success", text: successMessage });
      return true;
    } catch (error) {
      setAccountActionNotice({ tone: "error", text: getUserFacingError(error, "Tindakan belum berhasil. Periksa data Administrator dan koneksi server lalu coba lagi.") });
      return false;
    }
  };
  const openAccountAction = (account: AdminAccount, status: AccountStatus, title: string, detail: string) => setPendingAccountAction({ account, status, title, detail });
  const confirmPendingAccountAction = async () => {
    if (!pendingAccountAction) return;
    const succeeded = await applyAccountUpdate(pendingAccountAction.account.id, { status: pendingAccountAction.status }, pendingAccountAction.detail);
    if (succeeded) setPendingAccountAction(null);
  };
  const saveEditor = () => {
    if (!editor) return;
    void applyAccountUpdate(editor.id, { fullName: editor.fullName.trim(), publicId: editor.publicId?.trim() || undefined, accountUsername: editor.username.trim().toLowerCase(), birthDate: editor.birthDate, email: editor.email.trim().toLowerCase(), phone: editor.phone.trim() }, "Data profil dan ID publik akun telah diperbarui.").then((succeeded) => { if (succeeded) setEditor(null); });
  };
  const deleteGlobalMessage = async (messageId: number) => {
    try {
      await deleteRoomMessage.mutateAsync({ username, password, messageId });
      await adminMessages.refetch();
      await auditLogs.refetch();
      setAccountActionNotice({ tone: "success", text: "Pesan Room Global dihapus dan ditandai sebagai Pesan dihapus admin." });
    } catch (error) {
      setAccountActionNotice({ tone: "error", text: getUserFacingError(error, "Pesan belum dapat dihapus. Periksa akses Administrator dan koneksi server.") });
    }
  };
  const blockGlobalRoom = async () => {
    const accountId = Number(moderationAccountId);
    const durationSeconds = Number(globalBlockDuration);
    if (!Number.isInteger(accountId) || accountId <= 0) { Alert.alert("Peserta diperlukan", "Masukkan account ID peserta yang akan diblokir."); return; }
    if (!Number.isFinite(durationSeconds) || durationSeconds < 0 || durationSeconds > 2_592_000) { Alert.alert("Durasi tidak valid", "Isi durasi 0 untuk permanen atau maksimal 2.592.000 detik untuk satu bulan."); return; }
    try { await adminBlockRoom.mutateAsync({ username, password, accountId, durationSeconds }); await auditLogs.refetch(); Alert.alert("Blokir diterapkan", durationSeconds === 0 ? "Peserta diblokir permanen." : `Peserta diblokir selama ${durationSeconds} detik.`); } catch (error) { Alert.alert("Blokir ditolak", getUserFacingError(error, "Tindakan belum berhasil. Periksa data lalu coba lagi.")); }
  };
  const moderateGlobalRoom = async (action: "muteMic" | "blockAudio" | "requestUnmute" | "kick" | "lockRoom" | "unlockRoom") => {
    const accountId = Number(moderationAccountId);
    if (!["lockRoom", "unlockRoom"].includes(action) && (!Number.isInteger(accountId) || accountId <= 0)) { Alert.alert("Peserta diperlukan", "Masukkan account ID peserta yang sedang aktif di Room Global."); return; }
    try {
      await moderateRoom.mutateAsync({ username, password, action, accountId: ["lockRoom", "unlockRoom"].includes(action) ? undefined : accountId, reason: moderationReason.trim() || undefined });
      await auditLogs.refetch();
      Alert.alert("Moderasi diterapkan", action === "muteMic" ? "Mic peserta dimatikan. Peserta tetap harus menyetujui sendiri bila ingin unmute." : "Tindakan Room Global berhasil dicatat.");
    } catch (error) { Alert.alert("Moderasi ditolak", getUserFacingError(error, "Peserta mungkin sudah keluar atau koneksi server bermasalah.")); }
  };
  const updateReportStatus = async (reportId: number, nextStatus: "reviewing" | "resolved" | "dismissed") => {
    try {
      await reviewReport.mutateAsync({ username, password, reportId, status: nextStatus });
      await reports.refetch();
      await auditLogs.refetch();
    } catch (error) {
      Alert.alert("Laporan belum diperbarui", getUserFacingError(error, "Tindakan belum berhasil. Periksa data Administrator dan koneksi server lalu coba lagi."));
    }
  };
  const updateCloudStatus = (backupId: number, nextStatus: CloudBackupStatus, title: string, detail: string) => {
    Alert.alert(title, detail, [
      { text: "Batal", style: "cancel" },
      {
        text: "Lanjut",
        style: nextStatus === "deleted" ? "destructive" : "default",
        onPress: () => {
          void (async () => {
            try {
              await updateCloudBackup.mutateAsync({ username, password, backupId, status: nextStatus });
              await cloudBackups.refetch();
              await auditLogs.refetch();
              Alert.alert("Arsip diperbarui", detail);
            } catch (error) {
              Alert.alert("Tindakan belum berhasil", getUserFacingError(error, "Periksa koneksi lalu coba kembali."));
            }
          })();
        },
      },
    ]);
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><View style={styles.root}><MatrixRain /><View style={styles.topBar}><Pressable onPress={() => router.back()} style={styles.back}><MaterialIcons name="arrow-back" size={21} color="#58ff9a" /></Pressable><Text style={styles.topLabel}>AiraX // ADMIN CONSOLE</Text><View style={styles.liveDot} /></View>
    {stage === "boot" ? <View style={styles.boot}>{skipUnlocked ? <Pressable accessibilityLabel="Pintasan administrator" onPress={() => setStage("login")} style={({ pressed }) => [styles.skipRocket, pressed && styles.pressed]}><Text style={styles.skipRocketText}>🚀</Text></Pressable> : null}<Text style={styles.bootOverline}>MODE ADMINISTRATOR // INISIALISASI TERKENDALI</Text><Text style={styles.bootTitle}>MEMUAT NODE SERVER</Text><Pressable accessibilityLabel="Wajah Robot SPCA pemuatan" onPress={tapBootSpca} style={({ pressed }) => [styles.scanCard, pressed && styles.spcaPressed]}><ExpoImage source={SPCA_ROBOT_ASSET} contentFit="contain" style={styles.spcaBoot} /><View style={styles.faceScreen}><Text style={styles.faceText}>{bootExpression.face}</Text></View><Text style={styles.expressionAccessory}>{bootExpression.accessory}</Text><Text style={styles.expression}>{bootExpression.label}</Text></Pressable><View style={styles.progressDock}><View style={styles.progressLine}><View style={[styles.progressFill, { width: `${percent}%` }]} /><View style={[styles.progressRobot, { left: `${Math.max(0, Math.min(92, percent - 4))}%` }]}><ExpoImage source={SPCA_ROBOT_ASSET} contentFit="contain" style={styles.progressRobotImage} /></View></View><View style={styles.progressMeta}><Text style={styles.progressText}>PROGRESS {String(percent).padStart(3, "0")}%</Text><Text style={styles.progressText}>{Math.max(0, Math.ceil((ADMIN_BOOT_DURATION_MS * (100 - percent)) / 100000))}:00</Text></View></View></View> : null}
    {stage === "login" ? <View style={styles.centerCard}><Text style={styles.terminalPrompt}>root@airax:~$ authorize --administrator</Text><Text style={styles.loginTitle}>OTORISASI ADMINISTRATOR</Text><Text style={styles.loginDetail}>Masukkan kredensial administrator untuk membuka SERVER DATABASE lingkungan uji.</Text><TextInput value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} placeholder="Username" placeholderTextColor="#438d61" style={styles.terminalInput} /><View style={styles.passwordRow}><TextInput value={password} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} secureTextEntry={!showPassword} placeholder="Password" placeholderTextColor="#438d61" style={[styles.terminalInput, styles.passwordInput]} /><Pressable accessibilityLabel={showPassword ? "Sembunyikan password administrator" : "Tampilkan password administrator"} onPress={() => setShowPassword((value) => !value)} style={styles.passwordToggle}><MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={19} color="#58ff9a" /></Pressable></View><PrimaryButton label={verify.isPending ? "Memverifikasi…" : "OK · Masuk"} icon="login" onPress={() => { void verifyAccess(); }} /></View> : null}
    {stage === "console" ? <ScrollView contentContainerStyle={styles.console} showsVerticalScrollIndicator={false}><Text style={styles.consoleOverline}>NODE TERHUBUNG · MODE UJI TERKONTROL</Text><Text style={styles.consoleTitle}>SERVER DATABASE</Text><View style={styles.roomEntryCard}><View style={styles.accountText}><Text style={styles.panelLabel}>ROOM GLOBAL</Text><Text style={styles.panelDetail}>Buka jendela Room Global sebagai administrator. Syarat login, usia minimal 16 tahun, dan persetujuan tetap diterapkan.</Text></View><OutlineButton label="Masuk Room Global" icon="groups" onPress={() => router.push({ pathname: "/global-room", params: { adminMode: "1", username, password } } as never)} /></View><AiraAccessTokenPanel username={username} password={password} /><Text style={styles.compactHint}>Pilih kategori untuk membuka halaman pengelolaan khusus.</Text><View style={styles.adminMenuGrid}><AdminMenuButton icon="manage-accounts" label="Akun & blacklist" detail="Daftar dan pengkinian data" onPress={() => router.push({ pathname: "/administrator-accounts", params: { username, password } } as never)} /><AdminMenuButton icon="vpn-key" label="Token Aira" detail="Buat, cabut, dan retensi" onPress={() => router.push({ pathname: "/administrator-tokens", params: { username, password } } as never)} /><AdminMenuButton icon="history" label="Audit" detail="Riwayat tindakan admin" onPress={() => router.push({ pathname: "/administrator-audit", params: { username, password } } as never)} /><AdminMenuButton icon="cloud" label="AiraXCloud" detail="Arsip dan pemulihan" onPress={() => router.push({ pathname: "/administrator-cloud", params: { username, password } } as never)} /><AdminMenuButton icon="flag" label="Laporan" detail="Laporan Room Global" onPress={() => router.push({ pathname: "/administrator-room-reports", params: { username, password } } as never)} /><AdminMenuButton icon="chat" label="Pesan Room" detail="Hapus pesan admin" onPress={() => router.push({ pathname: "/administrator-room-messages", params: { username, password } } as never)} /><AdminMenuButton icon="tune" label="Moderasi Room" detail="Pengaturan gerigi admin" onPress={() => router.push({ pathname: "/administrator-room-settings", params: { username, password } } as never)} /></View><View style={styles.terminalPanel}><Text style={styles.panelLabel}>STATUS LINGKUNGAN</Text><Text style={styles.panelValue}>personal-test / snapshot-global</Text><Text style={styles.panelDetail}>Snapshot tersedia: {status.data?.hasSnapshot ? "YA" : "BELUM"}{status.data?.updatedAt ? ` · ${new Date(status.data.updatedAt).toLocaleString("id-ID")}` : ""}</Text></View><View style={styles.terminalPanel}><Text style={styles.panelLabel}>DATA LOKAL SAAT INI</Text><Text style={styles.panelValue}>{state.wallets.length} dompet · {state.transactions.length} transaksi · {state.commitments.length} komitmen</Text><Text style={styles.panelDetail}>Unduhan otomatis berjalan saat aplikasi dibuka atau kembali terhubung.</Text></View><View style={styles.consoleActions}><OutlineButton label="Tarik snapshot global" icon="cloud-download" onPress={() => { void pullSnapshot(); }} /><OutlineButton label={push.isPending ? "Menyimpan…" : "Simpan snapshot global"} icon="cloud-upload" onPress={() => { void pushSnapshot(); }} />    </View>
      {showAdvancedPanels ? <><View style={styles.terminalPanel}><Text style={styles.panelLabel}>MODERASI ROOM GLOBAL</Text><Text style={styles.panelDetail}>Kontrol berlaku hanya untuk peserta aktif. Moderator tidak dapat menyalakan mic atau speaker perangkat secara paksa.</Text><TextInput value={moderationAccountId} onChangeText={setModerationAccountId} keyboardType="number-pad" placeholder="Account ID peserta aktif" placeholderTextColor="#438d61" style={styles.terminalInput} /><TextInput value={moderationReason} onChangeText={setModerationReason} placeholder="Alasan tindakan (opsional)" placeholderTextColor="#438d61" style={styles.terminalInput} /><View style={styles.consoleActions}><OutlineButton label="Mute mic" icon="mic-off" onPress={() => { void moderateGlobalRoom("muteMic"); }} /><OutlineButton label="Hentikan audio" icon="volume-off" onPress={() => { void moderateGlobalRoom("blockAudio"); }} /><OutlineButton label="Minta unmute" icon="notifications" onPress={() => { void moderateGlobalRoom("requestUnmute"); }} /><OutlineButton label="Keluarkan" icon="logout" onPress={() => { void moderateGlobalRoom("kick"); }} /></View><View style={styles.consoleActions}><OutlineButton label={roomLocked ? "Buka room" : "Kunci room"} icon={roomLocked ? "lock-open" : "lock"} onPress={() => { const action = roomLocked ? "unlockRoom" : "lockRoom"; void moderateGlobalRoom(action); setRoomLocked((value) => !value); }} /></View></View>
      <View style={styles.terminalPanel}><Text style={styles.panelLabel}>AKSI PESAN DAN BLOKIR ROOM</Text><Text style={styles.panelDetail}>Fungsi lama tetap tersedia di panel lanjutan. Pilih peserta atau pesan tertentu sebelum melakukan tindakan.</Text><TextInput value={globalBlockDuration} onChangeText={setGlobalBlockDuration} keyboardType="number-pad" placeholder="Durasi blokir dalam detik (0 = permanen)" placeholderTextColor="#438d61" style={styles.terminalInput} /><View style={styles.consoleActions}><OutlineButton label="Blokir peserta" icon="block" onPress={() => { void blockGlobalRoom(); }} /></View>{adminMessages.isLoading ? <Text style={styles.panelDetail}>Memuat pesan Room Global…</Text> : adminMessages.data?.length ? adminMessages.data.slice(0, 20).map((message) => <View key={message.id} style={styles.auditRow}><View style={styles.accountText}><Text style={styles.accountName}>#{message.id} · {message.displayName}</Text><Text style={styles.accountDetail}>{message.content}</Text></View><AccountAction label="Hapus" icon="delete" tone="danger" onPress={() => { void deleteGlobalMessage(message.id); }} /></View>) : <Text style={styles.panelDetail}>Belum ada pesan Room Global.</Text>}</View><View style={styles.terminalPanel}><View style={styles.accountListHeader}><View style={styles.accountText}><Text style={styles.panelLabel}>KOMENTAR FOTO ADMIN VAIRA · {(pendingProfileComments.data ?? []).length} PENDING</Text><Text style={styles.panelDetail}>Komentar baru tidak tampil publik sebelum disetujui administrator.</Text></View><AccountAction label="Segarkan" icon="refresh" onPress={() => { void pendingProfileComments.refetch(); }} /></View>{pendingProfileComments.isLoading ? <Text style={styles.panelDetail}>Memuat komentar pending…</Text> : (pendingProfileComments.data ?? []).length ? (pendingProfileComments.data ?? []).map((comment) => <View key={comment.id} style={styles.accountCard}><View style={styles.accountText}><Text style={styles.accountName}>#{comment.id} · {comment.authorDisplayName}</Text><Text style={styles.accountDetail}>{comment.content}</Text><Text style={styles.accountDetail}>{new Date(comment.createdAt).toLocaleString("id-ID")}</Text></View><View style={styles.actionGrid}><AccountAction label="Setujui" icon="check-circle" onPress={() => { void moderateProfileComment.mutateAsync({ username, password, commentId: comment.id, status: "approved" }); }} /><AccountAction label="Tolak" icon="close" tone="danger" onPress={() => { void moderateProfileComment.mutateAsync({ username, password, commentId: comment.id, status: "rejected" }); }} /></View></View>) : <Text style={styles.panelDetail}>Belum ada komentar pending.</Text>}</View><View style={styles.terminalPanel}><View style={styles.accountListHeader}><View style={styles.accountText}><Text style={styles.panelLabel}>LAPORAN ROOM GLOBAL · {pendingReportCount} PENDING</Text><Text style={styles.panelDetail}>Laporan peserta dapat ditinjau berdasarkan kategori, status, dan prioritas.</Text></View><View style={styles.actionGrid}><AccountAction label="Semua" icon="list" onPress={() => setReportStatusFilter("all")} /><AccountAction label="Pending" icon="hourglass-empty" tone="warning" onPress={() => setReportStatusFilter("pending")} /><AccountAction label="Ditinjau" icon="visibility" onPress={() => setReportStatusFilter("reviewing")} /><AccountAction label="Selesai" icon="check-circle" onPress={() => setReportStatusFilter("resolved")} /><AccountAction label="Diabaikan" icon="close" tone="warning" onPress={() => setReportStatusFilter("dismissed")} /><AccountAction label="Ekspor Excel" icon="download" onPress={() => { void exportExcelGlobalRoomReports(visibleReports).catch(() => Alert.alert("Ekspor belum berhasil", "Periksa penyimpanan atau koneksi lalu coba lagi.")); }} /></View></View>{reports.isLoading ? <Text style={styles.panelDetail}>Memuat laporan Room Global…</Text> : visibleReports.length ? visibleReports.map((report) => <Pressable key={report.id} onPress={() => setSelectedReport(report)} style={styles.accountCard}><View style={styles.accountText}><Text style={styles.accountName}>#{report.id} · {report.reportedDisplayName} · @{report.reportedUsername}</Text><Text style={styles.accountDetail}>Kategori: {report.reason} · prioritas {report.priority} · dari @{report.reporterUsername}</Text><Text style={styles.accountDetail}>Status: {report.status} · {new Date(report.createdAt).toLocaleString("id-ID")}</Text></View><View style={styles.actionGrid}>{report.status === "pending" ? <AccountAction label="Tinjau peserta" icon="visibility" onPress={() => { setModerationAccountId(String(report.reportedAccountId)); void updateReportStatus(report.id, "reviewing"); }} /> : null}{report.status !== "resolved" ? <AccountAction label="Selesaikan" icon="check-circle" onPress={() => { void updateReportStatus(report.id, "resolved"); }} /> : null}{report.status !== "dismissed" ? <AccountAction label="Abaikan" icon="close" tone="warning" onPress={() => { void updateReportStatus(report.id, "dismissed"); }} /> : null}<AccountAction label="Mute mic" icon="mic-off" tone="warning" onPress={() => { setModerationAccountId(String(report.reportedAccountId)); void moderateGlobalRoom("muteMic"); }} /></View></Pressable>) : <Text style={styles.panelDetail}>Belum ada laporan Room Global.</Text>}</View>
      <View style={styles.terminalPanel}><View style={styles.accountListHeader}><View style={styles.accountText}><Text style={styles.panelLabel}>KOMENTAR FOTO ADMIN VAIRA · {(pendingProfileComments.data ?? []).length} PENDING</Text><Text style={styles.panelDetail}>Komentar baru menunggu persetujuan sebelum tampil publik.</Text></View><AccountAction label="Segarkan" icon="refresh" onPress={() => { void pendingProfileComments.refetch(); }} /></View>{(pendingProfileComments.data ?? []).length ? (pendingProfileComments.data ?? []).map((comment) => <View key={comment.id} style={styles.accountCard}><View style={styles.accountText}><Text style={styles.accountName}>#{comment.id} · {comment.authorDisplayName}</Text><Text style={styles.accountDetail}>{comment.content}</Text></View><View style={styles.actionGrid}><AccountAction label="Setujui" icon="check-circle" onPress={() => { void moderateProfileComment.mutateAsync({ username, password, commentId: comment.id, status: "approved" }); }} /><AccountAction label="Tolak" icon="close" tone="danger" onPress={() => { void moderateProfileComment.mutateAsync({ username, password, commentId: comment.id, status: "rejected" }); }} /></View></View>) : <Text style={styles.panelDetail}>{pendingProfileComments.isLoading ? "Memuat komentar pending…" : "Belum ada komentar pending."}</Text>}</View>
      <View style={styles.terminalPanel}><View style={styles.accountListHeader}><View style={styles.accountText}><Text style={styles.panelLabel}>{accountListMode === "blacklist" ? "DAFTAR AKUN BLACKLIST" : "AKUN TERDAFTAR"} · {visibleAccounts.length}</Text><Text style={styles.panelDetail}>{accountListMode === "blacklist" ? "Akun blacklist disimpan untuk audit dan tidak dapat login." : "Password dan token tidak ditampilkan atau diekspor."}</Text></View><AccountAction label={accountListMode === "blacklist" ? "Akun aktif" : "Blacklist"} icon={accountListMode === "blacklist" ? "people" : "block"} tone={accountListMode === "blacklist" ? "normal" : "warning"} onPress={() => setAccountListMode((current) => current === "blacklist" ? "regular" : "blacklist")} /></View><TextInput value={accountQuery} onChangeText={setAccountQuery} placeholder="Cari nama, username, email, WhatsApp" placeholderTextColor="#438d61" style={styles.terminalInput} />{accountListMode === "regular" ? <OutlineButton label="Unduh Excel data akun" icon="download" onPress={() => { if (!accounts.data?.length) { setAccountActionNotice({ tone: "error", text: "Belum ada akun yang dapat diekspor." }); return; } void exportExcelAdministratorAccounts(accounts.data).catch(() => setAccountActionNotice({ tone: "error", text: "Ekspor belum berhasil." })); }} /> : null}{accounts.isLoading ? <Text style={styles.panelDetail}>Memuat data akun…</Text> : visibleAccounts.length ? visibleAccounts.map((account) => <View key={account.id} style={styles.accountCard}><View style={styles.accountText}><Text style={styles.accountName}>{account.fullName} · @{account.username}</Text><Text style={styles.accountDetail}>{account.email} · {account.phone}</Text><Text style={styles.accountDetail}>Status: {statusText(account.status)} · dibuat {new Date(account.createdAt).toLocaleDateString("id-ID")}</Text></View><View style={styles.actionGrid}>{account.status === "blacklisted" ? <AccountAction label="Pulihkan akun" icon="restore" onPress={() => openAccountAction(account, "active", "Pulihkan akun", "Akun akan diaktifkan kembali.")} /> : <><AccountAction label="Kelola" icon="edit" onPress={() => setEditor({ ...account })} />{account.status === "active" ? <><AccountAction label="Nonaktif" icon="pause-circle-outline" tone="warning" onPress={() => openAccountAction(account, "disabled", "Nonaktifkan akun", "Akun tidak dapat login hingga diaktifkan kembali.")} /><AccountAction label="Blokir" icon="block" tone="danger" onPress={() => openAccountAction(account, "blocked", "Blokir akun", "Seluruh sesi akun akan dicabut.")} /></> : null}{account.status === "disabled" ? <AccountAction label="Aktifkan" icon="check-circle-outline" onPress={() => openAccountAction(account, "active", "Aktifkan akun", "Akun dapat login kembali.")} /> : null}{account.status === "blocked" ? <AccountAction label="Buka blokir" icon="lock-open" onPress={() => openAccountAction(account, "active", "Buka blokir akun", "Akun kembali aktif.")} /> : null}<AccountAction label="Tutup 30 hari" icon="event-busy" tone="warning" onPress={() => openAccountAction(account, "closing", "Tutup akun", "Akun masuk masa penutupan 30 hari.")} /><AccountAction label="Hapus akun" icon="delete-forever" tone="danger" onPress={() => openAccountAction(account, "blacklisted", "Hapus akun bertahap", "Akun menjadi blacklist dan seluruh sesi dicabut.")} /></>}</View></View>) : <Text style={styles.panelDetail}>{accountListMode === "blacklist" ? "Belum ada akun dalam daftar blacklist." : "Belum ada akun yang sesuai."}</Text>}</View>
      <View style={styles.terminalPanel}><Text style={styles.panelLabel}>AIRAXCLOUD · {cloudBackups.data?.length ?? 0} ARSIP</Text><Text style={styles.panelDetail}>Arsip ditampilkan berdasarkan username. Isi cadangan tidak ditampilkan.</Text>{cloudBackups.isLoading ? <Text style={styles.panelDetail}>Memuat arsip AiraXCloud…</Text> : cloudBackups.data?.length ? cloudBackups.data.map((backup) => <View key={backup.id} style={styles.accountCard}><View style={styles.accountText}><Text style={styles.accountName}>@{backup.username} · {backup.fileName}</Text><Text style={styles.accountDetail}>{formatCloudSize(backup.sizeBytes)} · {new Date(backup.createdAt).toLocaleString("id-ID")} · {cloudStatusText(backup.status)}</Text></View><View style={styles.actionGrid}>{backup.status !== "active" ? <AccountAction label="Aktifkan" icon="cloud-done" onPress={() => updateCloudStatus(backup.id, "active", "Aktifkan arsip", "Arsip dapat dipulihkan kembali.")} /> : <AccountAction label="Batasi" icon="cloud-off" tone="warning" onPress={() => updateCloudStatus(backup.id, "restricted", "Batasi arsip", "Arsip tidak dapat dipulihkan sementara.")} />}{backup.status !== "deleted" ? <AccountAction label="Hapus arsip" icon="delete-forever" tone="danger" onPress={() => updateCloudStatus(backup.id, "deleted", "Hapus arsip", "Arsip dihapus dari daftar pemulihan.")} /> : <Text style={styles.deletedLabel}>Arsip dihapus</Text>}</View></View>) : <Text style={styles.panelDetail}>Belum ada arsip AiraXCloud.</Text>}</View>
      <View style={styles.terminalPanel}><Text style={styles.panelLabel}>RIWAYAT AUDIT ADMINISTRATOR · {auditLogs.data?.length ?? 0}</Text><Text style={styles.panelDetail}>Jejak tindakan tanpa password, token, atau isi cadangan.</Text>{auditLogs.isLoading ? <Text style={styles.panelDetail}>Memuat riwayat audit…</Text> : auditLogs.data?.length ? auditLogs.data.map((log) => <View key={log.id} style={styles.auditRow}><View style={styles.accountText}><Text style={styles.accountName}>{log.action}</Text><Text style={styles.accountDetail}>{log.targetLabel} · {log.detail}</Text><Text style={styles.accountDetail}>{new Date(log.createdAt).toLocaleString("id-ID")} · admin @{log.adminUsername}</Text></View></View>) : <Text style={styles.panelDetail}>Belum ada tindakan administrator.</Text>}</View>
      {editor ? <View style={styles.terminalPanel}><Text style={styles.panelLabel}>KELOLA AKUN · @{editor.username}</Text><Text style={styles.panelDetail}>Pengkinian identifier ditolak bila dipakai akun lain.</Text><TextInput value={editor.publicId ?? ""} onChangeText={(value) => setEditor((current) => current ? { ...current, publicId: value.replace(/\D/g, "").slice(0, 12) } : null)} keyboardType="number-pad" placeholder="ID publik 9–12 digit" placeholderTextColor="#438d61" style={styles.terminalInput} /><TextInput value={editor.fullName} onChangeText={(value) => setEditor((current) => current ? { ...current, fullName: value } : null)} placeholder="Nama lengkap" placeholderTextColor="#438d61" style={styles.terminalInput} /><TextInput value={editor.username} onChangeText={(value) => setEditor((current) => current ? { ...current, username: value } : null)} autoCapitalize="none" placeholder="Username" placeholderTextColor="#438d61" style={styles.terminalInput} /><TextInput value={editor.birthDate} onChangeText={(value) => setEditor((current) => current ? { ...current, birthDate: value } : null)} placeholder="Tanggal lahir YYYY-MM-DD" placeholderTextColor="#438d61" style={styles.terminalInput} /><TextInput value={editor.email} onChangeText={(value) => setEditor((current) => current ? { ...current, email: value } : null)} autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor="#438d61" style={styles.terminalInput} /><TextInput value={editor.phone} onChangeText={(value) => setEditor((current) => current ? { ...current, phone: value } : null)} keyboardType="phone-pad" placeholder="WhatsApp" placeholderTextColor="#438d61" style={styles.terminalInput} /><PrimaryButton label="Simpan pembaruan data" icon="save" onPress={saveEditor} /><OutlineButton label="Batal" icon="close" onPress={() => { setEditor(null); setTemporaryPassword(""); }} /><View style={styles.divider} /><Text style={styles.panelLabel}>RESET KATA SANDI AMAN</Text><Text style={styles.panelDetail}>Masukkan password sementara minimal 8 karakter.</Text><View style={styles.passwordRow}><TextInput value={temporaryPassword} onChangeText={setTemporaryPassword} secureTextEntry={!showPassword} placeholder="Password sementara baru" placeholderTextColor="#438d61" style={[styles.terminalInput, styles.passwordInput]} /><Pressable accessibilityLabel={showPassword ? "Sembunyikan password baru" : "Tampilkan password baru"} onPress={() => setShowPassword((value) => !value)} style={styles.passwordToggle}><MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={19} color="#58ff9a" /></Pressable></View><AccountAction label="Reset password" icon="vpn-key" tone="warning" onPress={() => { if (temporaryPassword.length < 8) { Alert.alert("Password terlalu pendek", "Gunakan minimal 8 karakter."); return; } Alert.alert("Reset password", "Password sementara akan diterapkan dan sesi akun dicabut.", [{ text: "Batal", style: "cancel" }, { text: "Reset", style: "destructive", onPress: () => { void applyAccountUpdate(editor.id, { newPassword: temporaryPassword }, "Password sementara diterapkan."); } }]); }} /><View style={styles.divider} /><Text style={styles.panelLabel}>PENUTUPAN DAN PENGHAPUSAN</Text><Text style={styles.panelDetail}>Penutupan memberi masa pembatalan 30 hari. Penghapusan bertahap membuat akun blacklist dan mencabut akses.</Text><View style={styles.actionGrid}><AccountAction label="Tutup 30 hari" icon="event-busy" tone="warning" onPress={() => openAccountAction(editor, "closing", "Tutup akun", "Akun memasuki masa penutupan 30 hari.")} /><AccountAction label="Hapus bertahap" icon="delete-forever" tone="danger" onPress={() => openAccountAction(editor, "blacklisted", "Hapus akun bertahap", "Akun menjadi blacklist dan seluruh sesi dicabut.")} /></View></View> : null}
      </> : null}
    </ScrollView> : null}
{selectedReport ? <View style={styles.reportDetailOverlay}><View style={styles.reportDetailSheet}><View style={styles.accountListHeader}><View style={styles.accountText}><Text style={styles.panelLabel}>DETAIL LAPORAN #{selectedReport.id}</Text><Text style={styles.accountName}>{selectedReport.reportedDisplayName} · @{selectedReport.reportedUsername}</Text></View><AccountAction label="Tutup" icon="close" onPress={() => setSelectedReport(null)} /></View><Text style={styles.panelDetail}>Pelapor: @{selectedReport.reporterUsername}</Text><Text style={styles.panelDetail}>Kategori: {selectedReport.reason} · Prioritas: {selectedReport.priority}</Text><Text style={styles.panelDetail}>Status: {selectedReport.status}</Text><Text style={styles.panelDetail}>Dibuat: {new Date(selectedReport.createdAt).toLocaleString("id-ID")}</Text>{selectedReport.details ? <Text style={styles.detailBlock}>Keterangan: {selectedReport.details}</Text> : null}{selectedReport.contextMessage ? <Text style={styles.detailBlock}>Konteks pesan: {selectedReport.contextMessage}</Text> : <Text style={styles.panelDetail}>Tidak ada konteks pesan yang tersimpan.</Text>}<View style={styles.actionGrid}>{selectedReport.status === "pending" ? <AccountAction label="Tinjau peserta" icon="visibility" onPress={() => { setModerationAccountId(String(selectedReport.reportedAccountId)); void updateReportStatus(selectedReport.id, "reviewing"); setSelectedReport((current) => current ? { ...current, status: "reviewing" } : null); }} /> : null}<AccountAction label="Mute mic peserta" icon="mic-off" tone="warning" onPress={() => { setModerationAccountId(String(selectedReport.reportedAccountId)); void moderateGlobalRoom("muteMic"); }} /><AccountAction label="Tutup detail" icon="close" onPress={() => setSelectedReport(null)} /></View></View></View> : null}{accountActionNotice ? <Pressable accessibilityLabel="Tutup status tindakan" onPress={() => setAccountActionNotice(null)} style={[styles.actionNotice, accountActionNotice.tone === "error" && styles.actionNoticeError]}><Text style={styles.actionNoticeText}>{accountActionNotice.text}</Text></Pressable> : null}{pendingAccountAction ? <View style={styles.accountActionOverlay}><View style={styles.accountActionSheet}><Text style={styles.panelLabel}>{pendingAccountAction.title.toUpperCase()}</Text><Text style={styles.accountActionSheetText}>@{pendingAccountAction.account.username}</Text><Text style={styles.panelDetail}>{pendingAccountAction.detail}</Text><View style={styles.actionGrid}><AccountAction label="Batal" icon="close" onPress={() => setPendingAccountAction(null)} /><AccountAction label={updateAccount.isPending ? "Memproses…" : "Konfirmasi"} icon="check" tone={pendingAccountAction.status === "blacklisted" ? "danger" : "warning"} onPress={() => { void confirmPendingAccountAction(); }} /></View></View></View> : null}
  </View></ScreenContainer>;
}

function formatCloudSize(value: number) { return value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / (1024 * 1024)).toFixed(1)} MB`; }
function cloudStatusText(value: CloudBackupStatus) { return ({ active: "Aktif", restricted: "Dibatasi", deleted: "Dihapus" })[value]; }

const styles = StyleSheet.create({
  roomEntryCard: { backgroundColor: "#0b2a18", borderColor: "#58ff9a", borderRadius: 14, borderWidth: 1, gap: 10, marginBottom: 12, padding: 14 }, compactHint: { color: "#9dd8af", fontSize: 11, marginTop: 2 }, adminMenuGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, adminMenuButton: { backgroundColor: "#07170d", borderColor: "#27663d", borderRadius: 12, borderWidth: 1, minHeight: 104, padding: 11, width: "31%" }, adminMenuIcon: { alignItems: "center", backgroundColor: "#102b1a", borderColor: "#3a9c5d", borderRadius: 10, borderWidth: 1, height: 36, justifyContent: "center", marginBottom: 8, width: 36 }, adminMenuLabel: { color: "#eaffef", fontSize: 12, fontWeight: "900" }, adminMenuDetail: { color: "#9dd8af", fontSize: 10, lineHeight: 14, marginTop: 3 }, advancedToggle: { alignItems: "center", borderColor: "#27663d", borderRadius: 9, borderWidth: 1, flexDirection: "row", gap: 6, justifyContent: "center", paddingVertical: 9 }, advancedToggleText: { color: "#58ff9a", fontSize: 11, fontWeight: "800" },
  passwordRow: { position: "relative" },
  passwordInput: { paddingRight: 44 },
  passwordToggle: { alignItems: "center", height: 44, justifyContent: "center", position: "absolute", right: 2, top: 0, width: 40 },
  skipRocket: { alignItems: "center", backgroundColor: "rgba(34,255,117,.08)", borderColor: "rgba(92,255,155,.18)", borderRadius: 7, borderWidth: StyleSheet.hairlineWidth, height: 18, justifyContent: "center", left: 2, opacity: .35, position: "absolute", top: 5, width: 18, zIndex: 3 },
  skipRocketText: { fontSize: 9 },
  spcaPressed: { opacity: .86, transform: [{ scale: .98 }] },
  accountListHeader: { alignItems: "flex-start", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  expressionAccessory: { color: "#d4ffe1", fontFamily: "monospace", fontSize: 14, fontWeight: "900", marginTop: -8, position: "absolute", right: "22%", top: "24%" },
  actionNotice: { backgroundColor: "rgba(26,130,65,.96)", borderColor: "#78f5a5", borderRadius: 10, borderWidth: 1, bottom: 18, left: 18, padding: 11, position: "absolute", right: 18, zIndex: 7 },
  actionNoticeError: { backgroundColor: "rgba(150,47,47,.97)", borderColor: "#ffaaaa" },
  actionNoticeText: { color: "#effff4", fontSize: 12, fontWeight: "800", lineHeight: 18 },
  accountActionOverlay: { alignItems: "center", backgroundColor: "rgba(0,0,0,.62)", bottom: 0, justifyContent: "center", left: 0, padding: 24, position: "absolute", right: 0, top: 0, zIndex: 8 }, reportDetailOverlay: { alignItems: "center", backgroundColor: "rgba(0,0,0,.82)", bottom: 0, justifyContent: "center", left: 0, padding: 18, position: "absolute", right: 0, top: 0, zIndex: 9 }, reportDetailSheet: { backgroundColor: "#082313", borderColor: "#69ef99", borderRadius: 15, borderWidth: 1, gap: 10, maxWidth: 520, padding: 18, width: "100%" }, detailBlock: { backgroundColor: "rgba(25,92,48,.35)", borderColor: "rgba(105,239,153,.28)", borderRadius: 9, borderWidth: 1, color: "#d9ffe6", fontSize: 12, lineHeight: 18, padding: 10 },
  accountActionSheet: { backgroundColor: "#082313", borderColor: "#69ef99", borderRadius: 15, borderWidth: 1, gap: 10, maxWidth: 460, padding: 18, width: "100%" },
  accountActionSheetText: { color: "#e1ffe9", fontFamily: "monospace", fontSize: 15, fontWeight: "900" },
  auditRow: { borderBottomColor: "rgba(114,255,162,.18)", borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 9 },
  root: { backgroundColor: "#020704", flex: 1, overflow: "hidden", paddingHorizontal: 18 }, matrix: { ...StyleSheet.absoluteFillObject, overflow: "hidden" }, matrixColumn: { color: "#28ee70", fontFamily: "monospace", fontSize: 11, letterSpacing: 1, lineHeight: 17, position: "absolute", textShadowColor: "#19d85f", textShadowRadius: 6, top: 0 }, topBar: { alignItems: "center", borderBottomColor: "rgba(69,255,138,.28)", borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 10, minHeight: 58 }, back: { alignItems: "center", borderColor: "rgba(88,255,154,.35)", borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, height: 36, justifyContent: "center", width: 36 }, topLabel: { color: "#8bffb1", flex: 1, fontFamily: "monospace", fontSize: 11, fontWeight: "800", letterSpacing: 1 }, liveDot: { backgroundColor: "#40fb7f", borderRadius: 5, height: 9, shadowColor: "#40fb7f", shadowOpacity: .9, shadowRadius: 8, width: 9 }, boot: { flex: 1, justifyContent: "center" }, bootOverline: { color: "#46ef82", fontFamily: "monospace", fontSize: 11, letterSpacing: .8, textAlign: "center" }, bootTitle: { color: "#d5ffe3", fontFamily: "monospace", fontSize: 25, fontWeight: "900", letterSpacing: 1.5, marginTop: 9, textAlign: "center" }, scanCard: { alignItems: "center", height: 230, justifyContent: "center", marginVertical: 12, position: "relative" }, spcaBoot: { height: 150, width: 150 }, faceScreen: { alignItems: "center", backgroundColor: "#10241a", borderColor: "#55ff91", borderRadius: 10, borderWidth: 1, height: 45, justifyContent: "center", left: "50%", position: "absolute", top: "42%", transform: [{ translateX: -22 }], width: 46 }, faceText: { color: "#9effba", fontFamily: "monospace", fontSize: 19, fontWeight: "900" }, expression: { color: "#77d998", fontFamily: "monospace", fontSize: 12, marginTop: -18 }, progressDock: { borderColor: "rgba(77,255,141,.46)", borderRadius: 13, borderWidth: 1, padding: 12 }, progressLine: { backgroundColor: "#0a2111", borderRadius: 7, height: 14, overflow: "visible", position: "relative" }, progressFill: { backgroundColor: "#35f47c", borderRadius: 7, height: "100%", shadowColor: "#35f47c", shadowOpacity: .9, shadowRadius: 9 }, progressRobot: { bottom: -17, height: 49, position: "absolute", width: 49 }, progressRobotImage: { height: 49, width: 49 }, progressMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 13 }, progressText: { color: "#74da97", fontFamily: "monospace", fontSize: 11, fontWeight: "800" }, centerCard: { alignSelf: "center", backgroundColor: "rgba(4,21,10,.94)", borderColor: "rgba(68,255,135,.52)", borderRadius: 16, borderWidth: 1, gap: 12, marginTop: "40%", maxWidth: 470, padding: 18, width: "100%" }, terminalPrompt: { color: "#6ced98", fontFamily: "monospace", fontSize: 11 }, loginTitle: { color: "#e3ffec", fontFamily: "monospace", fontSize: 19, fontWeight: "900", letterSpacing: .8 }, loginDetail: { color: "#79bf91", fontSize: 12, lineHeight: 18 }, terminalInput: { borderColor: "#2a8f4f", borderRadius: 10, borderWidth: 1, color: "#caffd9", fontFamily: "monospace", minHeight: 48, paddingHorizontal: 12 }, console: { gap: 13, paddingBottom: 30, paddingTop: 28 }, consoleOverline: { color: "#66ea92", fontFamily: "monospace", fontSize: 11, letterSpacing: .8 }, consoleTitle: { color: "#effff4", fontFamily: "monospace", fontSize: 28, fontWeight: "900", letterSpacing: 1.2 }, terminalPanel: { backgroundColor: "rgba(4,28,13,.89)", borderColor: "rgba(78,255,139,.38)", borderRadius: 13, borderWidth: 1, gap: 9, padding: 14 }, panelLabel: { color: "#6be995", fontFamily: "monospace", fontSize: 10, fontWeight: "800", letterSpacing: .7 }, panelValue: { color: "#d8ffe5", fontFamily: "monospace", fontSize: 14, fontWeight: "800" }, panelDetail: { color: "#8bb99a", fontSize: 11, lineHeight: 17 }, consoleActions: { gap: 9 },   accountCard: { borderTopColor: "rgba(78,255,139,.26)", borderTopWidth: StyleSheet.hairlineWidth, gap: 9, paddingTop: 11 }, messageAdminRow: { alignItems: "center", borderTopColor: "rgba(78,255,139,.26)", borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 8, paddingVertical: 9 }, messageAdminMeta: { color: "#8bb99a", fontFamily: "monospace", fontSize: 10, fontWeight: "800" }, messageAdminText: { color: "#d9ffe6", fontSize: 11, lineHeight: 16 }, deletedAdminMessage: { color: "#ffaaaa", fontSize: 11, fontStyle: "italic", lineHeight: 16 }, accountText: { gap: 2 }, accountName: { color: "#d9ffe6", fontSize: 12, fontWeight: "800" }, accountDetail: { color: "#8bb99a", fontSize: 10, lineHeight: 15 }, actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, accountAction: { alignItems: "center", backgroundColor: "rgba(52,174,93,.20)", borderColor: "rgba(107,233,149,.58)", borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 5, paddingHorizontal: 9, paddingVertical: 8 }, accountActionWarning: { backgroundColor: "rgba(255,187,57,.18)", borderColor: "#e1b84d" }, accountActionDanger: { backgroundColor: "rgba(255,92,92,.20)", borderColor: "#ee8585" }, accountActionText: { color: "#ecfff1", fontSize: 10, fontWeight: "800" }, deletedLabel: { color: "#ffaaaa", fontSize: 10, fontWeight: "800", paddingVertical: 7 }, divider: { backgroundColor: "rgba(99,255,151,.22)", height: StyleSheet.hairlineWidth, marginVertical: 4 }, pressed: { opacity: .7, transform: [{ scale: .98 }] },
});
