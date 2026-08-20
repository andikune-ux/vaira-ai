#!/usr/bin/env bash
set -euo pipefail
root="/home/ubuntu/copy-of-airax-ai"
out="$root/.brand-downloads"
mkdir -p "$out"
fetch() {
  local url="$1"; local file="$2"
  curl --connect-timeout 8 --max-time 25 --retry 1 --retry-delay 1 -L --fail --silent --show-error "$url" -o "$out/$file"
}
fetch "https://www.bri.co.id/web/guest/api/files/?path=/sites/default/files/images/Logo%20BRI_updated_blue%20%282%29.png" "bri-official.png"
fetch "https://www.cimbniaga.co.id/content/dam/cimb/revamp/logo.svg" "cimb-niaga-official.svg"
fetch "https://www.panin.co.id/sites/default/files/2020-09/logo%402x.png" "panin-official.png"
fetch "https://www.bankjatim.co.id/files/logo/Logo%20Bank%20Jatim.png" "bank-jatim-official.png"
fetch "https://www.bankjatim.co.id/files/logo/master.jpg" "bank-jatim-master.jpg"
fetch "https://d2v6npc8wmnkqk.cloudfront.net/storage/25368/GoPay-Logo-2025.zip" "gopay-logo-2025.zip"
fetch "https://admin-piol.posindonesia.co.id/media/logo-pospay.png" "pospay-official.png"
if command -v unzip >/dev/null 2>&1; then
  mkdir -p "$out/gopay-2025"
  unzip -q -o "$out/gopay-logo-2025.zip" -d "$out/gopay-2025"
fi
file "$out"/* "$out"/gopay-2025/* 2>/dev/null || true
find "$out" -maxdepth 3 -type f -printf '%P\n' | sort
