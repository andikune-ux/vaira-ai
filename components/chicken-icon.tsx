import { Image } from "react-native";

const CHICKEN_ASSET = require("@/assets/images/vaira-chicken-target-transparent.webp");

export function ChickenIcon({ size = 24 }: { size?: number }) {
  return <Image source={CHICKEN_ASSET} accessibilityLabel="Ikon ayam VAIRA" style={{ width: size, height: size }} resizeMode="contain" />;
}
