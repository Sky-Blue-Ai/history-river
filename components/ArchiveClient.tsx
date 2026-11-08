"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { href, spanText } from "@/lib/format";

export interface ArchiveItem {
  id: string;
  title: string;
  subtitle?: string;
  track: "cn" | "world";
  start: number;
  end?: number;
  epochId: string;
  epochName: string;
  era?: string;
  region?: string;
  themes: string[];
  summary: string;
  disputed?: boolean;
}

export default function ArchiveClient({
  items,
  epochOptions,
  themeOptions,
}: {
  items: ArchiveItem[];
  epochOptions: { id: string; name: string }[];
  themeOptions: { theme: string; count: number }[];
}) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [track, setTrack] = useState<"" | "cn" | "world">(
    (params.get("track") as "" | "cn" | "world") ?? ""
  );
  const [epoch, setEpoch] = useState(params.get("epoch") ?? "");
  const [theme, setTheme] = useState(params.get("theme") ?? "");

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return items.filter((e) => {
      if (track && e.track !== track) return false;
      if (epoch && e.epochId !== epoch) return false;
      if (theme && !e.themes.includes(theme)) return false;
      if (!kw) return true;
      const hay = [e.title, e.subtitle, e.summary, e.era, e.region, e.epochName, ...e.themes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(kw);
    });
  }, [items, q, track, epoch, theme]);

  const reset = () => {
    setQ("");
    setTrack("");
    setEpoch("");
    setTheme("");
  };

  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        ARCHIVE OF ANNALS
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>典籍与故事索引</h1>
      <p style={{ color: "var(--color-ink-variant)", marginTop: "0.6rem", maxWidth: "44rem" }}>
        全部条目按年代排序。可按轨道、纪元、主题筛选，或直接检索事件、人物、朝代与地名。
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.6rem",
          alignItems: "center",
          marginTop: "var(--spacing-lg)",
          paddingBottom: "var(--spacing-md)",
          borderBottom: "1px solid var(--color-line)",
        }}
      >
        <div className="searchbox" style={{ flex: "1 1 18rem" }}>
          <svg width="13" height="13" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13 13l4.5 4.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <label htmlFor="archive-q" style={{ position: "absolute", left: "-9999px" }}>
            检索条目
          </label>
          <input id="archive-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="检索：张骞 / 罗马 / 造纸 / 唐" style={{ width: "100%" }} />
        </div>

        <select
          aria-label="按轨道筛选"
          value={track}
          onChange={(e) => setTrack(e.target.value as "" | "cn" | "world")}
          style={selectStyle}
        >
          <option value="">全部轨道</option>
          <option value="cn">华夏轨</option>
          <option value="world">世界轨</option>
        </select>

        <select aria-label="按纪元筛选" value={epoch} onChange={(e) => setEpoch(e.target.value)} style={selectStyle}>
          <option value="">全部纪元</option>
          {epochOptions.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <select aria-label="按主题筛选" value={theme} onChange={(e) => setTheme(e.target.value)} style={selectStyle}>
          <option value="">全部主题</option>
          {themeOptions.map((t) => (
            <option key={t.theme} value={t.theme}>
              {t.theme}（{t.count}）
            </option>
          ))}
        </select>

        <span className="label" style={{ marginLeft: "auto" }}>
          命中 {filtered.length} / {items.length} 条
        </span>
        {q || track || epoch || theme ? (
          <button className="chip" onClick={reset} type="button">
            清除筛选
          </button>
        ) : null}
      </div>

      <div style={{ marginTop: "var(--spacing-md)" }}>
        {filtered.length === 0 ? (
          <p style={{ color: "var(--color-ink-muted)", paddingBlock: "var(--spacing-xl)" }}>
            没有匹配的条目，换个词试试；或清除筛选看全部 {items.length} 条。
          </p>
        ) : (
          filtered.map((e) => (
            <a
              key={e.id}
              href={href(`/event/${e.id}`)}
              style={{
                display: "grid",
                gridTemplateColumns: "7.5rem minmax(0, 1fr) auto",
                gap: "var(--spacing-gutter)",
                alignItems: "baseline",
                padding: "0.85rem 0.2rem",
                borderBottom: "1px solid var(--color-line)",
              }}
            >
              <span
                className="when"
                style={{
                  fontSize: "0.6875rem",
                  letterSpacing: "0.08em",
                  color: e.track === "cn" ? "var(--color-track-cn)" : "var(--color-track-world)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {spanText(e.start, e.end)}
              </span>
              <span>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.0625rem" }}>{e.title}</span>
                {e.subtitle ? (
                  <span style={{ color: "var(--color-ink-muted)", fontSize: "var(--text-body-sm)", marginLeft: "0.5rem" }}>
                    {e.subtitle}
                  </span>
                ) : null}
                <span style={{ display: "block", color: "var(--color-ink-muted)", fontSize: "var(--text-body-sm)", marginTop: "0.15rem" }}>
                  {e.epochName}
                  {e.era ? ` · ${e.era}` : ""}
                  {e.region ? ` · ${e.region}` : ""}
                  {e.disputed ? " · 存异说" : ""}
                </span>
              </span>
              <span className="label">{e.track === "cn" ? "华夏" : "世界"}</span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  font: "inherit",
  fontSize: "var(--text-body-sm)",
  padding: "0.35rem 0.5rem",
  border: "1px solid var(--color-line-strong)",
  borderRadius: "var(--radius-xs)",
  background: "var(--color-surface-sunken)",
  color: "var(--color-ink)",
  maxWidth: "12rem",
};
