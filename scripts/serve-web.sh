#!/usr/bin/env bash
# 起静态产物服务（交付用，不要用 next dev 交付）
# 用法: ./scripts/serve-web.sh start|stop|status [port]
set -euo pipefail
PORT="${2:-8099}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/out"
PIDFILE="/tmp/history-river-$PORT.pid"

case "${1:-start}" in
  start)
    if [ ! -f "$OUT/index.html" ]; then
      echo "没有产物，先跑 npm run build"
      exit 1
    fi
    if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
      echo "已在运行: http://127.0.0.1:$PORT"
      exit 0
    fi
    ( cd "$OUT" && nohup python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/history-river-$PORT.log 2>&1 & echo $! >"$PIDFILE" )
    sleep 1
    echo "已启动: http://127.0.0.1:$PORT  (pid $(cat "$PIDFILE"))"
    ;;
  stop)
    if [ -f "$PIDFILE" ]; then kill "$(cat "$PIDFILE")" 2>/dev/null || true; rm -f "$PIDFILE"; fi
    echo "已停止"
    ;;
  status)
    if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
      echo "运行中: http://127.0.0.1:$PORT"
    else
      echo "未运行"
    fi
    ;;
  *)
    echo "用法: $0 start|stop|status [port]"
    exit 1
    ;;
esac
