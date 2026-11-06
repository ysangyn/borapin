#!/usr/bin/env bash
# CI에서 Playwright 브라우저 준비: 브라우저 파일만 먼저 받고(CDN, 빠름), 실제로 뜨는지 확인한 뒤
# 안 뜰 때만 apt로 시스템 라이브러리를 깐다. apt는 런너의 다른 설치나 느린 미러 때문에 멈추곤 해서,
# 잠금을 기다리고 · 10분 넘으면 끊고 · 끊은 apt를 정리한 뒤 · 세 번까지 다시 한다.
#   bash scripts/pw-install.sh chromium [webkit]
set -u
BROWSERS=("$@")

launches() {
  node -e '
    const pw = require("@playwright/test");
    (async () => { for (const b of process.argv.slice(1)) { const br = await pw[b].launch(); await br.close(); } })()
      .then(() => process.exit(0), (e) => { console.error(String(e.message).split("\n")[0]); process.exit(1); });
  ' "${BROWSERS[@]}"
}

npx playwright install "${BROWSERS[@]}" || true
if launches; then echo "브라우저 준비됨 (라이브러리 설치 없이)"; exit 0; fi

for i in 1 2 3; do
  for _ in $(seq 1 24); do
    if sudo fuser /var/lib/dpkg/lock-frontend /var/lib/apt/lists/lock >/dev/null 2>&1; then echo "apt 잠금 기다리는 중…"; sleep 5; else break; fi
  done
  if timeout 600 npx playwright install-deps "${BROWSERS[@]}" && launches; then echo "브라우저 준비됨 ($i번째)"; exit 0; fi
  echo "라이브러리 설치 실패 ($i/3) — 멈춘 apt를 정리하고 20초 뒤 다시"
  sudo pkill -9 -f 'apt-get' 2>/dev/null || true
  sudo pkill -9 -f 'dpkg' 2>/dev/null || true
  sudo rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/lib/apt/lists/lock 2>/dev/null || true
  sudo dpkg --configure -a 2>/dev/null || true
  sleep 20
done
echo "브라우저를 준비하지 못했어요"
exit 1
