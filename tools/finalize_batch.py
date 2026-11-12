#!/usr/bin/env python3
"""把若干 batch JSON 并入 inbox、挂朝代、更新 backlog。不跑门禁/构建（用 tools/ship.sh）。

用法: python3 tools/finalize_batch.py /tmp/batch_hist_A.json /tmp/batch_hist_B.json /tmp/batch_hist_C.json
"""
from __future__ import annotations

import glob
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INBOX = ROOT / "content" / "events" / "zz_inbox.json"
DYN = ROOT / "content" / "dynasties.json"
BACKLOG = ROOT / "content" / "backlog.json"

# 本轮 21 条事件 → 朝代
DYN_MAP = {
    "cn-han-xiongnu": "han-west", "cn-yellow-turban": "han-east",
    "cn-eight-princes": "wei-jin", "cn-northern-wei": "wei-jin",
    "cn-xuanwu-gate": "tang", "cn-an-lushan": "tang",
    "cn-liangshui": "tang", "cn-huang-chao": "tang",
    "cn-chanyuan": "song-north", "cn-wang-anshi": "song-north",
    "cn-jingkang": "song-north", "cn-xiangyang": "song-south",
    "cn-mongol-jin": "yuan", "cn-zhengtong": "ming",
    "cn-wanli-wars": "ming", "cn-chongzhen": "ming",
    "cn-three-feudatories": "qing", "cn-zhungeer": "qing",
    "cn-taiping": "qing", "cn-wuxu": "qing", "cn-gengzi": "qing",
}


def main() -> int:
    paths = [Path(p) for p in sys.argv[1:]]
    if not paths:
        print("用法: python3 tools/finalize_batch.py <batch1.json> [batch2.json ...]")
        return 2

    incoming = []
    for p in paths:
        if not p.exists():
            print(f"⚠️ 跳过不存在的 {p}")
            continue
        d = json.loads(p.read_text(encoding="utf-8"))
        evs = d.get("events", d if isinstance(d, list) else [])
        print(f"{p.name}: {len(evs)} 条")
        for e in evs:
            d = e.pop("dynasty", None)
            if d:
                DYN_MAP[e["id"]] = d
        incoming.extend(evs)

    existing = json.loads(INBOX.read_text(encoding="utf-8"))["events"] if INBOX.exists() else []
    have = {e["id"] for e in existing}
    added = []
    for e in incoming:
        if e["id"] in have:
            continue
        existing.append(e)
        have.add(e["id"])
        added.append(e["id"])
    INBOX.write_text(json.dumps({"events": existing}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    dyn = json.loads(DYN.read_text(encoding="utf-8"))
    for d in dyn["dynasties"]:
        for eid, did in DYN_MAP.items():
            if did == d["id"] and eid in have and eid not in d["eventIds"]:
                d["eventIds"].append(eid)
    DYN.write_text(json.dumps(dyn, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    if BACKLOG.exists():
        bl = json.loads(BACKLOG.read_text(encoding="utf-8"))
        for it in bl.get("items", []):
            if it["eventId"] in have:
                it["status"] = "done"
        BACKLOG.write_text(json.dumps(bl, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"✅ 新增 {len(added)} 条，inbox 共 {len(existing)} 条")
    for i in added:
        print("  +", i)
    dup = [e['id'] for e in incoming if e['id'] not in added]
    if dup:
        print("⚠️ 已存在跳过:", ", ".join(dup))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
