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
  counterparts: string[];
  sources: Source[];
  verified: boolean;
  disputed?: boolean;
}

export interface Epoch {
  id: string;
  order: number;
  label: string;
  name: string;
  slug: string;
  cnSpan: { from: number; to: number };
  worldSpan: { from: number; to: number };
  oneLiner: string;
  keywords: string[];
  chapter: string;
}

export interface Dimension {
  name: string;
  left: string;
  right: string;
}

export interface Comparison {
  epochId: string;
  left: { title: string; place: string; polity: string };
  right: { title: string; place: string; polity: string };
  dimensions: Dimension[];
  verdict: string;
  quizRefs: string[];
}

interface Content {
  epochs: Epoch[];
  events: HEvent[];
  comparisons: Comparison[];
  stats: {
    events: number;
    cn: number;
    world: number;
    epochs: number;
    comparisons: number;
    earliest: number;
    latest: number;
  };
}

const content = raw as unknown as Content;

export const epochs = content.epochs;
export const events = content.events;
export const comparisons = content.comparisons;
export const stats = content.stats;

export const eventById = new Map(events.map((e) => [e.id, e]));
export const epochById = new Map(epochs.map((e) => [e.id, e]));
export const comparisonByEpoch = new Map(comparisons.map((c) => [c.epochId, c]));

export const eventsByTrack = (track: Track) => events.filter((e) => e.track === track);
export const eventsOfEpoch = (epochId: string) => events.filter((e) => e.epochId === epochId);

/** 主题统计：给「史学透镜」用，全部由数据算出，不写死 */
export function themeCounts(): { theme: string; count: number }[] {
  const map = new Map<string, number>();
  for (const e of events) for (const t of e.themes) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map.entries()]
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count || a.theme.localeCompare(b.theme, "zh"));
}

/** 每条事件的「同期对照」对象；双向关系在门禁里已保证 */
export function counterpartsOf(e: HEvent): HEvent[] {
  return e.counterparts.map((id) => eventById.get(id)).filter((x): x is HEvent => Boolean(x));
}

/** 按时间排序的相邻事件，用于详情页翻页 */
export function neighbours(e: HEvent): { prev?: HEvent; next?: HEvent } {
  const sorted = [...events].sort((a, b) => a.start - b.start || a.id.localeCompare(b.id));
  const i = sorted.findIndex((x) => x.id === e.id);
  return { prev: sorted[i - 1], next: sorted[i + 1] };
}
