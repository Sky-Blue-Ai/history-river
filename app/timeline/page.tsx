import TimelineBoard, { type TLItem } from "@/components/TimelineBoard";
import { epochsOf, eventsOfTrack, routeLabel, stats } from "@/lib/content";
import { href, shortYear } from "@/lib/format";

export const metadata = { title: "华夏编年长卷" };

export default function TimelinePage() {
  const track = "cn" as const;
  const evs = eventsOfTrack(track);
  const items: TLItem[] = evs.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    epochId: e.epochId,
  }));

  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        CHRONOS · SINGLE RAIL
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>华夏编年长卷</h1>
      <p style={{ color: "var(--color-ink-variant)", marginTop: "0.6rem", maxWidth: "46rem" }}>
        中国史单轨时间轴，当前 {stats.cn} 条，覆盖 {evs.length ? shortYear(Math.min(...evs.map((e) => e.start))) : "—"} 至{" "}
        {evs.length ? shortYear(Math.max(...evs.map((e) => e.end ?? e.start))) : "—"}。
      </p>
      <div className="tl-controls" style={{ marginBottom: 0 }}>
        <a className="chip" aria-pressed="true" href={href("/timeline")} style={{ textDecoration: "none" }}>
          华夏
        </a>
        <a className="chip" aria-pressed="false" href={href("/timeline/world")} style={{ textDecoration: "none" }}>
          域外
        </a>
      </div>
      <TimelineBoard items={items} epochs={epochsOf(track)} track={track} />
    </div>
  );
}
