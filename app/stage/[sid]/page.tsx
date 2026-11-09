import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EventCard from "@/components/EventCard";
import { eventsOfStage, stageById, stages, epochById } from "@/lib/content";
import { href, spanText } from "@/lib/format";

type Params = { params: Promise<{ sid: string }> };

export function generateStaticParams() {
  return stages.map((s) => ({ sid: s.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { sid } = await params;
  const st = stageById.get(sid);
  return st ? { title: `${st.name} · 分期`, description: st.compare.slice(0, 80) } : { title: "阶段不存在" };
}

export default async function StagePage({ params }: Params) {
  const { sid } = await params;
  const stage = stageById.get(sid);
  if (!stage) notFound();

  const cnEpoch = epochById.get(stage.cnEpochId);
  const worldEpoch = epochById.get(stage.worldEpochId);
  const evs = eventsOfStage(stage.id);
  const idx = stages.findIndex((s) => s.id === stage.id);
  const prev = stages[idx - 1];
  const next = stages[idx + 1];

  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
      <div className="crumb" style={{ fontSize: "var(--text-label-sm)", color: "var(--color-ink-muted)", marginBottom: "1.1rem" }}>
        <a href={href("/overview")}>总览分期</a>
        <span aria-hidden="true">/</span>
        <span>{stage.label}</span>
      </div>

      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        {stage.label} · {spanText(stage.span.from, stage.span.to)}
        {stage.anchor ? " · 关键节点" : ""}
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>{stage.name}</h1>

      <div className="stage-cols">
        <section className="panel stage-panel" data-track="cn">
          <h3>
            <span className="dot" aria-hidden="true" /> 中国线索
          </h3>
          <p>{stage.cnFeature}</p>
          {cnEpoch ? (
            <a className="stage-link" href={href(`/epoch/${cnEpoch.id}`)}>
              读{cnEpoch.name}（{cnEpoch.label}）→
            </a>
          ) : null}
        </section>

        <section className="panel stage-panel" data-track="world">
          <h3>
            <span className="dot" aria-hidden="true" /> 世界线索
          </h3>
          <p>{stage.worldFeature}</p>
          {worldEpoch ? (
            <a className="stage-link" href={href(`/epoch/${worldEpoch.id}`)}>
              读{worldEpoch.name}（{worldEpoch.label}）→
            </a>
          ) : null}
        </section>
      </div>

      <section className="panel" style={{ marginTop: "var(--spacing-lg)", borderLeft: "2px solid var(--color-bronze)", borderRadius: "0 var(--radius-lg) var(--radius-lg) 0" }}>
        <h3>本阶段对照要点</h3>
        <p style={{ marginTop: "0.6rem", color: "var(--color-ink-variant)", lineHeight: 1.95 }}>{stage.compare}</p>
        {stage.anchorNote ? (
          <p style={{ marginTop: "0.6rem", fontSize: "var(--text-label-md)", color: "var(--color-bronze)", letterSpacing: "0.04em" }}>
            ◆ {stage.anchorNote}
          </p>
        ) : null}
      </section>

      <div className="track-head" style={{ marginTop: "var(--spacing-2xl)" }}>
        <span className="t">
          <i aria-hidden="true" />
          本阶段已收录
        </span>
        <span className="s">{evs.length} 条（华夏 {evs.filter((e) => e.track === "cn").length} · 域外 {evs.filter((e) => e.track === "world").length}）</span>
      </div>

      <div className="epoch-cards">
        {evs.length ? (
          evs.map((e) => <EventCard key={e.id} event={e} />)
        ) : (
          <div className="card">
            <p className="sum">本阶段尚未收录条目，正在修撰。</p>
          </div>
        )}
      </div>

      <div className="pager">
        {prev ? <a href={href(`/stage/${prev.id}`)}>← {prev.name}</a> : <span />}
        {next ? <a href={href(`/stage/${next.id}`)}>{next.name} →</a> : <span />}
      </div>
    </div>
  );
}
