#!/usr/bin/env python3
"""只读门禁视图 → app/data/content.json（前端唯一内容入口）

顺序：先跑 check_content 的全部规则；只导出 verified=true 的条目。
若导出结果为空，或已核验条目比上一次产物少了 20% 以上 → 拒绝覆盖，退出码 2。
这是「未核验内容不可能出现在页面上」的技术保证，不靠人记。
"""
from __future__ import annotations

import glob
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
OUT = ROOT / "app" / "data" / "content.json"
SHRINK_LIMIT = 0.8


def die(msg: str, code: int = 2) -> None:
    print("❌ " + msg)
    raise SystemExit(code)


def main() -> int:
    check = ROOT / "tools" / "check_content.py"
    import subprocess

    if subprocess.run([sys.executable, str(check)], cwd=ROOT).returncode != 0:
        die("内容校验未通过，拒绝导出（产物保持上一次的已核验版本）")

    stages = json.loads((CONTENT / "stages.json").read_text(encoding="utf-8"))
    epochs_cn = json.loads((CONTENT / "epochs.cn.json").read_text(encoding="utf-8"))
    epochs_world = json.loads((CONTENT / "epochs.world.json").read_text(encoding="utf-8"))
    events = []
    for path in sorted(glob.glob(str(CONTENT / "events" / "*.json"))):
        for e in json.loads(Path(path).read_text(encoding="utf-8"))["events"]:
            e.pop("_file", None)
            if e.get("verified") is True:
                events.append(e)
    comps = [
        c
        for c in json.loads((CONTENT / "comparisons.json").read_text(encoding="utf-8"))["comparisons"]
        if any(e["epochId"] == c["cnEpochId"] for e in events)
        and any(e["epochId"] == c["worldEpochId"] for e in events)
    ]

    if not events:
        die("已核验事件为 0 条，拒绝产出空站")

    # 对照关系可能指向未核验条目：导出时剪掉，避免产物里出现死链
    ids = {e["id"] for e in events}
    pruned = 0
    for e in events:
        kept = [c for c in e.get("counterparts", []) if c in ids]
        pruned += len(e.get("counterparts", [])) - len(kept)
        e["counterparts"] = kept
    if pruned:
        print(f"提示: 剪掉 {pruned} 个指向未核验条目的对照关系（页面上不会出现死链）")

    if OUT.exists():
        try:
            prev = json.loads(OUT.read_text(encoding="utf-8"))
            prev_n = len(prev.get("events", []))
            if prev_n and len(events) < prev_n * SHRINK_LIMIT:
                die(f"已核验条目从 {prev_n} 骤降到 {len(events)}，疑似误操作，拒绝覆盖（确认无误后手动删除产物再导出）")
        except json.JSONDecodeError:
            pass

    events.sort(key=lambda e: (e["start"], e["track"] != "cn"))
    payload = {
        "stages": stages,
        "epochsCn": epochs_cn,
        "epochsWorld": epochs_world,
        "events": events,
        "comparisons": comps,
        "stats": {
            "events": len(events),
            "cn": sum(1 for e in events if e["track"] == "cn"),
            "world": sum(1 for e in events if e["track"] == "world"),
            "epochsCn": len(epochs_cn["epochs"]),
            "epochsWorld": len(epochs_world["epochs"]),
            "comparisons": len(comps),
            "stages": len(stages["stages"]),
            "earliest": min(e["start"] for e in events),
            "latest": max(e.get("end", e["start"]) for e in events),
        },
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    s = payload["stats"]
    print(f"✅ 导出 {s['events']} 条（中 {s['cn']} / 世界 {s['world']}）· 范围 {s['earliest']} ~ {s['latest']} → {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
