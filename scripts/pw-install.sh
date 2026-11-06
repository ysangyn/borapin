#!/usr/bin/env bash
# CI에서 Playwright 브라우저 설치: 다른 apt(런너 이미지의 자동 갱신)가 잠금을 쥐고 있으면 기다리고, 실패하면 세 번까지 다시
#   bash scripts/pw-install.sh chromium [webkit]
set -u
for i in 1 2 3; do
  for _ in $(seq 1 60); do
    if sudo fuser /var/lib/dpkg/lock-frontend /var/lib/apt/lists/lock >/dev/null 2>&1; then echo "apt 잠금 기다리는 중…"; sleep 5; else break; fi
  done
  if timeout 900 npx playwright install --with-deps "$@"; then exit 0; fi
  echo "브라우저 설치 실패 ($i/3) — 20초 뒤 다시"
  sleep 20
done
echo "브라우저를 설치하지 못했어요"
exit 1
