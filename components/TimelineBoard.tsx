"use client";

import { useMemo, useState } from "react";
import { href, spanText } from "@/lib/format";

export interface TLItem {
  id: string;
  title: string;
  track: "cn" | "world";
  start: number;
  end?: number;
  epochId: string;
  epochName: string;
}

export default function TimelineBoard({
  items,
  epochs,
}: {
  items: TLItem[];
  epochs: { id: string; name: string; label: string }[];
}) {
  const [mode, setMode] = useState<"epoch" | "century">("epoch");

  const groups = useMemo(() => {
    const keyOf = (e: TLItem) =>
      mode === "epoch" ? e.epochId : String(Math.floor(Math.abs(e.start) / 100) * 100 * (e.start < 0 ? -1 : 1));
    const map = new Map<string, TLItem[]>();
    for (const e of [...items].sort((a, b) => a.start - b.start)) {
      const k = keyOf(e);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    const list = [...map.entries()].map(([key, evs]) => {
      const cn = evs.filter((e) => e.track === "cn");
      const world = evs.filter((e) => e.track === "world");
      const head =
        mode === "epoch"
          ? (() => {
              const ep = epochs.find((x) => x.id === key);
              return { main: ep?.name ?? "", sub: ep?.label ?? "" };
            })()
          : { main: `${evs[0].start < 0 ? "公元前" : "公元"} ${Math.floor(Math.abs(evs[0].start) / 100) * 100 + 1}–${Math.floor(Math.abs(evs[0].start) / 100) * 100 + 100} 年`, sub: `${evs.length} 条` };
      return { key, head, cn, world, count: evs.length };
    });
    return list.sort((a, b) => (a.cn[0] ?? a.world[0]!).start - (b.cn[0] ?? b.world[0]!).start);
  }, [items, mode, epochs]);

  return (
    <>
      <div className="tl-controls">
        <span className="label">刻度</span>
        <button className="chip" aria-pressed={mode === "epoch"} onClick={() => setMode("epoch")} type="button">
          按纪元
        </button>
        <button className="chip" aria-pressed={mode === "century"} onClick={() => setMode("century")} type="button">
          按世纪
        </button>
        <span className="label" style={{ marginLeft: "auto" }}>
          共 {items.length} 条 · 中国 {items.filter((e) => e.track === "cn").length} · 世界{" "}
          {items.filter((e) => e.track === "world").length}
        </span>
      </div>

      <div className="tl">
        {groups.map((g) => (
          <section className="tl-group" key={g.key}>
            <div className="ghead">
              <span className="yr">{g.head.main}</span>
              <span className="nm">{g.head.sub}</span>
              <span className="rule" />
              <span className="label">{g.count} 条</span>
            </div>
            <div className="tl-rows">
              <div className="tl-row">
                {g.cn.map((e) => (
                  <a className="tl-item" data-track="cn" key={e.id} href={href(`/event/${e.id}`)}>
                    <span className="y">{spanText(e.start, e.end)}</span>
                    <span className="t">{e.title}</span>
                  </a>
                ))}
                {g.cn.length === 0 ? <span className="label">本组中国轨暂无条目</span> : null}
              </div>
              <div className="tl-row">
                {g.world.map((e) => (
                  <a className="tl-item" data-track="world" key={e.id} href={href(`/event/${e.id}`)}>
                    <span className="y">{spanText(e.start, e.end)}</span>
                    <span className="t">{e.title}</span>
                  </a>
                ))}
                {g.world.length === 0 ? <span className="label">本组世界轨暂无条目</span> : null}
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
