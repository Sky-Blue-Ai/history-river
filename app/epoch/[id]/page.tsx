import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EventCard from "@/components/EventCard";
import {
  comparisonsOfEpoch,
  epochById,
  epochNeighbours,
  eventsOfEpoch,
  routeLabel,
  trackOfEpoch,
} from "@/lib/content";
import { href, spanText } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return [...epochById.keys()].map((id) => ({ id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const ep = epochById.get(id);
  if (!ep) return { title: "纪元不存在" };
  return { title: ep.name, description: ep.oneLiner };
}

export default async function EpochPage({ params }: Params) {
  const { id } = await params;
  const epoch = epochById.get(id);
  if (!epoch) notFound();

  const track = trackOfEpoch(epoch.id);
  const evs = eventsOfEpoch(epoch.id);
  const { prev, next } = epochNeighbours(epoch.id);
  const comps = comparisonsOfEpoch(epoch.id);

  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
      <div className="crumb" style={{ fontSize: "var(--text-label-sm)", color: "var(--color-ink-muted)", marginBottom: "1.1rem" }}>
        <a href={href(`/${track}`)}>{routeLabel(track)}</a>
        <span aria-hidden="true">/</span>
        <a href={href(`/timeline/${track}`)}>编年长卷</a>
        <span aria-hidden="true">/</span>
        <span>{epoch.label}</span>
      </div>

      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        {routeLabel(track)} · {epoch.label}
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>{epoch.name}</h1>
      <p style={{ color: "var(--color-ink-variant)", marginTop: "0.7rem", maxWidth: "46rem", fontSize: "var(--text-body-lg)", lineHeight: 1.9 }}>
        {epoch.oneLiner}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "var(--spacing-md)" }}>
        <span className="seal">{spanText(epoch.span.from, epoch.span.to)}</span>
        {epoch.keywords.map((k) => (
          <a
            key={k}
            className="chip"
            href={href(`/archive?track=${track}&theme=${encodeURIComponent(k)}`)}
            style={{ textDecoration: "none" }}
          >
            {k}
          </a>
        ))}
      </div>

      <div className="track-head" style={{ marginTop: "var(--spacing-xl)" }}>
        <span className="t">
          <i aria-hidden="true" />
          {routeLabel(track)}
        </span>
        <span className="s">本卷 {evs.length} 条 · 按时间顺序</span>
      </div>

      <div className="epoch-cards">
        {evs.length ? (
          evs.map((e) => <EventCard key={e.id} event={e} />)
        ) : (
          <div className="card">
            <p className="sum">本卷尚未收录条目，正在修撰。</p>
          </div>
        )}
      </div>

      {comps.length ? (
        <section style={{ marginTop: "var(--spacing-2xl)" }}>
          <div className="eb-confluence" style={{ marginTop: 0 }}>
            <span className="label">可选 · 跨轨对照</span>
            <span className="ebc-body">
              <span>
                本卷有 {comps.length} 组与域外同时期的四维对照（{comps.map((c) => c.right.title).join(" / ")}）。
              </span>
              <span className="ebc-verdict">对照视图会把两条线并置，只在你想比较时进入。</span>
            </span>
            <a href={href("/compare")}>去对照视图 →</a>
          </div>
        </section>
      ) : null}

      <div className="pager">
        {prev ? <a href={href(`/epoch/${prev.id}`)}>← {prev.name}</a> : <span />}
        {next ? <a href={href(`/epoch/${next.id}`)}>{next.name} →</a> : <span />}
      </div>
    </div>
  );
}
