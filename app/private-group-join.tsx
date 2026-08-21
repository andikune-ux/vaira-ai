import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAppToast } from "@/components/app-toast";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";
import { GROUP_DOWNLOAD_URL } from "@/lib/private-group-links";

export default function PrivateGroupJoinScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { showToast } = useAppToast();
  const attempted = useRef(false);
  const join = trpc.privateGroups.joinByInvite.useMutation();
  useEffect(() => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        const timer = window.setTimeout(() => {
          window.location.replace(token ? `${GROUP_DOWNLOAD_URL}?token=${encodeURIComponent(token)}` : GROUP_DOWNLOAD_URL);
        }, 0);
        return () => window.clearTimeout(timer);
      }
      return;
    }
    if (attempted.current || !token) return;
    attempted.current = true;
    void join.mutateAsync({ token }).then((group) => { showToast(`Anda sudah bergabung ke ${group.name}.`, "success"); router.replace({ pathname: "/private-group-chat", params: { groupId: String(group.id) } } as never); }).catch((error) => { showToast(getUserFacingError(error, "Link grup tidak dapat digunakan."), "info"); router.replace("/private-groups" as never); });
  }, [join, showToast, token]);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><View style={{ alignItems: "center", flex: 1, gap: 10, justifyContent: "center", padding: 24 }}><MaterialIcons name="group-add" size={34} color="#36B7FF" />{!token ? <Text style={{ color: "#F1F6FF", textAlign: "center" }}>Link grup tidak lengkap.</Text> : <><ActivityIndicator color="#36B7FF" /><Text style={{ color: "#8EA5C7", fontSize: 12, textAlign: "center" }}>{Platform.OS === "web" ? "Membuka halaman unduhan…" : "Memeriksa undangan grup privat…"}</Text></>}</View></ScreenContainer>;
}
