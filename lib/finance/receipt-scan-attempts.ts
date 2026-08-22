export function useOcrFallbackOnAttempt(airaFailureCount: number) {
  return airaFailureCount >= 2;
}

export function nextAiraFailureCount(currentFailures: number, amount: number | null) {
  return amount && amount > 0 ? 0 : Math.min(currentFailures + 1, 2);
}

export function airaRetryMessage(failureCount: number) {
  return failureCount >= 2
    ? "Aira belum dapat membaca nominal dua kali. Pemindaian berikutnya akan memakai OCR online cadangan."
    : "Aira belum menemukan nominal yang meyakinkan. Coba pindai sekali lagi dengan Aira; OCR cadangan akan dipakai pada pemindaian berikutnya bila masih gagal.";
}
