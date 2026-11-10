import EventCard from "@/components/EventCard";
import {
  comparisons,
  epochsOf,
  eventsOfTrack,
  routeLabel,
  routeSub,
  stats,
  themeCounts,
  type Track,
} from "@/lib/content";
import { href, shortYear, spanText } from "@/lib/format";

const COPY: Record<Track, { eyebrow: string; title: string; intro: string; className: string }> = {
  cn: {
    eyebrow: "CHRONOS · SINICA",
    title: "中国史：从良渚到辛亥",
    intro:
      "以朝代与制度为骨架，按时间顺序读一遍中国史。每卷给出该时段的主题与代表事件，不与其他文明并置——先把一条线走通，再谈比较。",
    className: "route-cn",
  },
  world: {
    eyebrow: "CHRONOS · ORBIS",
    title: "世界史：从金字塔到工业帝国",
    intro:
      "以地中海、两河、欧亚大陆为主线，按时期读域外文明。这里不出现中国条目；要看同一时间两边各自发生了什么，走「对照视图」。",
    className: "route-world",
  },
};

export default function RouteHome({ track }: { track: Track }) {
  const copy = COPY[track];
  const eps = epochsOf(track);
  const evs = eventsOfTrack(track);
  const themes = themeCounts(track);
  const earliest = evs.length ? Math.min(...evs.map((e) => e.start)) : 0;
  const latest = evs.length ? Math.max(...evs.map((e) => e.end ?? e.start)) : 0;

  const blocks = eps.map((ep) => {
    const list = evs.filter((e) => e.epochId === ep.id);
    return { epoch: ep, list, comparison: comparisons.find((c) => c.cnEpochId === ep.id || c.worldEpochId === ep.id) };
  });

  return (
    <main className={copy.className}>
      <section className="wrap hero">
        <div>
          <div className="eyebrow">{copy.eyebrow}</div>
          <h1>{copy.title}</h1>
          <p className="lede">{copy.intro}</p>
        </div>

        <div className="stat-panel">
          <div className="row">
            <span className="k">本路线跨度</span>
            <span className="v">
              {evs.length ? `${shortYear(earliest)} — ${shortYear(latest)}` : "待补"}
            </span>
          </div>
          <div className="row">
            <span className="k">已收录事件</span>
            <span className="v">
              {evs.length} <small>条</small>
            </span>
          </div>
          <div className="row">
            <span className="k">卷目</span>
            <span className="v">
              {eps.length} <small>卷</small>
            </span>
          </div>
          <div className="row">
            <span className="k">对照视图</span>
            <span className="v">
              <a href={href("/compare")} style={{ color: "var(--color-vermilion)" }}>
                {stats.comparisons} 组 ↗
              </a>
            </span>
          </div>
        </div>
      </section>

      {track === "cn" ? (
        <div className="wrap" style={{ paddingTop: "var(--spacing-md)" }}>
          <a className="btn ghost" href={href("/dynasties")}>
            按朝代读：{stats.dynasties} 个板块 · {stats.rulers} 位君主 →
          </a>
        </div>
      ) : null}

      <nav className="wrap" aria-label={`${routeLabel(track)}卷目`}>
        <div className="epochs">
          {eps.map((ep) => (
            <a className="epoch" key={ep.id} href={href(`/epoch/${ep.id}`)}>
              <div className="lab">{ep.label}</div>
              <div className="nm">{ep.name}</div>
              <div className="sp">{spanText(ep.span.from, ep.span.to)}</div>
            </a>
          ))}
        </div>
      </nav>

      <div className="wrap layout">
        <aside className="rail">
          <div className="panel">
            <h3>本路线</h3>
            <div className="hint">{routeSub(track)}</div>
            <ul className="civ-list">
              <li data-track={track}>
                <span>{routeLabel(track)}</span>
                <span className="tag">单轨 · {evs.length}</span>
              </li>
              <li>
                <span>{track === "cn" ? "域外编年（独立路线）" : "华夏编年（独立路线）"}</span>
                <span className="tag">
                  <a href={href(track === "cn" ? "/world" : "/cn")}>切换 →</a>
                </span>
              </li>
            </ul>
          </div>

          <div className="panel">
            <h3>史学透镜</h3>
            <div className="hint">本路线主题分布 · 共 {themes.length} 类</div>
            <div className="lens">
              {themes.map((t) => (
                <a key={t.theme} href={href(`/archive?track=${track}&theme=${encodeURIComponent(t.theme)}`)}>
                  {t.theme}
                  <span className="n">{t.count}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3>读法建议</h3>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink-variant)", marginTop: "0.6rem", lineHeight: 1.85 }}>
              先按卷目顺读一遍，形成时间轴；再用「{track === "cn" ? "域外" : "华夏"}编年」走另一条线；最后到
              <a href={href("/compare")} style={{ color: "var(--color-vermilion)" }}> 对照视图 </a>
              看同期两边的差别。一次只走一条线，记时间锚点最有效。
            </p>
          </div>
        </aside>

        <div>
          {blocks.map(({ epoch, list, comparison }) => (
            <section className="epoch-block" key={epoch.id}>
              <div className="eb-head">
                <span className="lab">{epoch.label}</span>
                <h2>{epoch.name}</h2>
                <span className="sp">
                  {spanText(epoch.span.from, epoch.span.to)} · 共 {list.length} 条
                </span>
                <a className="more" href={href(`/epoch/${epoch.id}`)}>
                  展开本卷 →
                </a>
              </div>
              <p className="eb-line">{epoch.oneLiner}</p>

              <div className="eb-cards">
                {list.length ? (
                  list.map((e) => <EventCard key={e.id} event={e} />)
                ) : (
                  <div className="card">
                    <p className="sum">本卷尚未收录条目，正在修撰。</p>
                  </div>
                )}
              </div>

              {comparison ? (
                <div className="eb-confluence">
                  <span className="label">可选 · 跨轨对照</span>
                  <span className="ebc-body">
                    <span>
                      <b>{comparison.left.title}</b> VS <b>{comparison.right.title}</b>
                    </span>
                    <span className="ebc-verdict">只看对照时才把两条线并置，不干扰本路线的阅读顺序。</span>
                  </span>
                  <a href={href("/compare")}>去对照视图 →</a>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>

      <section className="wrap" style={{ paddingBlock: "var(--spacing-xl)" }}>
        <div className="eb-confluence" style={{ marginTop: 0, padding: "var(--spacing-lg)", justifyContent: "space-between" }}>
          <span>
            <b>本路线长卷：</b>把 {evs.length} 条事件按年代铺成一条单轨时间轴。
          </span>
          <a href={href(`/timeline/${track}`)}>展开{routeLabel(track)}长卷 →</a>
        </div>
      </section>
    </main>
  );
}
