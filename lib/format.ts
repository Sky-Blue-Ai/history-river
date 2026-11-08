export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 内部链接统一入口：子路径部署（GitHub Pages）时自动加前缀 */
export function href(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE}${path}`;
}

/** /public 下的静态资源 */
export function asset(path: string): string {
  return href(path.startsWith("/") ? path : `/${path}`);
}

export function formatYear(year: number): string {
  return year < 0 ? `公元前 ${-year} 年` : `公元 ${year} 年`;
}

export function shortYear(year: number): string {
  return year < 0 ? `BC ${-year}` : `AD ${year}`;
}

export function spanText(start: number, end?: number): string {
  if (end === undefined || end === start) return shortYear(start);
  return `${shortYear(start)} – ${shortYear(end)}`;
}

export function yearRange(start: number, end: number): string {
  return `${shortYear(start)} — ${shortYear(end)}`;
}

export function centuryLabel(year: number): string {
  const abs = Math.abs(year);
  const c = Math.floor((abs - 1) / 100) + 1;
  return year < 0 ? `公元前 ${c} 世纪` : `公元 ${c} 世纪`;
}

/** 世纪分组键：-3300 → -3300..-3200；105 → 101..200 */
export function centuryKey(year: number): number {
  const sign = year < 0 ? -1 : 1;
  const abs = Math.abs(year);
  const base = Math.floor((abs - 1) / 100) * 100 + 1;
  return sign * base;
}
