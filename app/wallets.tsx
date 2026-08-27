import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AiraCard, EmptyState, PrimaryButton } from "@/components/aira-ui";
import { FinanceAuditButton } from "@/components/finance-audit-button";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import { formatCurrency, getWalletBalance } from "@/lib/finance/finance-utils";
import type { WalletKind } from "@/lib/finance/types";

type BrandEntry = { id: string; label: string; kind: "bank" | "e_wallet"; initials: string; color: string };

const BRAND_CATALOG: BrandEntry[] = [
  { id: "bca", label: "Bank Central Asia", kind: "bank", initials: "BCA", color: "#1464A5" },
  { id: "mandiri", label: "Bank Mandiri", kind: "bank", initials: "BM", color: "#163B70" },
  { id: "bni", label: "Bank Negara Indonesia", kind: "bank", initials: "BNI", color: "#F36F21" },
  { id: "bri", label: "Bank Rakyat Indonesia", kind: "bank", initials: "BRI", color: "#1671B9" },
  { id: "cimb", label: "Bank CIMB Niaga", kind: "bank", initials: "CIMB", color: "#7B1526" },
  { id: "danamon", label: "Bank Danamon", kind: "bank", initials: "D", color: "#E57D24" },
  { id: "permata", label: "Bank Permata", kind: "bank", initials: "P", color: "#2E65B0" },
  { id: "ocbc", label: "Bank OCBC NISP", kind: "bank", initials: "OCBC", color: "#C72520" },
  { id: "maybank", label: "Bank Maybank Indonesia", kind: "bank", initials: "M", color: "#F4C542" },
  { id: "panin", label: "Panin Bank", kind: "bank", initials: "PB", color: "#2B79B9" },
  { id: "btn", label: "Bank Tabungan Negara", kind: "bank", initials: "BTN", color: "#1B75BB" },
  { id: "mega", label: "Bank Mega", kind: "bank", initials: "MEGA", color: "#E8A627" },
  { id: "bsi", label: "Bank Syariah Indonesia", kind: "bank", initials: "BSI", color: "#39A58B" },
  { id: "bjb", label: "Bank Jawa Barat (BJB)", kind: "bank", initials: "BJB", color: "#1F6C99" },
  { id: "jatim", label: "Bank Jawa Timur", kind: "bank", initials: "JATIM", color: "#A22D38" },
  { id: "sinarmas", label: "Bank Sinarmas", kind: "bank", initials: "SM", color: "#E25C2A" },
  { id: "jago", label: "Bank Jago", kind: "bank", initials: "JAGO", color: "#F15A29" },
  { id: "blu", label: "blu by BCA Digital", kind: "bank", initials: "blu", color: "#2D75D6" },
  { id: "seabank", label: "SeaBank Indonesia", kind: "bank", initials: "SEA", color: "#0B8FDC" },
  { id: "neo", label: "Bank Neo Commerce", kind: "bank", initials: "BNC", color: "#E93D5B" },
  { id: "krom", label: "Krom Bank Indonesia", kind: "bank", initials: "KROM", color: "#5638B7" },
  { id: "amar", label: "Bank Amar Indonesia", kind: "bank", initials: "AMAR", color: "#1B9C85" },
  { id: "raya", label: "Bank Raya Indonesia", kind: "bank", initials: "RAYA", color: "#F2A900" },
  { id: "hibank", label: "Hibank Indonesia", kind: "bank", initials: "H", color: "#00A0A8" },
  { id: "allo", label: "Allo Bank", kind: "bank", initials: "ALLO", color: "#E83E8C" },
  { id: "gopay", label: "GoPay", kind: "e_wallet", initials: "GO", color: "#00A86B" },
  { id: "ovo", label: "OVO", kind: "e_wallet", initials: "OVO", color: "#4E2A84" },
  { id: "dana", label: "DANA", kind: "e_wallet", initials: "D", color: "#2F80C9" },
  { id: "linkaja", label: "LinkAja", kind: "e_wallet", initials: "LA", color: "#D62828" },
  { id: "shopeepay", label: "ShopeePay", kind: "e_wallet", initials: "SP", color: "#EE4D2D" },
  { id: "superbank", label: "Superbank", kind: "e_wallet", initials: "SB", color: "#6B4EFF" },
  { id: "pospay", label: "PosPay", kind: "e_wallet", initials: "POS", color: "#D9232E" },
  { id: "astrapay", label: "AstraPay", kind: "e_wallet", initials: "ASTRA", color: "#0C6EAD" },
  { id: "sakuku", label: "Sakuku", kind: "e_wallet", initials: "SAKU", color: "#008CBA" },
  { id: "isaku", label: "i.saku", kind: "e_wallet", initials: "i.s", color: "#F4A623" },
  { id: "doku", label: "DOKU", kind: "e_wallet", initials: "DOKU", color: "#3C3C95" },
  { id: "kaspro", label: "KasPro", kind: "e_wallet", initials: "KP", color: "#00A884" },
  { id: "true money", label: "TrueMoney", kind: "e_wallet", initials: "TM", color: "#F58220" },
];

const OFFICIAL_DOMAINS: Record<string, string> = {
  bca: "bca.co.id", mandiri: "bankmandiri.co.id", bni: "bni.co.id", bri: "bri.co.id", cimb: "cimbniaga.co.id", danamon: "danamon.co.id", permata: "permatabank.com", ocbc: "ocbc.id", maybank: "maybank.co.id", panin: "panin.co.id", btn: "btn.co.id", mega: "bankmega.com", bsi: "bankbsi.co.id", bjb: "bankbjb.co.id", jatim: "bankjatim.co.id", sinarmas: "banksinarmas.com", jago: "bankjago.com", blu: "blubybcadigital.id", seabank: "seabank.co.id", neo: "bankneo.co.id", krom: "krom.id", amar: "amarbank.co.id", raya: "bankraya.co.id", hibank: "hibank.co.id", allo: "allobank.com", gopay: "gopay.co.id", ovo: "ovo.id", dana: "dana.id", linkaja: "linkaja.id", shopeepay: "shopeepay.co.id", superbank: "superbank.id", pospay: "pospay.id", astrapay: "astrapay.com", sakuku: "sakuku.co.id", isaku: "isaku.id", doku: "doku.com", kaspro: "kaspro.id", "true money": "truemoney.co.id",
};

const OFFICIAL_LOCAL_ASSETS: Record<string, number> = {
  bca: require("@/assets/images/brands/bca-official.png"),
  bri: require("@/assets/images/brands/bri-provider.png"),
  bsi: require("@/assets/images/brands/bsi-provider.png"),
  ocbc: require("@/assets/images/brands/ocbc-official.png"),
  maybank: require("@/assets/images/brands/maybank-google.png"),
  btn: require("@/assets/images/brands/btn-official.png"),
  mega: require("@/assets/images/brands/bankmega-official.png"),
  bjb: require("@/assets/images/brands/bjb-official.png"),
  sinarmas: require("@/assets/images/brands/sinarmas-official.png"),
  seabank: require("@/assets/images/brands/seabank-google.png"),
  neo: require("@/assets/images/brands/bnc-official.png"),
  krom: require("@/assets/images/brands/krom-public-wordmark.png"),
  amar: require("@/assets/images/brands/amar-official.webp"),
  raya: require("@/assets/images/brands/raya-official.png"),
  mandiri: require("@/assets/images/brands/mandiri-official.png"),
  cimb: require("@/assets/images/brands/cimb-niaga-provider.png"),
  jago: require("@/assets/images/brands/jago-google.png"),
  blu: require("@/assets/images/brands/blu-official.png"),
  ovo: require("@/assets/images/brands/ovo-official.png"),
  danamon: require("@/assets/images/brands/danamon-provider.png"),
  permata: require("@/assets/images/brands/permata-provider.png"),
  dana: require("@/assets/images/brands/dana-official.png"),
  linkaja: require("@/assets/images/brands/linkaja-official.png"),
  superbank: require("@/assets/images/brands/superbank-official.png"),
  astrapay: require("@/assets/images/brands/astrapay-fixed.webp"),
  doku: require("@/assets/images/brands/doku-google.png"),
  kaspro: require("@/assets/images/brands/kaspro-official.png"),
  "true money": require("@/assets/images/brands/truemoney-official.png"),
  isaku: require("@/assets/images/brands/isaku-official.png"),
  bni: require("@/assets/images/brands/bni-official.png"),
  gopay: require("@/assets/images/brands/gopay-official.png"),
  shopeepay: require("@/assets/images/brands/shopeepay-official.png"),
  jatim: require("@/assets/images/brands/bank-jatim-official.png"),
  panin: require("@/assets/images/brands/panin-official.png"),
  pospay: require("@/assets/images/brands/pospay-official.png"),
  sakuku: require("@/assets/images/brands/sakuku-official.jpg"),
  hibank: require("@/assets/images/brands/hibank-official.png"),
  allo: require("@/assets/images/brands/allo-official.png"),
};

const WALLET_OPTIONS: { kind: WalletKind; label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }[] = [
  { kind: "bank", label: "Bank", icon: "account-balance", color: "#2F80FF" },
  { kind: "e_wallet", label: "E-wallet", icon: "smartphone", color: "#9C6BFF" },
  { kind: "cash", label: "Tunai", icon: "payments", color: "#18B68A" },
  { kind: "asset", label: "Aset", icon: "inventory-2", color: "#E89B22" },
];

function BrandMark({ entry, size = 44 }: { entry?: BrandEntry; size?: number }) {
  const localAsset = entry ? OFFICIAL_LOCAL_ASSETS[entry.id] : undefined;
  const sourceDomain = entry ? OFFICIAL_DOMAINS[entry.id] : undefined;
  const [localFailed, setLocalFailed] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);
  useEffect(() => { setLocalFailed(false); setGoogleFailed(false); }, [entry?.id]);
  const googleLogoUri = sourceDomain ? `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(sourceDomain)}` : undefined;
  const showLocal = Boolean(localAsset) && !localFailed;
  const showGoogle = !showLocal && Boolean(googleLogoUri) && !googleFailed;
  return <View style={[styles.brandMark, { backgroundColor: entry?.color ?? "#31435F", height: size, width: size }]}><Text style={[styles.brandMarkText, { fontSize: entry && entry.initials.length > 3 ? 8 : 11 }]}>{entry?.initials ?? "?"}</Text>{showLocal ? <Image source={localAsset} accessibilityLabel={`Logo bank lokal ${entry?.label}`} onError={() => setLocalFailed(true)} resizeMode="contain" style={[styles.officialLogo, { height: size - 8, width: size - 8 }]} /> : showGoogle ? <Image source={{ uri: googleLogoUri }} accessibilityLabel={`Logo ${entry?.label} dari Google`} onError={() => setGoogleFailed(true)} resizeMode="contain" style={[styles.officialLogo, { height: size - 8, width: size - 8 }]} /> : null}</View>;
}

export default function WalletsScreen() {
  const colors = useColors();
  const { state, addWallet, updateWallet, removeWallet } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [kind, setKind] = useState<WalletKind>("bank");
  const [catalogTab, setCatalogTab] = useState<"bank" | "e_wallet">("bank");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const selectedBrand = useMemo(() => BRAND_CATALOG.find((entry) => entry.label === name), [name]);
  const filteredBrands = useMemo(() => BRAND_CATALOG.filter((entry) => entry.kind === catalogTab && entry.label.toLowerCase().includes(catalogQuery.toLowerCase().trim())), [catalogQuery, catalogTab]);

  const resetForm = () => { setName(""); setOpeningBalance(""); setAccountNumber(""); setKind("bank"); setEditingId(null); setIsAdding(false); setManualMode(false); setCatalogQuery(""); };
  const startEdit = (wallet: (typeof state.wallets)[number]) => { setEditingId(wallet.id); setName(wallet.name); setOpeningBalance(String(wallet.openingBalance)); setAccountNumber(wallet.accountNumber ?? ""); setKind(wallet.kind); setManualMode(!BRAND_CATALOG.some((entry) => entry.label === wallet.name)); setIsAdding(true); };
  const chooseBrand = (entry: BrandEntry) => { setName(entry.label); setKind(entry.kind); setManualMode(false); setPickerVisible(false); };
  const saveWallet = async () => {
    const balance = Number(openingBalance.replace(/[^0-9]/g, ""));
    if (!name.trim()) { Alert.alert("Nama belum diisi", "Pilih bank/dompet digital atau gunakan opsi manual."); return; }
    const option = WALLET_OPTIONS.find((item) => item.kind === kind)!;
    const patch = { name: name.trim(), kind, openingBalance: Number.isFinite(balance) ? balance : 0, accountNumber: accountNumber.trim() || undefined, color: selectedBrand?.color ?? option.color };
    if (editingId) await updateWallet(editingId, patch); else await addWallet(patch);
    resetForm();
  };

  const confirmRemoveWallet = (wallet: (typeof state.wallets)[number]) => {
    const relatedTransactions = state.transactions.filter((transaction) => transaction.walletId === wallet.id || transaction.toWalletId === wallet.id).length;
    Alert.alert(
      `Hapus ${wallet.name}?`,
      relatedTransactions > 0
        ? `Dompet akan dihapus bersama ${relatedTransactions} riwayat mutasi yang memakai dompet ini, termasuk transfer terkait. Dompet lain tidak akan berubah.`
        : "Dompet ini belum memiliki riwayat mutasi. Data dompet akan dihapus dari perangkat dan sinkronisasi akun ini.",
      [
        { text: "Batal", style: "cancel" },
        { text: "Hapus dompet", style: "destructive", onPress: () => { void removeWallet(wallet.id).then((result) => Alert.alert("Dompet dihapus", result.removedTransactions > 0 ? `${result.removedTransactions} riwayat mutasi dan transfer terkait ikut dihapus.` : "Data dompet sudah dihapus.")); } },
      ],
    );
  };

  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={styles.headerText}><Text style={[styles.title, { color: colors.foreground }]}>Sumber dana & aset</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Pilih bank atau dompet digital, lalu isi saldo awal.</Text><FinanceAuditButton /></View><Pressable onPress={() => setIsAdding(!isAdding)} style={({ pressed }) => [styles.add, { backgroundColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name={isAdding ? "close" : "add"} size={23} color="#FFFFFF" /></Pressable></View>
    {isAdding ? <AiraCard style={styles.form}><Text style={[styles.formTitle, { color: colors.foreground }]}>{editingId ? "Edit sumber dana" : "Tambah sumber dana"}</Text><View style={styles.catalogTabs}><Pressable onPress={() => { setCatalogTab("bank"); setKind("bank"); }} style={[styles.catalogTab, { borderColor: catalogTab === "bank" ? colors.primary : colors.border, backgroundColor: catalogTab === "bank" ? `${colors.primary}15` : colors.background }]}><MaterialIcons name="account-balance" size={17} color={catalogTab === "bank" ? colors.primary : colors.muted} /><Text style={[styles.catalogTabText, { color: catalogTab === "bank" ? colors.primary : colors.foreground }]}>Bank</Text></Pressable><Pressable onPress={() => { setCatalogTab("e_wallet"); setKind("e_wallet"); }} style={[styles.catalogTab, { borderColor: catalogTab === "e_wallet" ? colors.primary : colors.border, backgroundColor: catalogTab === "e_wallet" ? `${colors.primary}15` : colors.background }]}><MaterialIcons name="smartphone" size={17} color={catalogTab === "e_wallet" ? colors.primary : colors.muted} /><Text style={[styles.catalogTabText, { color: catalogTab === "e_wallet" ? colors.primary : colors.foreground }]}>Dompet digital</Text></Pressable></View>{!manualMode ? <Pressable onPress={() => { setCatalogQuery(""); setPickerVisible(true); }} style={[styles.pickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}><View style={styles.pickerButtonLeft}><BrandMark entry={selectedBrand} size={36} /><View style={styles.flex}><Text style={[styles.pickerLabel, { color: colors.muted }]}>Bank atau dompet digital</Text><Text numberOfLines={1} style={[styles.pickerValue, { color: colors.foreground }]}>{selectedBrand?.label ?? "Pilih sumber dana"}</Text></View></View><MaterialIcons name="unfold-more" size={21} color={colors.muted} /></Pressable> : null}<Pressable onPress={() => { setManualMode((value) => !value); if (!manualMode) { setName(""); setKind(catalogTab); } }} style={styles.manualButton}><MaterialIcons name="edit" size={16} color={colors.primary} /><Text style={[styles.manualButtonText, { color: colors.primary }]}>{manualMode ? "Kembali ke pilihan bank/dompet" : "Pilih manual / isi sendiri"}</Text></Pressable><Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={() => setPickerVisible(false)}><View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.background }]}><View style={styles.modalHeader}><View style={styles.flex}><Text style={[styles.modalTitle, { color: colors.foreground }]}>Pilih sumber dana</Text><Text style={[styles.modalSubtitle, { color: colors.muted }]}>Pilih logo dan nama bank atau dompet digital.</Text></View><Pressable onPress={() => setPickerVisible(false)} style={styles.modalClose}><MaterialIcons name="close" size={20} color={colors.foreground} /></Pressable></View><View style={styles.catalogTabs}><Pressable onPress={() => { setCatalogTab("bank"); setKind("bank"); }} style={[styles.catalogTab, { borderColor: catalogTab === "bank" ? colors.primary : colors.border, backgroundColor: catalogTab === "bank" ? `${colors.primary}15` : colors.background }]}><MaterialIcons name="account-balance" size={17} color={catalogTab === "bank" ? colors.primary : colors.muted} /><Text style={[styles.catalogTabText, { color: catalogTab === "bank" ? colors.primary : colors.foreground }]}>Bank</Text></Pressable><Pressable onPress={() => { setCatalogTab("e_wallet"); setKind("e_wallet"); }} style={[styles.catalogTab, { borderColor: catalogTab === "e_wallet" ? colors.primary : colors.border, backgroundColor: catalogTab === "e_wallet" ? `${colors.primary}15` : colors.background }]}><MaterialIcons name="smartphone" size={17} color={catalogTab === "e_wallet" ? colors.primary : colors.muted} /><Text style={[styles.catalogTabText, { color: catalogTab === "e_wallet" ? colors.primary : colors.foreground }]}>Dompet digital</Text></Pressable></View><TextInput autoFocus value={catalogQuery} onChangeText={setCatalogQuery} placeholder={catalogTab === "bank" ? "Cari nama bank" : "Cari dompet digital"} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalList}>{filteredBrands.map((entry) => <Pressable key={entry.id} onPress={() => chooseBrand(entry)} style={({ pressed }) => [styles.modalOption, { borderColor: name === entry.label ? colors.primary : colors.border, backgroundColor: name === entry.label ? `${colors.primary}12` : colors.surface }, pressed && styles.pressed]}><BrandMark entry={entry} size={38} /><Text numberOfLines={2} style={[styles.modalOptionText, { color: colors.foreground }]}>{entry.label}</Text><MaterialIcons name="chevron-right" size={19} color={colors.muted} /></Pressable>)}{filteredBrands.length === 0 ? <Text style={[styles.emptySearch, { color: colors.muted }]}>Tidak ada bank/dompet yang cocok.</Text> : null}</ScrollView><Pressable onPress={() => { setPickerVisible(false); setManualMode(true); setName(""); }} style={styles.manualButton}><MaterialIcons name="edit" size={16} color={colors.primary} /><Text style={[styles.manualButtonText, { color: colors.primary }]}>Pilih manual / isi sendiri</Text></Pressable></View></View></Modal>{manualMode ? <TextInput value={name} onChangeText={setName} placeholder={catalogTab === "bank" ? "Nama bank sendiri" : "Nama dompet digital sendiri"} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /> : null}<TextInput value={openingBalance} onChangeText={setOpeningBalance} keyboardType="numeric" placeholder="Saldo awal (opsional)" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" placeholder="Nomor rekening/akun (opsional)" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><View style={styles.kindRow}>{WALLET_OPTIONS.map((option) => <Pressable key={option.kind} onPress={() => { setKind(option.kind); if (option.kind !== "bank" && option.kind !== "e_wallet") setManualMode(true); }} style={({ pressed }) => [styles.kind, { borderColor: kind === option.kind ? colors.primary : colors.border, backgroundColor: kind === option.kind ? `${colors.primary}12` : colors.background }, pressed && styles.pressed]}><MaterialIcons name={option.icon} size={19} color={kind === option.kind ? colors.primary : colors.muted} /><Text style={[styles.kindText, { color: kind === option.kind ? colors.primary : colors.foreground }]}>{option.label}</Text></Pressable>)}</View><PrimaryButton label={editingId ? "Simpan perubahan" : "Simpan sumber dana"} onPress={saveWallet} /><Pressable onPress={resetForm} style={styles.cancelEdit}><Text style={[styles.cancelText, { color: colors.muted }]}>Batal</Text></Pressable></AiraCard> : null}
    <View style={styles.list}>{state.wallets.length === 0 ? <EmptyState icon="account-balance-wallet" title="Belum ada sumber dana" detail="Tambahkan bank, e-wallet, kas, atau aset. Transaksi baru akan selalu terhubung ke salah satunya." actionLabel="Tambah sumber dana" onAction={() => setIsAdding(true)} /> : state.wallets.map((wallet) => { const option = WALLET_OPTIONS.find((item) => item.kind === wallet.kind)!; const brand = BRAND_CATALOG.find((entry) => entry.label === wallet.name); return <AiraCard key={wallet.id} style={styles.walletCard}><BrandMark entry={brand} size={46} /><View style={styles.walletMain}><Text style={[styles.walletName, { color: colors.foreground }]}>{wallet.name}</Text><Text style={[styles.walletType, { color: colors.muted }]}>{brand?.kind === "e_wallet" ? "Dompet digital" : brand?.kind === "bank" ? "Bank" : option.label}</Text></View><View style={styles.walletActions}><Text style={[styles.walletBalance, { color: colors.foreground }]}>{formatCurrency(getWalletBalance(wallet, state.transactions))}</Text><View style={styles.actionRow}><Pressable accessibilityLabel={`Edit ${wallet.name}`} onPress={() => startEdit(wallet)} style={styles.smallAction}><MaterialIcons name="edit" size={17} color={colors.primary} /></Pressable><Pressable accessibilityLabel={`Hapus ${wallet.name}`} onPress={() => confirmRemoveWallet(wallet)} style={styles.smallAction}><MaterialIcons name="delete-outline" size={17} color={colors.error} /></Pressable>{wallet.accountNumber ? <Pressable accessibilityLabel={`Salin nomor rekening ${wallet.name}`} onPress={() => { void Clipboard.setStringAsync(wallet.accountNumber!); Alert.alert("Nomor rekening disalin", "Nomor rekening sudah disalin ke clipboard."); }} style={styles.smallAction}><MaterialIcons name="content-copy" size={17} color={colors.primary} /></Pressable> : null}</View></View></AiraCard>; })}</View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { gap: 14, paddingBottom: 24 }, flex: { flex: 1 }, header: { alignItems: "center", flexDirection: "row", gap: 11, marginBottom: 2 }, headerText: { flex: 1 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, title: { fontSize: 20, fontWeight: "800", letterSpacing: -0.35 }, subtitle: { fontSize: 12, marginTop: 2 }, add: { alignItems: "center", borderRadius: 15, height: 44, justifyContent: "center", width: 44 }, form: { gap: 11 }, formTitle: { fontSize: 16, fontWeight: "800" }, pickerButton: { alignItems: "center", borderRadius: 13, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 58, paddingHorizontal: 10 }, pickerButtonLeft: { alignItems: "center", flexDirection: "row", flex: 1, gap: 10 }, pickerLabel: { fontSize: 10, fontWeight: "700" }, pickerValue: { fontSize: 14, fontWeight: "800", marginTop: 2 }, modalBackdrop: { backgroundColor: "rgba(0,0,0,0.48)", flex: 1, justifyContent: "flex-end" }, modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 11, maxHeight: "92%", padding: 16 }, modalHeader: { alignItems: "center", flexDirection: "row", gap: 10 }, modalTitle: { fontSize: 18, fontWeight: "900" }, modalSubtitle: { fontSize: 12, marginTop: 2 }, modalClose: { alignItems: "center", borderRadius: 18, height: 36, justifyContent: "center", width: 36 }, modalList: { gap: 8, paddingBottom: 4 }, modalOption: { alignItems: "center", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 10, minHeight: 54, paddingHorizontal: 8 }, modalOptionText: { flex: 1, fontSize: 13, fontWeight: "800" }, emptySearch: { padding: 18, textAlign: "center" }, catalogTabs: { flexDirection: "row", gap: 8 }, catalogTab: { alignItems: "center", borderRadius: 11, borderWidth: 1, flex: 1, flexDirection: "row", gap: 6, justifyContent: "center", paddingVertical: 9 }, catalogTabText: { fontSize: 12, fontWeight: "800" }, input: { borderRadius: 13, borderWidth: 1, fontSize: 14, minHeight: 46, paddingHorizontal: 12 }, brandGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, brandOption: { alignItems: "center", borderRadius: 11, borderWidth: 1, gap: 5, minHeight: 82, padding: 7, width: "31.5%" }, brandMark: { alignItems: "center", borderRadius: 10, justifyContent: "center", overflow: "hidden" }, officialLogo: { backgroundColor: "#FFFFFF", borderRadius: 8, padding: 3, position: "absolute" }, brandMarkText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" }, brandLabel: { fontSize: 10, fontWeight: "700", textAlign: "center" }, manualButton: { alignItems: "center", flexDirection: "row", gap: 6, justifyContent: "center", paddingVertical: 4 }, manualButtonText: { fontSize: 12, fontWeight: "800" }, kindRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, kind: { alignItems: "center", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 6, paddingHorizontal: 10, paddingVertical: 9 }, kindText: { fontSize: 12, fontWeight: "700" }, list: { gap: 10 }, walletCard: { alignItems: "center", flexDirection: "row", gap: 12 }, walletMain: { flex: 1, minWidth: 0 }, walletName: { fontSize: 15, fontWeight: "800" }, walletType: { fontSize: 12, marginTop: 2 }, walletBalance: { fontSize: 15, fontWeight: "800", textAlign: "right" }, walletActions: { alignItems: "flex-end", gap: 4 }, actionRow: { flexDirection: "row", gap: 4 }, smallAction: { alignItems: "center", height: 28, justifyContent: "center", width: 28 }, cancelEdit: { alignItems: "center", paddingVertical: 4 }, cancelText: { fontSize: 12, fontWeight: "700" }, pressed: { opacity: 0.7 } });
