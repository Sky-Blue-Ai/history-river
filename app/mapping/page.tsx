import { dynasties } from "@/lib/dynasties";
import { href, spanText } from "@/lib/format";

export const metadata = {
  title: "朝代 × 世界同期映射表",
  description: "按朝代并列：中国在发生什么，世界同期在发生什么。",
};

export default function MappingPage() {
  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        SYNCHRONIC TABLE
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>朝代 × 世界同期</h1>
      <p style={{ color: "var(--color-ink-variant)", marginTop: "0.7rem", maxWidth: "48rem", lineHeight: 1.9 }}>
        一张表把两条线并排：左边是中国朝代，右边是同期世界的主要力量与事件。
        这里只做并列，不做评判——要深入比较，去 <a href={href("/compare")} style={{ color: "var(--color-vermilion)" }}>对照视图</a>。
      </p>

      <div className="map-table" role="table" aria-label="朝代与世界同期映射">
        <div className="map-head" role="row">
          <span role="columnheader">朝代</span>
          <span role="columnheader">年代</span>
          <span role="columnheader">世界同期</span>
        </div>
        {dynasties.map((d) => (
          <div className="map-row" role="row" key={d.id}>
            <span className="map-cn" role="cell">
              <a href={href(`/dynasty/${d.id}`)}>{d.name}</a>
            </span>
            <span className="map-years" role="cell">{spanText(d.span.from, d.span.to)}</span>
            <span className="map-world" role="cell">{d.worldNote ?? "—"}</span>
          </div>
        ))}
      </div>

      <p className="label" style={{ marginTop: "var(--spacing-md)" }}>
        注：朝代年代取通行纪年；同期一栏只列主要力量，不追求穷举。世界史细目见 <a href={href("/world")} style={{ color: "var(--color-vermilion)" }}>域外编年</a>。
      </p>
    </div>
  );
}
