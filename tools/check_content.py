#!/usr/bin/env python3
"""内容门禁校验。任何一条不合规 → 退出码 1，且不产出任何构建输入。

规则（历史内容站的门槛，别放宽）：
  1. id 唯一；track ∈ {cn, world}；epochId 必须存在
  2. 年份是整数，start ≤ end，无公元 0 年，不超过 CURRENT_YEAR
  3. counterparts 必须双向成立（A→B 则 B→A）
  4. 每条至少一个带 url 的来源
  5. 四个正文段落（summary/background/course/impact）不得为空，summary ≥ 40 字
  6. 中文正文里出现孤立英文单词 → 警告（多半是「to」「annex」这类没改完的痕迹）
"""
from __future__ import annotations

import glob
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
CURRENT_YEAR = 2026
LATIN_IN_TEXT = re.compile(r"(?<![A-Za-z])[a-z]{2,}(?![A-Za-z])")


def load_events() -> list[dict]:
    events: list[dict] = []
    for path in sorted(glob.glob(str(CONTENT / "events" / "*.json"))):
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        for e in data.get("events", []):
            e["_file"] = Path(path).name
            events.append(e)
    return events


def load_epochs() -> tuple[dict, dict]:
    cn = json.loads((CONTENT / "epochs.cn.json").read_text(encoding="utf-8"))
    world = json.loads((CONTENT / "epochs.world.json").read_text(encoding="utf-8"))
    cn_ids = {e["id"] for e in cn["epochs"]}
    world_ids = {e["id"] for e in world["epochs"]}
    if cn_ids & world_ids:
        raise SystemExit(f"纪元 id 冲突：{cn_ids & world_ids}")
    return cn, world


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    cn_epochs, world_epochs = load_epochs()
    epoch_ids = {e["id"] for e in cn_epochs["epochs"]} | {e["id"] for e in world_epochs["epochs"]}
    conn_ids = {e["id"] for e in cn_epochs["epochs"]}
    wall_ids = {e["id"] for e in world_epochs["epochs"]}
    events = load_events()
    by_id = {}
    for e in events:
        eid = e.get("id", "<无 id>")
        if eid in by_id:
            errors.append(f"{e['_file']}: id 重复 {eid}")
        by_id[eid] = e

    for e in events:
        eid = e.get("id", "<无 id>")
        where = f"{e['_file']}:{eid}"
        for field in ("id", "track", "epochId", "title", "summary", "background", "course", "impact"):
            if not str(e.get(field, "")).strip():
                errors.append(f"{where}: 缺字段 {field}")
        if e.get("track") not in ("cn", "world"):
            errors.append(f"{where}: track 必须是 cn 或 world，实际 {e.get('track')!r}")
        if e.get("epochId") not in epoch_ids:
            errors.append(f"{where}: epochId 不存在 {e.get('epochId')!r}")
        elif e.get("track") == "cn" and e.get("epochId") not in conn_ids:
            errors.append(f"{where}: 中国事件的 epochId 必须落在华夏编年里（c* 开头）")
        elif e.get("track") == "world" and e.get("epochId") not in wall_ids:
            errors.append(f"{where}: 世界事件的 epochId 必须落在域外编年里（w* 开头）")
        start, end = e.get("start"), e.get("end", e.get("start"))
        if not isinstance(start, int) or not isinstance(end, int):
            errors.append(f"{where}: start/end 必须是整数")
        else:
            if start == 0 or end == 0:
                errors.append(f"{where}: 不存在公元 0 年")
            if start > end:
                errors.append(f"{where}: start({start}) 晚于 end({end})")
            if end > CURRENT_YEAR:
                errors.append(f"{where}: 年份超出当前年份 {end}")
        if not isinstance(e.get("verified"), bool):
            errors.append(f"{where}: verified 必须是布尔值")
        for cp in e.get("counterparts", []):
            other = by_id.get(cp)
            if other is None:
                errors.append(f"{where}: counterparts 指向不存在的 {cp}")
            elif eid not in other.get("counterparts", []):
                errors.append(f"{where}: 对照关系不是双向的（{cp} 未反向指向 {eid}）")
        sources = e.get("sources") or []
        if not any(s.get("url", "").startswith("http") for s in sources):
            errors.append(f"{where}: 至少需要一个带 http(s) url 的来源")
        if len(e.get("summary", "")) < 40:
            errors.append(f"{where}: summary 少于 40 字（{len(e.get('summary',''))}）")
        for field in ("background", "course", "impact"):
            if len(e.get(field, "")) < 40:
                errors.append(f"{where}: {field} 少于 40 字")
        for field in ("title", "subtitle", "summary", "background", "course", "impact"):
            hit = LATIN_IN_TEXT.findall(str(e.get(field, "")))
            if hit:
                warnings.append(f"{where}: {field} 含英文单词 {sorted(set(hit))}（确认是否漏改）")

    comps = json.loads((CONTENT / "comparisons.json").read_text(encoding="utf-8"))["comparisons"]
    seen_epochs = set()
    for c in comps:
        cid, wid = c.get("cnEpochId"), c.get("worldEpochId")
        if cid not in conn_ids:
            errors.append(f"comparisons:{c.get('id')}: cnEpochId 不存在 {cid!r}")
        if wid not in wall_ids:
            errors.append(f"comparisons:{c.get('id')}: worldEpochId 不存在 {wid!r}")
        key = (cid, wid)
        if key in seen_epochs:
            errors.append(f"comparisons:{c.get('id')}: 同一纪元对重复 {key}")
        seen_epochs.add(key)
        dims = c.get("dimensions") or []
        if len(dims) != 4:
            errors.append(f"comparisons:{c.get('id')}: 必须是四维对照，实际 {len(dims)} 维")
        for d in dims:
            if not d.get("left", "").strip() or not d.get("right", "").strip():
                errors.append(f"comparisons:{c.get('id')}: 维度 {d.get('name')!r} 左右栏不全")

    verified = sum(1 for e in events if e.get("verified"))
    print(f"事件 {len(events)} 条（已核验 {verified}）· 华夏纪元 {len(conn_ids)} · 域外纪元 {len(wall_ids)} · 对照 {len(comps)} 组")
    for w in warnings:
        print("警告:", w)
    for err in errors:
        print("错误:", err)
    if errors:
        print(f"\n❌ 门禁未通过：{len(errors)} 处错误")
        return 1
    print("✅ 门禁通过")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
