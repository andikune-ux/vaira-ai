import { useCallback, useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

import { useFinance } from "@/lib/finance/finance-context";
import type { FinanceState } from "@/lib/finance/types";
import { trpc } from "@/lib/trpc";
import { recordFinanceSyncError } from "@/lib/finance/sync-history";

/** Mengambil snapshot pusat personal-test pada Mode Guest maupun akun aplikasi. */
export function GlobalTestSync() {
  const { state, isHydrated, replaceAllData } = useFinance();
  const lastAppliedAt = useRef<string | null>(null);
  const isSynchronizing = useRef(false);
  const pull = trpc.administrator.globalTestSnapshot.pull.useQuery(undefined, { enabled: false, retry: false, refetchOnWindowFocus: false });

  const synchronize = useCallback(async () => {
    if (!isHydrated || !(state.profile.mode === "guest") || isSynchronizing.current) return;
    isSynchronizing.current = true;
    try {
      const result = await pull.refetch();
      const snapshot = result.data;
      if (!snapshot || snapshot.updatedAt === lastAppliedAt.current) return;
      const parsed = JSON.parse(snapshot.payload) as FinanceState;
      if (parsed && typeof parsed === "object" && "version" in parsed && "profile" in parsed) {
        lastAppliedAt.current = snapshot.updatedAt;
        const nextState: FinanceState = { ...parsed, profile: { ...parsed.profile, mode: "guest", syncEnabled: false, displayName: undefined } };
        await replaceAllData(nextState);
      }
    } catch (error) {
      void recordFinanceSyncError(error instanceof Error ? error.message : "Sinkronisasi snapshot tidak berhasil.", "Snapshot global");
      // Tidak mengganggu penggunaan lokal ketika akun belum masuk atau jaringan belum tersedia.
    } finally {
      isSynchronizing.current = false;
    }
  }, [isHydrated, pull, replaceAllData, state.profile.mode]);

  useEffect(() => {
    void synchronize();
    const subscription = AppState.addEventListener("change", (next) => { if (next === "active") void synchronize(); });
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const onOnline = () => { void synchronize(); };
      window.addEventListener("online", onOnline);
      return () => { subscription.remove(); window.removeEventListener("online", onOnline); };
    }
    return () => subscription.remove();
  }, [synchronize]);

  return null;
}
