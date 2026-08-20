import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export type VerifyBadgeTone = "user" | "admin";

export interface VerifyBadgeProps {
  tone?: VerifyBadgeTone;
  size?: "sm" | "md";
  accessibilityLabel?: string;
}

/**
 * Shared verification badge for Room Global social surfaces.
 * Keep the visual scale stable across bubbles, mentions, audio participants,
 * voice-note headers, and public profiles.
 */
export function VerifyBadge({ tone = "user", size = "sm", accessibilityLabel }: VerifyBadgeProps) {
  const dimension = size === "md" ? 18 : 13;
  const iconSize = size === "md" ? 14 : 10;
  const color = tone === "admin" ? "#F6C84C" : "#46E0AF";

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? (tone === "admin" ? "Badge ADMIN VAIRA" : "Pengguna terverifikasi")}
      style={[styles.badge, { backgroundColor: color, height: dimension, width: dimension }]}
    >
      <MaterialIcons name="check" size={iconSize} color="#061018" />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.78)",
    borderRadius: 99,
    borderWidth: 1,
    justifyContent: "center",
  },
});
