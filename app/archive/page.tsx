import { Suspense } from "react";
import ArchiveClient, { type ArchiveItem } from "@/components/ArchiveClient";
import { epochById, events, routes, themeCounts } from "@/lib/content";

export const metadata = { title: "典籍与故事索引" };

export default function ArchivePage() {
  const items: ArchiveItem[] = [...events]
    .sort((a, b) => a.start - b.start || a.id.localeCompare(b.id))
    .map((e) => ({
      id: e.id,
      title: e.title,
      subtitle: e.subtitle,
      track: e.track,
      start: e.start,
      end: e.end,
      epochId: e.epochId,
      epochName: epochById.get(e.epochId)?.name ?? "",
      era: e.era,
      region: e.region,
      themes: e.themes,
      summary: e.summary,
      disputed: e.disputed,
    }));

  return (
    <Suspense fallback={<div className="wrap" style={{ paddingBlock: "var(--spacing-2xl)" }}>正在展开索引卷…</div>}>
      <ArchiveClient
        items={items}
        epochOptions={[
          ...routes.cn.epochs.map((e) => ({ id: e.id, name: `华夏 · ${e.name}` })),
          ...routes.world.epochs.map((e) => ({ id: e.id, name: `域外 · ${e.name}` })),
        ]}
        themeOptions={themeCounts()}
      />
    </Suspense>
  );
}
