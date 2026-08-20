import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

type ToastTone = "success" | "info";
type ToastValue = { message: string; tone: ToastTone } | null;
type ToastContextValue = { showToast: (message: string, tone?: ToastTone) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastValue>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    if (timeout.current) clearTimeout(timeout.current);
    setToast({ message, tone });
    timeout.current = setTimeout(() => setToast(null), 3200);
  }, []);
  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);
  return <ToastContext.Provider value={{ showToast }}><View style={styles.root}>{children}{toast ? <View pointerEvents="none" style={styles.anchor}><View style={[styles.toast, { backgroundColor: toast.tone === "success" ? "#16794D" : "#245BBA" }]}><MaterialIcons name={toast.tone === "success" ? "check-circle" : "info"} size={20} color="#FFFFFF" /><Text style={styles.message}>{toast.message}</Text></View></View> : null}</View></ToastContext.Provider>;
}

export function useAppToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useAppToast must be used within ToastProvider");
  return context;
}

const styles = StyleSheet.create({ root: { flex: 1 }, anchor: { bottom: 26, left: 16, position: "absolute", right: 16, zIndex: 1000 }, toast: { alignItems: "center", borderRadius: 15, flexDirection: "row", gap: 9, minHeight: 48, paddingHorizontal: 14, paddingVertical: 11, shadowColor: "#000000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 8 }, message: { color: "#FFFFFF", flex: 1, fontSize: 13, fontWeight: "700", lineHeight: 18 } });
