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


def load_stages() -> dict:
    return json.loads((CONTENT / "stages.json").read_text(encoding="utf-8"))


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

    stages = load_stages()
    stage_ids = {s["id"] for s in stages["stages"]}
    cn_epochs, world_epochs = load_epochs()

    # 阶段页是「特征清单」，因此每阶段必须有线索条目与对照要点
    for st in stages["stages"]:
        for field, minimum in (("cnLine", 2), ("worldLine", 2), ("compare", 1)):
            items = st.get(field) or []
            if len(items) < minimum:
                errors.append(f"stage {st['id']}: {field} 至少 {minimum} 条，实际 {len(items)}")
        for field in ("cnFeature", "worldFeature"):
            if not str(st.get(field, "")).strip():
                errors.append(f"stage {st['id']}: 缺 {field}")

    # 每条路线每个阶段恰好一卷，且 stageId 指向存在的阶段
    for set_ in (cn_epochs, world_epochs):
        seen = []
        for ep in set_["epochs"]:
            if ep.get("stageId") not in stage_ids:
                errors.append(f"{set_['track']} epoch {ep['id']}: stageId 不存在 {ep.get('stageId')!r}")
            seen.append(ep.get("stageId"))
        if len(seen) != len(set(seen)):
            errors.append(f"{set_['track']}: 同一阶段出现多卷，阶段与卷目必须一一对应")
        if set(seen) != stage_ids:
            errors.append(f"{set_['track']}: 阶段未全覆盖，缺 {sorted(stage_ids - set(seen))}")

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
        for sec in e.get("sections") or []:
            if not str(sec.get("title", "")).strip() or len(str(sec.get("body", ""))) < 40:
                errors.append(f"{where}: sections 需要 title 且 body ≥ 40 字")
        for node in e.get("timeline") or []:
            if not isinstance(node.get("year"), int) or not str(node.get("text", "")).strip():
                errors.append(f"{where}: timeline 节点需要整数 year 与 text")
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
        # 对照必须发生在同一阶段，否则时间错位
        cn_ep = next((e for e in cn_epochs["epochs"] if e["id"] == cid), None)
        w_ep = next((e for e in world_epochs["epochs"] if e["id"] == wid), None)
        if cn_ep and w_ep and cn_ep.get("stageId") != w_ep.get("stageId"):
            errors.append(f"comparisons:{c.get('id')}: 两条线不在同一阶段（{cn_ep.get('stageId')} vs {w_ep.get('stageId')}）")
        key = c.get("id")
        if key in seen_epochs:
            errors.append(f"comparisons:{key}: id 重复")
        seen_epochs.add(key)
        dims = c.get("dimensions") or []
        if len(dims) != 4:
            errors.append(f"comparisons:{c.get('id')}: 必须是四维对照，实际 {len(dims)} 维")
        for d in dims:
            if not d.get("left", "").strip() or not d.get("right", "").strip():
                errors.append(f"comparisons:{c.get('id')}: 维度 {d.get('name')!r} 左右栏不全")

    # ---- 朝代板块 ----
    dyn = json.loads((CONTENT / "dynasties.json").read_text(encoding="utf-8"))["dynasties"]
    seen_dyn = set()
    ev_ids = {e["id"] for e in events}
    for d in dyn:
        did = d.get("id")
        where = f"dynasty:{did}"
        if did in seen_dyn:
            errors.append(f"{where}: id 重复")
        seen_dyn.add(did)
        span = d.get("span") or {}
        lo, hi = span.get("from"), span.get("to")
        if not isinstance(lo, int) or not isinstance(hi, int) or lo >= hi:
            errors.append(f"{where}: span 必须是整数且 from < to")
            continue
        for field in ("name", "summary", "capital", "founder", "endReason"):
            if not str(d.get(field, "")).strip():
                errors.append(f"{where}: 缺 {field}")
        last = None
        for i, r in enumerate(d.get("rulers") or [], 1):
            if len(r) != 5:
                errors.append(f"{where}: 第 {i} 位君主字段数不是 5")
                continue
            title, name, rf, rt, note = r
            if not (lo <= rf <= rt <= hi):
                errors.append(f"{where}: 君主 {title}{name} 在位 {rf}-{rt} 超出 {lo}-{hi}")
            if last is not None and rf < last - 1:
                errors.append(f"{where}: 君主 {title}{name} 起始 {rf} 早于前一位结束 {last}")
            last = rt
            if len(note) < 6:
                errors.append(f"{where}: 君主 {title}{name} 事迹过短")
        if not d.get("rulers") and not d.get("polities"):
            errors.append(f"{where}: 既无君主表也无政权说明")
        for eid in d.get("eventIds") or []:
            if eid not in ev_ids:
                errors.append(f"{where}: eventIds 指向不存在的 {eid}")
            elif next(e for e in events if e["id"] == eid)["track"] != "cn":
                errors.append(f"{where}: eventIds 里 {eid} 不是中国史条目")
        if len(d.get("people") or []) < 3:
            errors.append(f"{where}: 人物至少 3 位")

    ordered = sorted(
        [x for x in dyn if isinstance(x.get("span", {}).get("from"), int)],
        key=lambda x: x["span"]["from"],
    )
    for a, b in zip(ordered, ordered[1:]):
        if b["span"]["from"] < a["span"]["to"] and not (a.get("concurrent") or b.get("concurrent")):
            errors.append(f"dynasty: {a['id']} 与 {b['id']} 时间重叠且未标 concurrent")

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
