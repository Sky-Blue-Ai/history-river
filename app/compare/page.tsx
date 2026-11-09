import { comparisons, epochById } from "@/lib/content";
import { href, spanText } from "@/lib/format";

export const metadata = { title: "跨轨对照视图" };

export default function ComparePage() {
  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        COMPARATIVE VIEW · OPTIONAL
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>跨轨对照视图</h1>
      <p style={{ color: "var(--color-ink-variant)", marginTop: "0.7rem", maxWidth: "48rem", lineHeight: 1.9 }}>
        这里才把两条线并置。每一组锁定一个中国卷目与一个域外时期，按政体、经济、思想、军事四维对照。
        <b>它是选修，不是阅读方式</b>——日常请走 <a href={href("/cn")} style={{ color: "var(--color-vermilion)" }}>华夏编年</a> 或{" "}
        <a href={href("/world")} style={{ color: "var(--color-vermilion)" }}>域外编年</a>。
      </p>

      {comparisons.map((c) => {
        const cnEpoch = epochById.get(c.cnEpochId);
        const worldEpoch = epochById.get(c.worldEpochId);
        return (
          <section key={c.id} style={{ marginTop: "var(--spacing-2xl)" }}>
            <div className="eb-head">
              <span className="lab">对照 · {c.id.toUpperCase()}</span>
              <h2>
                {cnEpoch?.name} <span style={{ color: "var(--color-bronze)", fontSize: "0.8em" }}>×</span> {worldEpoch?.name}
              </h2>
              <span className="sp">
                {cnEpoch ? spanText(cnEpoch.span.from, cnEpoch.span.to) : ""} /{" "}
                {worldEpoch ? spanText(worldEpoch.span.from, worldEpoch.span.to) : ""}
              </span>
            </div>

            <div className="matrix">
              <div className="mhead">
                <div className="dim">维度</div>
                <div>{c.left.title}</div>
                <div>{c.right.title}</div>
              </div>
              {c.dimensions.map((d) => (
                <div className="mrow" key={d.name}>
                  <div className="dim">{d.name}</div>
                  <div>{d.left}</div>
                  <div className="r">{d.right}</div>
                </div>
              ))}
              <div className="verdict">
                <b>太史令短评 · </b>
                {c.verdict}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "0.7rem", flexWrap: "wrap", fontSize: "var(--text-label-sm)" }}>
              <span className="label">{c.left.place} ↔ {c.right.place}</span>
              <a href={href(`/epoch/${c.cnEpochId}`)} style={{ color: "var(--color-vermilion)" }}>读本卷华夏条目 →</a>
              <a href={href(`/epoch/${c.worldEpochId}`)} style={{ color: "var(--color-vermilion)" }}>读同期域外条目 →</a>
            </div>
          </section>
        );
      })}
    </div>
  );
}
