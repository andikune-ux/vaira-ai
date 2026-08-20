import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AiraCard, EmptyState, IconCircleButton, LoadingState, SectionHeading } from "@/components/aira-ui";
import { ChickenIcon } from "@/components/chicken-icon";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";

export default function PlansTab() {
  const colors = useColors();
  const { state, isHydrated } = useFinance();
  if (!isHydrated) return <LoadingState />;
  const activeCommitments = state.commitments.filter((item) => !item.isDone);
  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={[styles.eyebrow, { color: colors.primary }]}>RENCANA & PENGINGAT</Text><Text style={[styles.title, { color: colors.foreground }]}>Tetap terarah</Text></View>
          <View style={[styles.iconBox, { backgroundColor: `${colors.warning}16` }]}><MaterialIcons name="flag" color={colors.warning} size={24} /></View>
        </View>
        <View style={styles.quickGrid}>
          <IconCircleButton label="Aira AI Browser" icon="travel-explore" tone="success" onPress={() => router.push("/aira-browser" as never)} />
          <IconCircleButton label="Anggaran" icon="pie-chart" onPress={() => router.push("/plan-form?sheet=budget")} />
          <Pressable accessibilityRole="button" accessibilityLabel="Target tabungan" onPress={() => router.push("/plan-form?sheet=goal")} style={styles.chickenAction}><View style={[styles.chickenIcon, { backgroundColor: `${colors.success}18` }]}><ChickenIcon size={31} /></View><Text numberOfLines={2} style={[styles.quickLabel, { color: colors.foreground }]}>Target</Text></Pressable>
          <IconCircleButton label="Tagihan" icon="receipt" tone="warning" onPress={() => router.push("/plan-form?sheet=bill")} />
          <IconCircleButton label="Hutang" icon="handshake" onPress={() => router.push("/plan-form?sheet=debt")} />
          <IconCircleButton label="Keuangan Pintar" icon="auto-graph" tone="warning" onPress={() => router.push("/smart-finance?sheet=smart" as never)} />
        </View>
        <SectionHeading title="Perlu diperhatikan" action="Kelola" onPress={() => router.push("/plan-form?sheet=commitment")} />
        {activeCommitments.length === 0 ? <EmptyState icon="notifications-none" title="Belum ada pengingat" detail="Tambahkan tagihan, utang, piutang, atau pengingat agar AiraX membantu Anda tetap tepat waktu." actionLabel="Buat pengingat" onAction={() => router.push("/plans?sheet=commitment")} /> : <AiraCard><Text style={[styles.placeholder, { color: colors.muted }]}>{activeCommitments.length} komitmen aktif menunggu tindakan Anda.</Text></AiraCard>}
        <SectionHeading title="Target tabungan" />
        {state.goals.length === 0 ? <AiraCard><Text style={[styles.placeholder, { color: colors.muted }]}>Tidak ada target aktif. Anda dapat membuat target dana darurat atau pembelian penting.</Text></AiraCard> : <AiraCard><Text style={[styles.placeholder, { color: colors.muted }]}>{state.goals.length} target sedang dipantau.</Text></AiraCard>}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingBottom: 18, paddingTop: 8 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.05 },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.8, marginTop: 4 },
  iconBox: { alignItems: "center", borderRadius: 18, height: 54, justifyContent: "center", width: 54 },
  quickGrid: { flexDirection: "row", gap: 7, justifyContent: "space-between" },
  chickenAction: { alignItems: "center", flex: 1, gap: 7, minHeight: 86, minWidth: 0 },
  chickenIcon: { alignItems: "center", borderRadius: 17, height: 52, justifyContent: "center", width: 52 },
  quickLabel: { fontSize: 11, fontWeight: "700", lineHeight: 14, minHeight: 28, textAlign: "center" },
  placeholder: { fontSize: 13, lineHeight: 19 },
});
