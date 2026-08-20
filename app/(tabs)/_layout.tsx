import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useLanguage } from "@/lib/language-provider";
import { useFinance } from "@/lib/finance/finance-context";

export default function TabLayout() {
  const colors = useColors();
  const { t } = useLanguage();
  const { state } = useFinance();
  const airaTabLabel = state.profile.aiMode === "hot_pro" ? "Aira · Hot Pro" : state.profile.aiMode === "scientist" ? "Aira · Ahli" : t("aira");
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: airaTabLabel,
          tabBarIcon: ({ color }) => <IconSymbol size={27} name="bubble.left.and.bubble.right.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: t("finance"),
          tabBarIcon: ({ color }) => <IconSymbol size={27} name="wallet.bifold.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: t("plans"),
          tabBarIcon: ({ color }) => <IconSymbol size={27} name="chart.pie.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile"),
          tabBarIcon: ({ color }) => <IconSymbol size={27} name="person.crop.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
