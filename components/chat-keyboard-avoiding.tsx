import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView as NativeKeyboardAvoidingView, Platform } from "react-native";

type KeyboardAvoidingProps = ComponentProps<typeof NativeKeyboardAvoidingView>;

/**
 * Keyboard-aware wrapper used by the Aira chat composer.
 * Android edge-to-edge layouts do not consistently resize the root view, so
 * we apply the reported keyboard height as an explicit bottom inset there.
 */
export function KeyboardAvoidingView(props: KeyboardAvoidingProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [webKeyboardOffset, setWebKeyboardOffset] = useState(0);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(Math.max(0, Math.round(event.endCoordinates.height)));
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined" || !window.visualViewport) return;
    const updateOffset = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;
      setWebKeyboardOffset(Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop)));
    };
    updateOffset();
    window.visualViewport.addEventListener("resize", updateOffset);
    window.visualViewport.addEventListener("scroll", updateOffset);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateOffset);
      window.visualViewport?.removeEventListener("scroll", updateOffset);
    };
  }, []);

  const androidKeyboardInset = Platform.OS === "android" ? keyboardHeight : 0;
  const webInset = Platform.OS === "web" ? webKeyboardOffset : 0;
  const behavior = Platform.OS === "android" ? undefined : props.behavior ?? "padding";

  return (
    <NativeKeyboardAvoidingView
      {...props}
      behavior={behavior}
      keyboardVerticalOffset={Platform.OS === "android" ? 0 : props.keyboardVerticalOffset}
      style={[
        props.style,
        androidKeyboardInset > 0 || webInset > 0
          ? { paddingBottom: Math.max(androidKeyboardInset, webInset) }
          : null,
      ]}
    />
  );
}
