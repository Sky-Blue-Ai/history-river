import { epochs, events, stats } from "@/lib/content";
import { shortYear } from "@/lib/format";

export const metadata = { title: "馆藏通则：来源与口径" };

export default function SourcesPage() {
  const all = new Map<string, { title: string; url: string; publisher?: string; count: number }>();
  for (const e of events) {
    for (const s of e.sources) {
      const hit = all.get(s.url);
      if (hit) hit.count += 1;
      else all.set(s.url, { ...s, count: 1 });
    }
  }
  const sources = [...all.values()].sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "zh"));
  const disputed = events.filter((e) => e.disputed);

  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)", maxWidth: "62rem" }}>
      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        COLLECTION NOTES
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>馆藏通则：来源与口径</h1>
      <p style={{ color: "var(--color-ink-variant)", marginTop: "0.8rem", fontSize: "var(--text-body-lg)", lineHeight: 1.95 }}>
        本馆为个人研学项目，不是学术出版物。每一条事件都标注来源，凡涉学界不同说法者单独标「存异说」。
        当前收录 {stats.events} 条（中国 {stats.cn} / 世界 {stats.world}），跨 {stats.epochs} 个纪元，
        时间范围 {shortYear(stats.earliest)} — {shortYear(stats.latest)}。
      </p>

      <section style={{ marginTop: "var(--spacing-xl)" }}>
        <h2 style={{ fontSize: "var(--text-headline-md)", borderBottom: "1px solid var(--color-line)", paddingBottom: "0.5rem" }}>
          一、编纂口径
        </h2>
        <ul style={{ marginTop: "0.8rem", paddingLeft: "1.1rem", color: "var(--color-ink-variant)", lineHeight: 1.95, fontSize: "var(--text-body-sm)" }}>
          <li>年代：公元前用负数记法呈现（如 BC 221），不设公元 0 年；事件取学界通行的起止年，跨年事件给出区间。</li>
          <li>表述：以中国大陆通行教材与通史口径为主，遇中外学界分歧（如怛罗斯之战与造纸术西传的关系）并列说法并标注。</li>
          <li>地理：使用「历史地理范围」描述，不以后世国界倒推古代政权疆域。</li>
          <li>人物：只列与该事件直接相关者，生卒年不逐一考证，需要时以来源为准。</li>
          <li>门禁：所有条目经 <code>tools/check_content.py</code> 校验（字段、年份、双向对照、来源），未标 <code>verified</code> 的条目不会出现在页面上。</li>
        </ul>
      </section>

      <section style={{ marginTop: "var(--spacing-xl)" }}>
        <h2 style={{ fontSize: "var(--text-headline-md)", borderBottom: "1px solid var(--color-line)", paddingBottom: "0.5rem" }}>
          二、存异说条目（{disputed.length} 条）
        </h2>
        {disputed.length ? (
          <ul style={{ marginTop: "0.8rem", paddingLeft: "1.1rem", color: "var(--color-ink-variant)", lineHeight: 1.95, fontSize: "var(--text-body-sm)" }}>
            {disputed.map((e) => (
              <li key={e.id}>
                <b style={{ color: "var(--color-ink)" }}>{e.title}</b>：{e.impact.slice(0, 60)}…
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ marginTop: "0.8rem", color: "var(--color-ink-muted)", fontSize: "var(--text-body-sm)" }}>本期无。</p>
        )}
      </section>

      <section style={{ marginTop: "var(--spacing-xl)" }}>
        <h2 style={{ fontSize: "var(--text-headline-md)", borderBottom: "1px solid var(--color-line)", paddingBottom: "0.5rem" }}>
          三、全部来源（{sources.length} 个，去重后）
        </h2>
        <ul className="sources" style={{ marginTop: "0.9rem" }}>
          {sources.map((s) => (
            <li key={s.url}>
              <span aria-hidden="true">·</span>
              <span>
                <a href={s.url} target="_blank" rel="noreferrer noopener">
                  {s.title}
                </a>
                {s.publisher ? `（${s.publisher}）` : ""}
                <span style={{ color: "var(--color-ink-muted)" }}> · 引用 {s.count} 条</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "var(--spacing-xl)" }}>
        <h2 style={{ fontSize: "var(--text-headline-md)", borderBottom: "1px solid var(--color-line)", paddingBottom: "0.5rem" }}>
          四、卷目版本
        </h2>
        <ul style={{ marginTop: "0.8rem", paddingLeft: "1.1rem", color: "var(--color-ink-variant)", lineHeight: 1.95, fontSize: "var(--text-body-sm)" }}>
          {epochs.map((ep) => (
            <li key={ep.id}>
              {ep.label} · {ep.name}（{shortYear(ep.cnSpan.from)} — {shortYear(ep.cnSpan.to)}）
            </li>
          ))}
        </ul>
        <p style={{ marginTop: "1rem", fontSize: "var(--text-label-sm)", color: "var(--color-ink-muted)" }}>
          内容版本 v0.1：首期 27 条骨架，后续按期补入至 120 条（P1）。更新记录见仓库 README。
        </p>
      </section>
    </div>
  );
}
