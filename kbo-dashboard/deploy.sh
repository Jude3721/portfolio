#!/usr/bin/env bash
# kbo-dashboard 빌드 & 배포 스크립트
# 사용: bash deploy.sh

set -e
cd "$(dirname "$0")"

echo "▶ index.html → 빌드용으로 준비"
cp index.dev.html index.html

echo "▶ vite build"
npm run build

echo "▶ dist/ → 루트 복사"
cp dist/index.html index.html
rm -rf assets
cp -r dist/assets ./assets

echo "▶ index.html → dev용으로 복원 (로컬 전용, git 미커밋)"
# 배포 커밋 후 복원
git -C .. add kbo-dashboard/assets/ kbo-dashboard/index.html
git -C .. commit -m "빌드 배포: Neumorphism 디자인 · 구글 폰트 · 테마 전환 · 순위 변동 $(date '+%Y-%m-%d')"
git -C .. push origin main

cp index.dev.html index.html
echo "✅ 배포 완료 — index.html dev용으로 복원됨"
