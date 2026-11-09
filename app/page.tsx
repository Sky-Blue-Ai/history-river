import { routes, stages, stats, eventsOfTrack } from "@/lib/content";
import { href, shortYear, spanText } from "@/lib/format";

export default function HomePage() {
  const cn = eventsOfTrack("cn");
  const world = eventsOfTrack("world");

  const routeCards = [
    {
      track: "cn" as const,
      eyebrow: "ROUTE I · CHRONOS SINICA",
      title: "华夏编年",
      sub: "中国史 · 从良渚到辛亥",
      count: cn.length,
      span: cn.length ? `${shortYear(Math.min(...cn.map((e) => e.start)))} — ${shortYear(Math.max(...cn.map((e) => e.end ?? e.start)))}` : "待补",
      epochs: routes.cn.epochs,
      note: "朝代与制度为骨，按时间顺读。路线内不出现世界史条目。",
    },
    {
      track: "world" as const,
      eyebrow: "ROUTE II · CHRONOS ORBIS",
      title: "域外编年",
      sub: "世界史 · 地中海、两河与欧亚大陆",
      count: world.length,
      span: world.length ? `${shortYear(Math.min(...world.map((e) => e.start)))} — ${shortYear(Math.max(...world.map((e) => e.end ?? e.start)))}` : "待补",
      epochs: routes.world.epochs,
      note: "时期与文明为骨，按时间顺读。路线内不出现中国史条目。",
    },
  ];

  return (
    <main>
      <section className="wrap hero">
        <div>
          <div className="eyebrow">CHRONOS ATLAS · TWO ROUTES</div>
          <h1>
            两条路线
            <br />
            各走一遍
          </h1>
          <p className="lede">
            中国史一条线，世界史一条线，<b>各自独立成卷、互不混排</b>。
            先把一条线走通，再去「对照视图」看同期两边各自发生了什么——
            比较是第二步，不是阅读方式。
          </p>
        </div>

        <div className="stat-panel">
          <div className="row">
            <span className="k">华夏编年</span>
            <span className="v">
              {stats.cn} <small>条 · {stats.epochsCn} 卷</small>
            </span>
          </div>
          <div className="row">
            <span className="k">域外编年</span>
            <span className="v">
              {stats.world} <small>条 · {stats.epochsWorld} 卷</small>
            </span>
          </div>
          <div className="row">
            <span className="k">对照视图</span>
            <span className="v">
              {stats.comparisons} <small>组（可选）</small>
            </span>
          </div>
          <div className="row">
            <span className="k">时间覆盖</span>
            <span className="v">
              {shortYear(stats.earliest)} — {shortYear(stats.latest)}
            </span>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBlock: "var(--spacing-xl) 0" }}>
        <div className="eb-head">
          <span className="lab">骨干</span>
          <h2 style={{ fontSize: "var(--text-headline-lg)" }}>六个阶段：两条路线共用的时间骨架</h2>
          <a className="more" href={href("/overview")}>
            总览分期与书单 →
          </a>
        </div>
        <div className="spine">
          {stages.map((st) => (
            <a className="spine-item" key={st.id} href={href(`/stage/${st.id}`)}>
              <span className="n">{st.label}</span>
              <span className="t">{st.name}</span>
              <span className="y">{spanText(st.span.from, st.span.to)}</span>
            </a>
          ))}
        </div>
      </section>

      <div className="wrap" style={{ paddingBlock: "var(--spacing-xl) var(--spacing-2xl)" }}>
        <div className="route-cards">
          {routeCards.map((r) => (
            <a className="route-card" data-track={r.track} key={r.track} href={href(`/${r.track}`)}>
              <div className="rc-top">
                <span className="eyebrow-sm">{r.eyebrow}</span>
                <span className="badge">{r.count} 条</span>
              </div>
              <h2>{r.title}</h2>
              <p className="rc-sub">{r.sub}</p>
              <p className="rc-note">{r.note}</p>

              <ol className="rc-epochs">
                {r.epochs.map((ep) => (
                  <li key={ep.id}>
                    <span className="n">{ep.label}</span>
                    <span className="t">{ep.name}</span>
                    <span className="y">{spanText(ep.span.from, ep.span.to)}</span>
                  </li>
                ))}
              </ol>

              <div className="rc-foot">
                <span>{r.span}</span>
                <span className="go">进入{r.title} →</span>
              </div>
            </a>
          ))}
        </div>

        <div className="eb-confluence" style={{ marginTop: "var(--spacing-lg)", padding: "var(--spacing-lg)" }}>
          <span className="label">可选</span>
          <span className="ebc-body">
            <span>
              <b>对照视图</b>：把两条线在少数节点上并置，四维对照（政体 / 经济 / 思想 / 军事）。
            </span>
            <span className="ebc-verdict">只在你想比较的时候进入，不作为默认阅读方式。</span>
          </span>
          <a href={href("/compare")}>去对照视图 →</a>
        </div>
      </div>
    </main>
  );
}
