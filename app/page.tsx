import EventCard from "@/components/EventCard";
import { comparisons, epochs, events, stats, themeCounts } from "@/lib/content";
import { href, shortYear, spanText } from "@/lib/format";

export default function HomePage() {
  const themes = themeCounts();
  const latestEpoch = epochs[epochs.length - 1];

  /** 每个纪元取双轨各 1 条代表事件 + 该纪元的对照矩阵 */
  const blocks = epochs.map((ep) => {
    const evs = events.filter((e) => e.epochId === ep.id).sort((a, b) => a.start - b.start);
    return {
      epoch: ep,
      cn: evs.find((e) => e.track === "cn"),
      world: evs.find((e) => e.track === "world"),
      comparison: comparisons.find((c) => c.epochId === ep.id),
      total: evs.length,
    };
  });

  return (
    <main>
      {/* Hero */}
      <section className="wrap hero">
        <div>
          <div className="eyebrow">CHRONOS SYNCHRONOUS ATLAS · VOL. I</div>
          <h1>
            中外千载
            <br />
            双轨平行编年史策
          </h1>
          <p className="lede">
            以故事为经，以年代为纬。同一时期，两条轨道并排铺开：
            <b>华夏王朝的风雷变迁</b>，与<b>地中海、两河与欧亚大陆的域外文明</b>。
            这里不问你记住了多少年代，只让你随时知道——这件事发生时，另一边正在发生什么。
          </p>
        </div>

        <div className="stat-panel">
          <div className="row">
            <span className="k">当前时空跨度</span>
            <span className="v">
              {shortYear(stats.earliest)} — {shortYear(stats.latest)}
            </span>
          </div>
          <div className="row">
            <span className="k">已收录事件</span>
            <span className="v">
              {stats.events} <small>条（中国 {stats.cn} · 世界 {stats.world}）</small>
            </span>
          </div>
          <div className="row">
            <span className="k">双轨对照矩阵</span>
            <span className="v">
              {stats.comparisons} <small>组</small>
            </span>
          </div>
          <div className="row">
            <span className="k">纪元卷目</span>
            <span className="v">
              {stats.epochs} <small>卷 · 至 {latestEpoch.name}</small>
            </span>
          </div>
        </div>
      </section>

      {/* 纪元条 */}
      <nav className="wrap" aria-label="纪元">
        <div className="epochs">
          {epochs.map((ep) => (
            <a className="epoch" key={ep.id} href={href(`/epoch/${ep.id}`)}>
              <div className="lab">{ep.label}</div>
              <div className="nm">{ep.name}</div>
              <div className="sp">
                {spanText(ep.cnSpan.from, ep.cnSpan.to)} · 华夏
              </div>
            </a>
          ))}
        </div>
      </nav>

      <div className="wrap layout">
        {/* 左栏 */}
        <aside className="rail">
          <div className="panel">
            <h3>文明分野</h3>
            <div className="hint">双轨分布 · 数据实时统计</div>
            <ul className="civ-list">
              <li data-track="cn">
                <span>华夏诸夏文明圈</span>
                <span className="tag">主轨 · {stats.cn}</span>
              </li>
              <li data-track="world">
                <span>地中海与欧亚诸文明</span>
                <span className="tag">并轨 · {stats.world}</span>
              </li>
              <li>
                <span>待补：南亚 · 非洲 · 美洲</span>
                <span className="tag">待选</span>
              </li>
            </ul>
          </div>

          <div className="panel">
            <h3>史学透镜</h3>
            <div className="hint">按主题切分 · 共 {themes.length} 类</div>
            <div className="lens">
              {themes.map((t) => (
                <a key={t.theme} href={href(`/archive?theme=${encodeURIComponent(t.theme)}`)}>
                  {t.theme}
                  <span className="n">{t.count}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3>本卷学履</h3>
            <div className="hint">进度记录存本地，不上传</div>
            <div className="progress-line" aria-hidden="true">
              <i style={{ width: "0%" }} />
            </div>
            <div className="progress-meta">
              <span>尚未开卷</span>
              <span>0 / {stats.events} 条</span>
            </div>
            <p style={{ marginTop: "0.8rem", fontSize: "var(--text-body-sm)", color: "var(--color-ink-muted)" }}>
              本期只做「读」：没有账号、没有答题记录。考课台在下一期开放。
            </p>
          </div>
        </aside>

        {/* 主区：按纪元分组，每组双轨各一张大卡 */}
        <div>
          {blocks.map(({ epoch, cn, world, comparison, total }) => (
            <section className="epoch-block" key={epoch.id}>
              <div className="eb-head">
                <span className="lab">{epoch.label}</span>
                <h2>{epoch.name}</h2>
                <span className="sp">
                  {spanText(epoch.cnSpan.from, epoch.cnSpan.to)} · 共 {total} 条
                </span>
                <a className="more" href={href(`/epoch/${epoch.id}`)}>
                  展开本卷 {total} 条 →
                </a>
              </div>
              <p className="eb-line">{epoch.oneLiner}</p>

              <div className="eb-cards">
                {cn ? <EventCard event={cn} /> : <div className="card" data-track="cn"><p className="sum">本卷华夏轨待补。</p></div>}
                {world ? <EventCard event={world} /> : <div className="card" data-track="world"><p className="sum">本卷世界轨待补。</p></div>}
              </div>

              {comparison ? (
                <div className="eb-confluence">
                  <span className="label">时空交汇点</span>
                  <span className="ebc-body">
                    <span>
                      <b>{comparison.left.title}</b> VS <b>{comparison.right.title}</b>
                    </span>
                    <span className="ebc-verdict">{comparison.verdict}</span>
                  </span>
                  <a href={href(`/epoch/${epoch.id}#matrix`)}>看四维对照 →</a>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>

      {/* 收束：长卷入口 */}
      <section className="wrap" style={{ paddingBlock: "var(--spacing-xl)" }}>
        <div
          className="eb-confluence"
          style={{ marginTop: 0, padding: "var(--spacing-lg)", justifyContent: "space-between" }}
        >
          <span>
            <b>横向阅读：</b>把 {stats.events} 条事件按年代铺成一条长卷，左华夏、右域外，同代并置。
          </span>
          <a href={href("/timeline")}>展开双轨编年长卷 →</a>
        </div>
      </section>
    </main>
  );
}
