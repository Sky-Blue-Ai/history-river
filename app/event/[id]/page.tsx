import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Plate from "@/components/Plate";
import { epochById, eventById, events, neighbours, counterpartsOf } from "@/lib/content";
import { formatYear, href, spanText } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const e = eventById.get(id);
  if (!e) return { title: "条目不存在" };
  return { title: e.title, description: e.summary.slice(0, 80) };
}

export default async function EventPage({ params }: Params) {
  const { id } = await params;
  const event = eventById.get(id);
  if (!event) notFound();

  const epoch = epochById.get(event.epochId);
  const counterparts = counterpartsOf(event);
  const { prev, next } = neighbours(event);

  return (
    <article className="wrap">
      <div className="article">
        <div className="crumb">
          <a href={href("/")}>典藏纪年</a>
          <span aria-hidden="true">/</span>
          <a href={href(`/epoch/${event.epochId}`)}>{epoch?.name ?? "纪元"}</a>
          <span aria-hidden="true">/</span>
          <span>{event.title}</span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.9rem" }}>
          <span className="seal">{event.track === "cn" ? "华夏" : "域外"}</span>
          <span className="label">{event.track === "cn" ? "正朔本轨" : "域外并轨"}</span>
          {event.disputed ? <span className="badge">存异说</span> : null}
        </div>

        <h1>{event.title}</h1>
        {event.subtitle ? (
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-body-lg)", color: "var(--color-ink-muted)", marginTop: "0.5rem" }}>
            {event.subtitle}
          </p>
        ) : null}

        <div className="meta">
          <span>{formatYear(event.start)}{event.end && event.end !== event.start ? ` — ${formatYear(event.end)}` : ""}</span>
          {event.era ? <span>{event.era}</span> : null}
          {event.region ? <span>{event.region}</span> : null}
          <span>{event.themes.join(" · ")}</span>
        </div>

        <p className="lede">{event.summary}</p>

        <figure className="plate-wrap" style={{ marginTop: "var(--spacing-lg)" }}>
          <Plate id={event.id} title={event.title} track={event.track} height={320} />
          <figcaption>{event.subtitle ? `${event.subtitle} · 图卷` : `${event.title} · 图卷`}</figcaption>
        </figure>

        <section>
          <h2>背景</h2>
          <p>{event.background}</p>
        </section>
        <section>
          <h2>经过</h2>
          <p>{event.course}</p>
        </section>
        <section>
          <h2>影响</h2>
          <p>{event.impact}</p>
        </section>

        {event.figures.length > 0 ? (
          <section>
            <h2>风云人物</h2>
            <div className="figures" style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {event.figures.map((f) => (
                <span
                  key={f.name}
                  style={{
                    fontSize: "0.8125rem",
                    border: "1px solid var(--color-line-strong)",
                    borderRadius: "var(--radius-xs)",
                    padding: "0.2rem 0.5rem",
                    background: "var(--color-surface)",
                  }}
                >
                  {f.name}
                  {f.role ? <span style={{ color: "var(--color-ink-muted)" }}> · {f.role}</span> : null}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {counterparts.length > 0 ? (
          <div className="callout">
            <span className="label">同期对照 · 另一边在发生什么</span>
            <h3>时空交错点</h3>
            <div className="counterpart-list">
              {counterparts.map((c) => (
                <a className="counterpart" key={c.id} href={href(`/event/${c.id}`)}>
                  <span className="t">{c.title}</span>
                  <span className="w">{spanText(c.start, c.end)}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <section>
          <h2>来源与依据</h2>
          <ul className="sources">
            {event.sources.map((s) => (
              <li key={s.url}>
                <span aria-hidden="true">·</span>
                <span>
                  <a href={s.url} target="_blank" rel="noreferrer noopener">
                    {s.title}
                  </a>
                  {s.publisher ? `（${s.publisher}）` : ""}
                </span>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: "0.7rem", fontSize: "var(--text-label-sm)", color: "var(--color-ink-muted)" }}>
            {event.disputed
              ? "本条涉及学界不同说法，正文已标注，阅读时请以来源原文为准。"
              : "条目为通识性整理，年代与人物以上列来源为准；发现错漏可在来源页查看修订说明。"}
          </p>
        </section>

        <div className="pager">
          {prev ? (
            <a href={href(`/event/${prev.id}`)}>
              ← {spanText(prev.start, prev.end)} · {prev.title}
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a href={href(`/event/${next.id}`)} style={{ textAlign: "right" }}>
              {spanText(next.start, next.end)} · {next.title} →
            </a>
          ) : (
            <span />
          )}
        </div>
      </div>
    </article>
  );
}
