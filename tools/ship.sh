#!/usr/bin/env bash
# 门禁 → 来源核验 → 导出 → 构建 → 提交 → 推送 → 核对 Actions
# 用法: bash tools/ship.sh "提交信息"
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
MSG="${1:-内容更新}"

echo "== 1/5 门禁"; python3 tools/check_content.py || { echo "❌ 门禁未通过，停止"; exit 1; }
echo "== 2/5 来源"; OUT=$(python3 tools/verify_sources.py); echo "$OUT" | tail -3
echo "$OUT" | grep -q "失效 0" || { echo "❌ 有失效来源，停止"; exit 1; }
echo "== 3/5 导出"; python3 tools/export_content.py || exit 1
echo "== 4/5 构建"; npm run build 2>&1 | grep -E "Compiled|error" | head -3
[ -f out/index.html ] || { echo "❌ 构建产物缺失"; exit 1; }
echo "   页面数: $(find out -name index.html | wc -l)"
echo "== 5/5 提交与推送"
git add -A
git commit -q -m "$MSG" || { echo "没有变更可提交"; exit 0; }
git push -q origin main || { echo "❌ 推送失败"; exit 1; }
echo "   已推送 $(git rev-parse --short HEAD)"
echo "== 等待 GitHub Actions..."
for i in $(seq 1 12); do
  sleep 15
  R=$(curl -s -m 20 "https://api.github.com/repos/Sky-Blue-Ai/history-river/actions/runs?per_page=1")
  ST=$(echo "$R" | python3 -c "import sys,json;r=json.load(sys.stdin)['workflow_runs'][0];print(r['status'],r['conclusion'])" 2>/dev/null)
  echo "   $ST"
  case "$ST" in
    "completed success") echo "✅ 部署成功"; exit 0;;
    *failure*) echo "❌ 部署失败，需人工看 Actions"; exit 1;;
  esac
done
echo "⚠️ 超时未确认，稍后用 GitHub 查"
