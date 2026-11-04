#!/usr/bin/env bash
# CI 결과(화면 캡처, 점검 출력)를 ci-report 브랜치에 올린다. 앱 코드와는 섞이지 않는 별도 브랜치.
# 사용: scripts/push-report.sh <하위폴더> <파일 또는 폴더>...
# 여러 작업이 동시에 올리면 부딪힐 수 있고, GitHub가 잠깐 500을 낼 때도 있어서 최신을 다시 받아 네 번까지 해 본다.
# 그래도 못 올리면 경고만 남기고 성공으로 끝낸다 (보고서 때문에 배포가 막히지 않게).
set -uo pipefail
sub="$1"; shift
repo_url="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
for attempt in 1 2 3 4; do
  dir="$(mktemp -d)"
  if git ls-remote --exit-code "$repo_url" ci-report >/dev/null 2>&1; then
    git clone -q --depth 1 --branch ci-report "$repo_url" "$dir" || { sleep $((attempt * 5)); continue; }
  else
    git -C "$dir" init -q -b ci-report
    git -C "$dir" remote add origin "$repo_url"
  fi
  rm -rf "${dir:?}/$sub"
  mkdir -p "$dir/$sub"
  for f in "$@"; do [ -e "$f" ] && cp -r "$f" "$dir/$sub/"; done
  echo "${GITHUB_SHA}" > "$dir/commit.txt"
  git -C "$dir" add -A
  git -C "$dir" -c user.name="borapin-ci" -c user.email="ci@users.noreply.github.com" commit -q -m "report ${GITHUB_SHA::7} ${sub}" || true
  # 앞 세 번은 남의 결과를 덮지 않게 보통 올리기, 마지막만 덮어쓰기
  if [ "$attempt" -lt 4 ]; then git -C "$dir" push -q origin HEAD:ci-report; else git -C "$dir" push -q -f origin HEAD:ci-report; fi && exit 0
  echo "보고서 올리기 ${attempt}번째 실패 — 다시 받아 해 본다"
  sleep $((attempt * 5))
done
echo "::warning::ci-report에 ${sub} 결과를 올리지 못했어요 (GitHub 쪽 오류). 배포는 계속합니다."
exit 0
