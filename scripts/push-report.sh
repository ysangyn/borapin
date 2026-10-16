#!/usr/bin/env bash
# CI 결과(화면 캡처, 점검 출력)를 ci-report 브랜치에 올린다. 앱 코드와는 섞이지 않는 별도 브랜치.
# 사용: scripts/push-report.sh <하위폴더> <파일 또는 폴더>...
set -euo pipefail
sub="$1"; shift
repo_url="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
dir="$(mktemp -d)"
if git ls-remote --exit-code "$repo_url" ci-report >/dev/null 2>&1; then
  git clone -q --depth 1 --branch ci-report "$repo_url" "$dir"
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
git -C "$dir" push -q -f origin HEAD:ci-report
