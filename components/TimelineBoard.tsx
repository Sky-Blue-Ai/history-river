"use client";

import { useMemo, useState } from "react";
import { href, spanText } from "@/lib/format";

export interface TLItem {
  id: string;
  title: string;
  start: number;
  end?: number;
  epochId: string;
}

export default function TimelineBoard({
  items,
  epochs,
  track,
}: {
  items: TLItem[];
  epochs: { id: string; label: string; name: string }[];
  track: "cn" | "world";
}) {
  const [mode, setMode] = useState<"epoch" | "century">("epoch");

  const groups = useMemo(() => {
    const keyOf = (e: TLItem) =>
      mode === "epoch"
        ? e.epochId
        : String(Math.floor(Math.abs(e.start) / 100) * 100 * (e.start < 0 ? -1 : 1));
    const map = new Map<string, TLItem[]>();
    for (const e of [...items].sort((a, b) => a.start - b.start)) {
      const k = keyOf(e);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return [...map.entries()]
      .map(([key, evs]) => {
        const head =
          mode === "epoch"
            ? (() => {
                const ep = epochs.find((x) => x.id === key);
                return { main: ep?.name ?? "", sub: ep?.label ?? "" };
              })()
            : {
                main: evs[0].start < 0
                  ? `公元前 ${Math.floor(Math.abs(evs[0].start) / 100) * 100 + 1}–${Math.floor(Math.abs(evs[0].start) / 100) * 100 + 100} 年`
                  : `公元 ${Math.floor(Math.abs(evs[0].start) / 100) * 100 + 1}–${Math.floor(Math.abs(evs[0].start) / 100) * 100 + 100} 年`,
                sub: "世纪刻度",
              };
        return { key, head, evs, start: evs[0].start };
      })
      .sort((a, b) => a.start - b.start);
  }, [items, mode, epochs]);

  return (
    <>
      <div className="tl-controls">
        <span className="label">刻度</span>
        <button className="chip" aria-pressed={mode === "epoch"} onClick={() => setMode("epoch")} type="button">
          按卷目
        </button>
        <button className="chip" aria-pressed={mode === "century"} onClick={() => setMode("century")} type="button">
          按世纪
        </button>
        <span className="label" style={{ marginLeft: "auto" }}>
          共 {items.length} 条 · 单轨
        </span>
      </div>

      <div className="tl" data-track={track}>
        {groups.map((g) => (
          <section className="tl-group" key={g.key}>
            <div className="ghead">
              <span className="yr">{g.head.main}</span>
              <span className="nm">{g.head.sub}</span>
              <span className="rule" />
              <span className="label">{g.evs.length} 条</span>
            </div>
            <div className="tl-row single">
              {g.evs.map((e) => (
                <a className="tl-item" data-track={track} key={e.id} href={href(`/event/${e.id}`)}>
                  <span className="y">{spanText(e.start, e.end)}</span>
                  <span className="t">{e.title}</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
