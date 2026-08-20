import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { useColors } from "@/hooks/use-colors";

export function AiraCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
}

export function SectionHeading({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeading}>
      <Text numberOfLines={2} style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action ? onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}>
          <Text numberOfLines={1} style={[styles.textActionLabel, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      ) : (
        <Text numberOfLines={1} style={[styles.textActionLabel, { color: colors.muted }]}>{action}</Text>
      ) : null}
    </View>
  );
}

export function PrimaryButton({ label, icon, onPress, disabled = false }: { label: string; icon?: keyof typeof MaterialIcons.glyphMap; onPress: () => void; disabled?: boolean }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, (pressed || disabled) && styles.pressed, disabled && styles.disabled]}
    >
      {icon ? <MaterialIcons name={icon} color="#FFFFFF" size={20} /> : null}
      <Text numberOfLines={2} style={styles.primaryButtonLabel}>{label}</Text>
    </Pressable>
  );
}

export function OutlineButton({ label, icon, onPress }: { label: string; icon?: keyof typeof MaterialIcons.glyphMap; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.outlineButton, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}
    >
      {icon ? <MaterialIcons name={icon} color={colors.primary} size={19} /> : null}
      <Text numberOfLines={2} style={[styles.outlineButtonLabel, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function IconCircleButton({ icon, label, onPress, tone = "primary", locked = false }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress: () => void; tone?: "primary" | "success" | "warning"; locked?: boolean }) {
  const colors = useColors();
  const color = tone === "success" ? colors.success : tone === "warning" ? colors.warning : colors.primary;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={locked ? `${label}, masuk diperlukan` : label} onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <View style={[styles.quickIcon, { backgroundColor: `${color}18` }]}>
        <MaterialIcons name={icon} color={color} size={23} />
        {locked ? <View style={styles.lockBadge}><MaterialIcons name="lock" color="#FFFFFF" size={12} /></View> : null}
      </View>
      <Text numberOfLines={2} style={[styles.quickLabel, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ icon, title, detail, actionLabel, onAction }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; detail: string; actionLabel?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}14` }]}>
        <MaterialIcons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyDetail, { color: colors.muted }]}>{detail}</Text>
      {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

export function LoadingState() {
  const colors = useColors();
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, padding: 16, shadowColor: "#071B33", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 2 },
  sectionHeading: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between", marginBottom: 10, marginTop: 22 },
  sectionTitle: { flex: 1, flexShrink: 1, fontSize: 18, fontWeight: "700", letterSpacing: -0.2, minWidth: 0 },
  textAction: { flexShrink: 0, minHeight: 38, justifyContent: "center", paddingHorizontal: 4 },
  textActionLabel: { fontSize: 14, fontWeight: "700" },
  primaryButton: { alignItems: "center", borderRadius: 14, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 48, minWidth: 0, paddingHorizontal: 18, paddingVertical: 8 },
  primaryButtonLabel: { color: "#FFFFFF", flexShrink: 1, fontSize: 15, fontWeight: "800", textAlign: "center" },
  outlineButton: { alignItems: "center", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 46, minWidth: 0, paddingHorizontal: 16, paddingVertical: 8 },
  outlineButtonLabel: { flexShrink: 1, fontSize: 14, fontWeight: "700", textAlign: "center" },
  quickAction: { alignItems: "center", flex: 1, gap: 7, minHeight: 86, minWidth: 0 },
  quickIcon: { alignItems: "center", borderRadius: 17, height: 52, justifyContent: "center", position: "relative", width: 52 },
  lockBadge: { alignItems: "center", backgroundColor: "#64748B", borderColor: "#FFFFFF", borderRadius: 10, borderWidth: 2, bottom: -2, height: 20, justifyContent: "center", position: "absolute", right: -3, width: 20 },
  quickLabel: { fontSize: 11, fontWeight: "700", lineHeight: 14, minHeight: 28, textAlign: "center" },
  emptyState: { alignItems: "center", borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, gap: 9, padding: 24 },
  emptyIcon: { alignItems: "center", borderRadius: 20, height: 52, justifyContent: "center", width: 52 },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginTop: 3, textAlign: "center" },
  emptyDetail: { fontSize: 13, lineHeight: 19, maxWidth: 270, textAlign: "center" },
  loadingState: { alignItems: "center", flex: 1, justifyContent: "center" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
});
