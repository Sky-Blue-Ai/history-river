import TimelineBoard, { type TLItem } from "@/components/TimelineBoard";
import { epochById, epochs, events, stats } from "@/lib/content";
import { shortYear } from "@/lib/format";

export const metadata = { title: "双轨编年长卷" };

export default function TimelinePage() {
  const items: TLItem[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    track: e.track,
    start: e.start,
    end: e.end,
    epochId: e.epochId,
    epochName: epochById.get(e.epochId)?.name ?? "",
  }));

  return (
    <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
      <div className="eyebrow" style={{ fontSize: "0.625rem", letterSpacing: "0.28em", color: "var(--color-bronze)" }}>
        CHRONOS SYNCHRONOUS ATLAS
      </div>
      <h1 style={{ fontSize: "var(--text-headline-xl)", marginTop: "0.5rem" }}>双轨编年长卷</h1>
      <p style={{ color: "var(--color-ink-variant)", marginTop: "0.6rem", maxWidth: "46rem" }}>
        左列华夏正朔，右列域外诸邦，同一年代并置阅读。当前收录 {stats.events} 条，覆盖{" "}
        {shortYear(stats.earliest)} 至 {shortYear(stats.latest)}。
      </p>
      <TimelineBoard items={items} epochs={epochs.map((e) => ({ id: e.id, name: e.name, label: e.label }))} />
    </div>
  );
}
