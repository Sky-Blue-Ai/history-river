import { dynasties, dynastiesNote, rulersOf } from "@/lib/dynasties";
import { eventById } from "@/lib/content";
import { href, spanText } from "@/lib/format";

export const metadata = {
  title: "朝代索引",
  description: "从夏到清，每个朝代一个板块：君主表、本朝大事与著名人物。",
};

export default function DynastiesPage() {
  const totalRulers = dynasties.reduce((n, d) => n + d.rulers.length, 0);
  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        DYNASTIES · 十五板块
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>朝代索引</h1>
      <p style={{ color: "var(--color-ink-variant)", marginTop: "0.7rem", maxWidth: "48rem", lineHeight: 1.9 }}>
        {dynasties.length} 个板块、{totalRulers} 位君主，另有已核验大事与人物说明。
        夏商周与春秋战国、魏晋南北朝按「时期」处理，君主表以政权说明代替。
      </p>
      <p className="label" style={{ marginTop: "0.5rem" }}>{dynastiesNote}</p>

      <div className="dyn-grid">
        {dynasties.map((d) => {
          const rulers = rulersOf(d);
          const evs = d.eventIds.map((id) => eventById.get(id)).filter(Boolean);
          return (
            <a className="dyn-card" key={d.id} href={href(`/dynasty/${d.id}`)}>
              <div className="dyn-top">
                <span className="dyn-name">{d.name}</span>
                <span className="badge">{spanText(d.span.from, d.span.to)}</span>
              </div>
              <p className="dyn-sum">{d.summary.slice(0, 62)}…</p>
              <div className="dyn-meta">
                <span>君主 {d.rulers.length ? `${rulers.length} 位` : d.polities.length ? "时期" : "—"}</span>
                <span>大事 {evs.length}</span>
                <span>人物 {d.people.length}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
