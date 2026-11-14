#!/usr/bin/env python3
"""来源可访问性检查：对每条事件的 http(s) 来源发 GET，报告状态码。

- 3xx 跟随；5s 超时
- 已知反爬站点（要求浏览器 JS 或会员）单独归类为 "bot-wall"，不算死链
- 退出码：默认 0（只报告）；--strict 时有任何 dead 链接返回 1
用法: python3 tools/verify_sources.py [--strict] [--only <event-id>]
"""
from __future__ import annotations

import glob
import json
import time
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
BOT_WALL = ("zgbk.com", "ctext.org", "baike.baidu.com", "zh.wikipedia.org", "en.wikipedia.org",
            "wikisource.org", "unesco.org", "britannica.com",
            "worldhistory.org", "worldhistorycommons.org", "un.org", "nato.int", "kaogu.cssn.cn")


def urls() -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for path in sorted(glob.glob(str(CONTENT / "events" / "*.json"))):
        for e in json.loads(Path(path).read_text(encoding="utf-8"))["events"]:
            for s in e.get("sources", []):
                u = s.get("url", "")
                if u.startswith("http"):
                    out.setdefault(u, []).append(e["id"])
    return out


UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"


def check(u: str) -> tuple[str, str]:
    host = u.split("/")[2]
    if any(host.endswith(h) for h in BOT_WALL):
        return "bot-wall", ""
    code = "000"
    for attempt in range(2):          # 失败重试一次，避免把瞬时抖动当死链
        try:
            r = subprocess.run(
                ["curl", "-sL", "-o", "/dev/null", "-m", "15", "-A", UA,
                 "-w", "%{http_code}", u],
                capture_output=True, text=True, timeout=25,
            )
            code = (r.stdout or "000").strip()
        except Exception:
            code = "000"
        if code.startswith("2"):
            return "ok", code
        if attempt == 0:
            time.sleep(1.5)
    if code in ("000", ""):
        return "dead", "连接失败/超时"
    return "dead", code


def main() -> int:
    strict = "--strict" in sys.argv
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]

    table = urls()
    ok = wall = dead = 0
    for u, ids in sorted(table.items()):
        if only and only not in ids:
            continue
        state, detail = check(u)
        if state == "ok":
            ok += 1
        elif state == "bot-wall":
            wall += 1
        else:
            dead += 1
            print(f"❌ {detail:>4}  {u}  ← {', '.join(ids)}")
    total = ok + wall + dead
    print(f"来源 {total} 个：可直连 {ok} · 需浏览器/会员 {wall} · 失效 {dead}")
    if dead and strict:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
