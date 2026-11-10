import raw from "@/app/data/content.json";

export type Track = "cn" | "world";

export interface Source {
  title: string;
  url: string;
  publisher?: string;
}

export interface Figure {
  name: string;
  role?: string;
}

export interface EventSection {
  title: string;
  body: string;
}

export interface TimelineNode {
  year: number;
  text: string;
}

export interface HEvent {
  id: string;
  track: Track;
  epochId: string;
  start: number;
  end?: number;
  title: string;
  subtitle?: string;
  era?: string;
  region?: string;
  themes: string[];
  summary: string;
  background: string;
  course: string;
  impact: string;
  figures: Figure[];
  sections?: EventSection[];
  timeline?: TimelineNode[];
  counterparts: string[];
  sources: Source[];
  verified: boolean;
  disputed?: boolean;
}

export interface Epoch {
  id: string;
  stageId: string;
  order: number;
  label: string;
  name: string;
  slug: string;
  span: { from: number; to: number };
  oneLiner: string;
  keywords: string[];
}

export interface Stage {
  id: string;
  order: number;
  label: string;
  name: string;
  span: { from: number; to: number };
  cnEpochId: string;
  worldEpochId: string;
  cnFeature: string;
  worldFeature: string;
  cnLine: { k: string; v: string }[];
  worldLine: { k: string; v: string }[];
  compare: string[];
  anchor?: boolean;
  anchorNote?: string;
}

export interface EpochSet {
  track: Track;
  label: string;
  sub: string;
  epochs: Epoch[];
}

export interface Dimension {
  name: string;
  left: string;
  right: string;
}

export interface Comparison {
  id: string;
  cnEpochId: string;
  worldEpochId: string;
  left: { title: string; place: string; polity: string };
  right: { title: string; place: string; polity: string };
  dimensions: Dimension[];
  verdict: string;
  quizRefs: string[];
}

interface Content {
  stages: { framework: string; stages: Stage[]; methods: { title: string; body: string }[]; books: { layer: string; items: string[] }[] };
  epochsCn: EpochSet;
  epochsWorld: EpochSet;
  events: HEvent[];
  comparisons: Comparison[];
  stats: {
    events: number;
    cn: number;
    world: number;
    epochsCn: number;
    epochsWorld: number;
    stages: number;
    dynasties: number;
    rulers: number;
    comparisons: number;
    earliest: number;
    latest: number;
  };
}

const content = raw as unknown as Content;

/** 两条路线，各自独立的纪元体系，默认不混排 */
export const routes: Record<Track, EpochSet> = {
  cn: content.epochsCn,
  world: content.epochsWorld,
};

export const framework = content.stages;
export const stages = content.stages.stages;
export const stageById = new Map(stages.map((s) => [s.id, s]));

export const events = content.events;
export const comparisons = content.comparisons;
export const stats = content.stats;

export const epochById = new Map<string, Epoch>(
  [...routes.cn.epochs, ...routes.world.epochs].map((e) => [e.id, e])
);

export const eventById = new Map(events.map((e) => [e.id, e]));

export const epochsOf = (track: Track): Epoch[] => routes[track].epochs;
export const routeLabel = (track: Track) => routes[track].label;
export const routeSub = (track: Track) => routes[track].sub;

export const eventsOfTrack = (track: Track) =>
  events.filter((e) => e.track === track).sort((a, b) => a.start - b.start);

export const eventsOfEpoch = (epochId: string) =>
  events.filter((e) => e.epochId === epochId).sort((a, b) => a.start - b.start);

/** 主题统计：可按轨道分别算，路线页不串味 */
export function themeCounts(track?: Track): { theme: string; count: number }[] {
  const map = new Map<string, number>();
  for (const e of events) {
    if (track && e.track !== track) continue;
    for (const t of e.themes) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count || a.theme.localeCompare(b.theme, "zh"));
}

export const comparisonById = (id: string) => comparisons.find((c) => c.id === id);
export const comparisonsOfEpoch = (epochId: string) =>
  comparisons.filter((c) => c.cnEpochId === epochId || c.worldEpochId === epochId);

export function counterpartsOf(e: HEvent): HEvent[] {
  return e.counterparts.map((id) => eventById.get(id)).filter((x): x is HEvent => Boolean(x));
}

/** 同轨道内相邻事件，用于详情页翻页 */
export function neighbours(e: HEvent): { prev?: HEvent; next?: HEvent } {
  const sorted = eventsOfTrack(e.track);
  const i = sorted.findIndex((x) => x.id === e.id);
  return { prev: sorted[i - 1], next: sorted[i + 1] };
}

/** 纪元在所属路线中的前一个 / 后一个纪元 */
export function epochNeighbours(epochId: string): { prev?: Epoch; next?: Epoch } {
  const track: Track = epochId.startsWith("c") ? "cn" : "world";
  const list = epochsOf(track);
  const i = list.findIndex((e) => e.id === epochId);
  return { prev: list[i - 1], next: list[i + 1] };
}

export const eventsOfStage = (stageId: string) => {
  const st = stageById.get(stageId);
  if (!st) return [];
  return events.filter((e) => e.epochId === st.cnEpochId || e.epochId === st.worldEpochId).sort((a, b) => a.start - b.start);
};

export const epochOfStage = (stageId: string, track: Track) => {
  const st = stageById.get(stageId);
  if (!st) return undefined;
  return epochById.get(track === "cn" ? st.cnEpochId : st.worldEpochId);
};

export const trackOfEpoch = (epochId: string): Track => (epochId.startsWith("c") ? "cn" : "world");
