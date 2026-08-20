export const KAABA_COORDINATES = { latitude: 21.422487, longitude: 39.826206 } as const;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

/** Returns the initial bearing from the supplied location to the Kaaba, normalized to 0–359°. */
export function calculateQiblaBearing(latitude: number, longitude: number) {
  const sourceLatitude = toRadians(latitude);
  const targetLatitude = toRadians(KAABA_COORDINATES.latitude);
  const deltaLongitude = toRadians(KAABA_COORDINATES.longitude - longitude);
  const y = Math.sin(deltaLongitude) * Math.cos(targetLatitude);
  const x = Math.cos(sourceLatitude) * Math.sin(targetLatitude)
    - Math.sin(sourceLatitude) * Math.cos(targetLatitude) * Math.cos(deltaLongitude);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

export function shortestAngleDelta(target: number, current: number) {
  return ((target - current + 540) % 360) - 180;
}

export function formatBearing(value: number) {
  return `${Math.round(normalizeDegrees(value))}°`;
}
