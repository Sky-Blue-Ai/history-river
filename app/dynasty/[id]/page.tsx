import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EventCard from "@/components/EventCard";
import { dynasties, dynastyById, neighboursOfDynasty, rulersOf } from "@/lib/dynasties";
import { eventById } from "@/lib/content";
import { formatYear, href, spanText } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return dynasties.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const d = dynastyById.get(id);
  return d
    ? { title: `${d.name} · 君主与大事`, description: d.summary.slice(0, 80) }
    : { title: "朝代不存在" };
}

export default async function DynastyPage({ params }: Params) {
  const { id } = await params;
  const d = dynastyById.get(id);
  if (!d) notFound();

  const rulers = rulersOf(d);
  const evs = d.eventIds.map((eid) => eventById.get(eid)).filter(Boolean);
  const { prev, next } = neighboursOfDynasty(d.id);

  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
      <div className="crumb" style={{ fontSize: "var(--text-label-sm)", color: "var(--color-ink-muted)", marginBottom: "1.1rem" }}>
        <a href={href("/cn")}>华夏编年</a>
        <span aria-hidden="true">/</span>
        <a href={href("/dynasties")}>朝代索引</a>
        <span aria-hidden="true">/</span>
        <span>{d.name}</span>
      </div>

      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        朝代 · {spanText(d.span.from, d.span.to)}
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>{d.name}</h1>

      <div className="dyn-facts">
        <div><span className="k">起止</span><span className="v">{formatYear(d.span.from)} — {formatYear(d.span.to)}</span></div>
        <div><span className="k">都城</span><span className="v">{d.capital}</span></div>
        <div><span className="k">建立者</span><span className="v">{d.founder}</span></div>
        <div><span className="k">终结</span><span className="v">{d.endReason}</span></div>
      </div>

      <p style={{ marginTop: "var(--spacing-md)", color: "var(--color-ink-variant)", lineHeight: 1.95, maxWidth: "52rem", fontSize: "var(--text-body-lg)" }}>
        {d.summary}
      </p>

      <div className="lens" style={{ marginTop: "var(--spacing-md)" }}>
        {d.keywords.map((k) => (
          <span key={k} className="chip">{k}</span>
        ))}
      </div>

      {rulers.length ? (
        <section style={{ marginTop: "var(--spacing-2xl)" }}>
          <div className="sec-head">
            <h2>历代君主</h2>
            <span className="label">共 {rulers.length} 位 · 按在位顺序</span>
          </div>
          <div className="ruler-table" role="table" aria-label={`${d.name}历代君主`}>
            <div className="rt-head" role="row">
              <span role="columnheader">#</span>
              <span role="columnheader">庙号 / 称号</span>
              <span role="columnheader">名讳</span>
              <span role="columnheader">在位</span>
              <span role="columnheader">事迹</span>
            </div>
            {rulers.map((r, i) => (
              <div className="rt-row" role="row" key={`${r.title}-${r.name}-${r.from}`}>
                <span className="rt-n" role="cell">{String(i + 1).padStart(2, "0")}</span>
                <span className="rt-title" role="cell">{r.title}</span>
                <span className="rt-name" role="cell">{r.name}</span>
                <span className="rt-years" role="cell">{spanText(r.from, r.to)}</span>
                <span className="rt-note" role="cell">{r.note}</span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section style={{ marginTop: "var(--spacing-2xl)" }}>
          <div className="sec-head">
            <h2>政权与分期说明</h2>
            <span className="label">本板块为时期，无单一君主序列</span>
          </div>
          <ul className="polity-list">
            {d.polities.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      )}

      {evs.length ? (
        <section style={{ marginTop: "var(--spacing-2xl)" }}>
          <div className="sec-head">
            <h2>本朝大事</h2>
            <span className="label">{evs.length} 条 · 已核验</span>
          </div>
          <div className="epoch-cards">
            {evs.map((e) => (e ? <EventCard key={e.id} event={e} /> : null))}
          </div>
        </section>
      ) : null}

      <section style={{ marginTop: "var(--spacing-2xl)" }}>
        <div className="sec-head">
          <h2>著名人物</h2>
          <span className="label">{d.people.length} 位</span>
        </div>
        <ul className="people-list">
          {d.people.map((p) => (
            <li key={p.name}>
              <span className="pn">{p.name}</span>
              <span className="pr">{p.role}</span>
              <span className="pd">{p.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "var(--spacing-xl)" }}>
        <div className="sec-head">
          <h2>来源</h2>
          <span className="label">可点开核对原文</span>
        </div>
        <ul className="sources">
          {d.sources.map((s) => (
            <li key={s.url}>
              <span aria-hidden="true">·</span>
              <span>
                <a href={s.url} target="_blank" rel="noreferrer noopener">{s.title}</a>
                {s.publisher ? `（${s.publisher}）` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="pager">
        {prev ? <a href={href(`/dynasty/${prev.id}`)}>← {prev.name}</a> : <span />}
        {next ? <a href={href(`/dynasty/${next.id}`)}>{next.name} →</a> : <span />}
      </div>
    </div>
  );
}
