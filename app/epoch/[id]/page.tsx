import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EventCard from "@/components/EventCard";
import { comparisonByEpoch, epochs, eventsOfEpoch } from "@/lib/content";
import { href, spanText } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return epochs.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const ep = epochs.find((e) => e.id === id);
  if (!ep) return { title: "纪元不存在" };
  return { title: ep.name, description: ep.oneLiner };
}

export default async function EpochPage({ params }: Params) {
  const { id } = await params;
  const epoch = epochs.find((e) => e.id === id);
  if (!epoch) notFound();

  const evs = eventsOfEpoch(epoch.id);
  const cn = evs.filter((e) => e.track === "cn");
  const world = evs.filter((e) => e.track === "world");
  const comparison = comparisonByEpoch.get(epoch.id);
  const idx = epochs.findIndex((e) => e.id === epoch.id);
  const prev = epochs[idx - 1];
  const next = epochs[idx + 1];

  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
      <div className="crumb" style={{ fontSize: "var(--text-label-sm)", color: "var(--color-ink-muted)", marginBottom: "1.1rem" }}>
        <a href={href("/")}>典藏纪年</a>
        <span aria-hidden="true">/</span>
        <a href={href("/timeline")}>编年长卷</a>
        <span aria-hidden="true">/</span>
        <span>{epoch.label}</span>
      </div>

      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        {epoch.label} · {epoch.chapter}
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>{epoch.name}</h1>
      <p style={{ color: "var(--color-ink-variant)", marginTop: "0.7rem", maxWidth: "46rem", fontSize: "var(--text-body-lg)", lineHeight: 1.9 }}>
        {epoch.oneLiner}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "var(--spacing-md)" }}>
        <span className="seal">华夏 {spanText(epoch.cnSpan.from, epoch.cnSpan.to)}</span>
        <span className="seal">域外 {spanText(epoch.worldSpan.from, epoch.worldSpan.to)}</span>
        {epoch.keywords.map((k) => (
          <a
            key={k}
            className="chip"
            href={href(`/archive?theme=${encodeURIComponent(k)}`)}
            style={{ textDecoration: "none" }}
          >
            {k}
          </a>
        ))}
      </div>

      <div className="tracks" style={{ marginTop: "var(--spacing-xl)" }}>
        <div className="track-cn">
          <div className="track-head">
            <span className="t">
              <i aria-hidden="true" />
              华夏纪元轨
            </span>
            <span className="s">{cn.length} 条</span>
          </div>
          {cn.length ? cn.map((e) => <EventCard key={e.id} event={e} />) : <p className="label">本卷中国轨待补。</p>}
        </div>
        <div className="track-world">
          <div className="track-head">
            <span className="t">
              <i aria-hidden="true" />
              域外诸邦
            </span>
            <span className="s">{world.length} 条</span>
          </div>
          {world.length ? world.map((e) => <EventCard key={e.id} event={e} />) : <p className="label">本卷世界轨待补。</p>}
        </div>
      </div>

      {comparison ? (
        <section id="matrix" style={{ marginTop: "var(--spacing-2xl)", scrollMarginTop: "5rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "var(--text-headline-lg)" }}>双轨矩阵研析</h2>
            <span className="label">四维纵横比对</span>
          </div>

          <div className="matrix">
            <div className="mhead">
              <div className="dim">维度</div>
              <div>{comparison.left.title}</div>
              <div>{comparison.right.title}</div>
            </div>
            {comparison.dimensions.map((d) => (
              <div className="mrow" key={d.name}>
                <div className="dim">{d.name}</div>
                <div>{d.left}</div>
                <div className="r">{d.right}</div>
              </div>
            ))}
            <div className="verdict">
              <b>太史令短评 · </b>
              {comparison.verdict}
            </div>
          </div>
          <p className="label" style={{ marginTop: "0.6rem" }}>
            {comparison.left.place} ↔ {comparison.right.place} · 对照条目 {cn.length + world.length} 条
          </p>
        </section>
      ) : null}

      <div className="pager">
        {prev ? <a href={href(`/epoch/${prev.id}`)}>← {prev.name}</a> : <span />}
        {next ? <a href={href(`/epoch/${next.id}`)}>{next.name} →</a> : <span />}
      </div>
    </div>
  );
}
