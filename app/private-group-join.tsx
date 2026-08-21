import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAppToast } from "@/components/app-toast";
import { trpc } from "@/lib/trpc";
import { getUserFacingError } from "@/lib/user-facing-error";

export default function PrivateGroupJoinScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { showToast } = useAppToast();
  const attempted = useRef(false);
  const join = trpc.privateGroups.joinByInvite.useMutation();
  useEffect(() => {
    if (attempted.current || !token) return;
    attempted.current = true;
    void join.mutateAsync({ token }).then((group) => { showToast(`Anda sudah bergabung ke ${group.name}.`, "success"); router.replace({ pathname: "/private-group-chat", params: { groupId: String(group.id) } } as never); }).catch((error) => { showToast(getUserFacingError(error, "Link grup tidak dapat digunakan."), "info"); router.replace("/private-groups" as never); });
  }, [join, showToast, token]);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black"><View style={{ alignItems: "center", flex: 1, gap: 10, justifyContent: "center", padding: 24 }}><MaterialIcons name="group-add" size={34} color="#36B7FF" />{!token ? <Text style={{ color: "#F1F6FF", textAlign: "center" }}>Link grup tidak lengkap.</Text> : <><ActivityIndicator color="#36B7FF" /><Text style={{ color: "#8EA5C7", fontSize: 12, textAlign: "center" }}>Memeriksa undangan grup privat…</Text></>}</View></ScreenContainer>;
}
