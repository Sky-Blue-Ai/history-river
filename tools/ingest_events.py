#!/usr/bin/env python3
"""把一批事件 JSON 并入 content/events/zz_inbox.json（幂等），可选挂到朝代页。

用法:
  python3 tools/ingest_events.py /tmp/batch.json
  python3 tools/ingest_events.py /tmp/batch.json --dynasty qin=cn-shaqiu --dynasty han-west=cn-seven-states

batch.json 格式: {"events": [ {…事件对象…}, … ]}
只做合并与挂接，不跑门禁/构建（那是 tools/ship.sh 的事）。
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INBOX = ROOT / "content" / "events" / "zz_inbox.json"
DYN = ROOT / "content" / "dynasties.json"
REQUIRED = ("id", "track", "epochId", "start", "title", "summary", "background", "course", "impact", "sources")


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print("用法: python3 tools/ingest_events.py <batch.json> [--dynasty id=eventId ...]")
        return 2
    batch_path = Path(args[0])
    dyn_pairs = [a.split("=", 1) for a in args if "=" in a and a.split("=", 1)[0] != batch_path.name]
    # --dynasty 形式
    pairs = []
    for i, a in enumerate(args):
        if a == "--dynasty" and i + 1 < len(args):
            k, v = args[i + 1].split("=", 1)
            pairs.append((k, v))

    batch = json.loads(batch_path.read_text(encoding="utf-8"))
    events = batch.get("events", batch if isinstance(batch, list) else [])
    if not events:
        print("❌ batch 里没有 events")
        return 1

    for e in events:
        missing = [k for k in REQUIRED if not e.get(k)]
        if missing:
            print(f"❌ {e.get('id','<无 id>')} 缺字段: {missing}")
            return 1

    existing = json.loads(INBOX.read_text(encoding="utf-8"))["events"] if INBOX.exists() else []
    have = {e["id"] for e in existing}
    added = 0
    for e in events:
        if e["id"] in have:
            continue
        existing.append(e)
        have.add(e["id"])
        added += 1
    INBOX.parent.mkdir(parents=True, exist_ok=True)
    INBOX.write_text(json.dumps({"events": existing}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    if pairs and DYN.exists():
        dyn = json.loads(DYN.read_text(encoding="utf-8"))
        # 用本轮事件的 epochId → track 推断朝代 id 不可靠，故只按显式传入的映射挂接
        by_id = {e["id"]: e for e in existing}
        for dyn_id, ev_id in pairs:
            for d in dyn["dynasties"]:
                if d["id"] == dyn_id and ev_id in by_id and ev_id not in d["eventIds"]:
                    d["eventIds"].append(ev_id)
        DYN.write_text(json.dumps(dyn, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"✅ 并入 {added} 条（inbox 共 {len(existing)} 条）")
    for e in events:
        print(f"  - {e['id']}  {e['title']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
