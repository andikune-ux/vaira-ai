import { createContext, useCallback, useContext, useRef, useState, type PropsWithChildren } from "react";
import { StyleSheet, View, type GestureResponderEvent } from "react-native";

type GazePoint = { x: number; y: number };
type SpcaGazeValue = { gaze: GazePoint };

const DEFAULT_GAZE: GazePoint = { x: 0, y: 0 };
const SpcaGazeContext = createContext<SpcaGazeValue>({ gaze: DEFAULT_GAZE });

export function SpcaGazeProvider({ children }: PropsWithChildren) {
  const [gaze, setGaze] = useState<GazePoint>(DEFAULT_GAZE);
  const pending = useRef<GazePoint>(DEFAULT_GAZE);
  const frame = useRef<number | null>(null);

  const trackTouch = useCallback((event: GestureResponderEvent) => {
    pending.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
    if (frame.current != null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setGaze(pending.current);
    });
  }, []);

  return <SpcaGazeContext.Provider value={{ gaze }}><View style={styles.root} onTouchStart={trackTouch} onTouchMove={trackTouch}>{children}</View></SpcaGazeContext.Provider>;
}

export function useSpcaGaze() {
  return useContext(SpcaGazeContext);
}

const styles = StyleSheet.create({ root: { flex: 1 } });
