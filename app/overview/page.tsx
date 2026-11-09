import { epochById, framework, stats, stageById, stages } from "@/lib/content";
import { href, spanText } from "@/lib/format";

export const metadata = {
  title: "总览分期 · 六阶段",
  description: "综合中国通史与全球通史的六阶段分期：同一时间，中国在发生什么，世界在发生什么。",
};

export default function OverviewPage() {
  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        OVERVIEW · SIX STAGES
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>总览分期</h1>
      <p style={{ color: "var(--color-ink-variant)", marginTop: "0.7rem", maxWidth: "52rem", lineHeight: 1.95, fontSize: "var(--text-body-lg)" }}>
        {framework.framework}
      </p>

      <div className="stage-table" role="table" aria-label="六阶段分期表">
        <div className="st-head" role="row">
          <span role="columnheader">大阶段</span>
          <span role="columnheader">中国</span>
          <span role="columnheader">世界（全球史框架）</span>
        </div>
        {stages.map((st) => {
          const cnEp = epochById.get(st.cnEpochId);
          const wEp = epochById.get(st.worldEpochId);
          return (
            <a className="st-row" role="row" key={st.id} href={href(`/stage/${st.id}`)}>
              <span className="st-name" role="cell">
                <b>{st.name}</b>
                <em>{st.anchor ? "◆ 关键节点" : ""}</em>
                <small>{spanText(st.span.from, st.span.to)}</small>
              </span>
              <span className="st-cn" role="cell">
                <b>{cnEp?.name}</b>
                <small>{st.cnFeature}</small>
              </span>
              <span className="st-world" role="cell">
                <b>{wEp?.name}</b>
                <small>{st.worldFeature}</small>
              </span>
            </a>
          );
        })}
      </div>

      <section style={{ marginTop: "var(--spacing-2xl)" }}>
        <h2 style={{ fontSize: "var(--text-headline-lg)", borderBottom: "1px solid var(--color-line)", paddingBottom: "0.5rem" }}>
          四个最值得停下来对照的节点
        </h2>
        <ul className="anchor-list">
          {stages
            .filter((s) => s.anchorNote)
            .map((s) => (
              <li key={s.id}>
                <a href={href(`/stage/${s.id}`)}>{s.name}</a>
                <span>{s.anchorNote}</span>
              </li>
            ))}
        </ul>
      </section>

      <section style={{ marginTop: "var(--spacing-2xl)" }}>
        <h2 style={{ fontSize: "var(--text-headline-lg)", borderBottom: "1px solid var(--color-line)", paddingBottom: "0.5rem" }}>
          两条轴线，三种操作
        </h2>
        <div className="method-grid">
          {framework.methods.map((m) => (
            <div className="panel" key={m.title}>
              <h3>{m.title}</h3>
              <p style={{ marginTop: "0.5rem", fontSize: "var(--text-body-sm)", color: "var(--color-ink-variant)", lineHeight: 1.9 }}>{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "var(--spacing-2xl)" }}>
        <h2 style={{ fontSize: "var(--text-headline-lg)", borderBottom: "1px solid var(--color-line)", paddingBottom: "0.5rem" }}>
          书单：先搭双轴，再对照，最后深读
        </h2>
        <div className="book-grid">
          {framework.books.map((b) => (
            <div key={b.layer}>
              <h4>{b.layer}</h4>
              <ul>
                {b.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p style={{ marginTop: "var(--spacing-md)", fontSize: "var(--text-body-sm)", color: "var(--color-ink-muted)", lineHeight: 1.9 }}>
          建议顺序：一本中国通史 + 一本全球通史搭起双轴 → 用对照年表做横向串联 → 选一个节点（轴心时代或大分流）读专题。
          不必从头读到尾，带着「同一时间，另一边在发生什么」去翻。
        </p>
      </section>

      <div className="eb-confluence" style={{ marginTop: "var(--spacing-xl)" }}>
        <span className="label">当前进度</span>
        <span className="ebc-body">
          <span>
            {stats.stages} 个阶段已建骨架，事件 {stats.events} 条（华夏 {stats.cn} / 域外 {stats.world}），可选对照 {stats.comparisons} 组。
          </span>
          <span className="ebc-verdict">阶段是骨架，条目会按阶段逐步补满；空卷会明确标「待补」，不拿假数据凑数。</span>
        </span>
        <a href={href("/cn")}>从华夏卷一读起 →</a>
      </div>
    </div>
  );
}
