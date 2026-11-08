import EventCard from "@/components/EventCard";
import { comparisons, epochs, events, eventsByTrack, stats, themeCounts } from "@/lib/content";
import { href, shortYear, spanText } from "@/lib/format";

export default function HomePage() {
  const themes = themeCounts();
  const cnTop = eventsByTrack("cn")
    .slice()
    .sort((a, b) => b.start - a.start)
    .slice(0, 3);
  const worldTop = eventsByTrack("world")
    .slice()
    .sort((a, b) => b.start - a.start)
    .slice(0, 3);
  const latestEpoch = epochs[epochs.length - 1];

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

        {/* 双轨主区 */}
        <section className="tracks">
          <div className="track-cn">
            <div className="track-head">
              <span className="t">
                <i aria-hidden="true" />
                华夏纪元轨
              </span>
              <span className="s">正朔传续 · {stats.cn} 条</span>
            </div>
            {cnTop.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
            <a className="btn ghost" href={href("/archive?track=cn")}>
              全部 {stats.cn} 条华夏纪事 →
            </a>
          </div>

          <div className="track-world">
            <div className="track-head">
              <span className="t">
                <i aria-hidden="true" />
                域外诸邦与全球文明
              </span>
              <span className="s">并轨对照 · {stats.world} 条</span>
            </div>
            {worldTop.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
            <a className="btn ghost" href={href("/archive?track=world")}>
              全部 {stats.world} 条域外纪事 →
            </a>
          </div>
        </section>
      </div>

      {/* 时空交汇点 */}
      <section className="wrap confluence">
        <div className="head">
          <h2>时空交错交汇点</h2>
          <a className="btn ghost" href={href("/timeline")}>
            展开双轨编年长卷
          </a>
        </div>
        {comparisons.map((c) => {
          const ep = epochs.find((e) => e.id === c.epochId);
          return (
            <div className="conf-item" key={c.epochId}>
              <div className="vs">
                {ep?.label}
                <br />
                {ep ? spanText(ep.cnSpan.from, ep.cnSpan.to) : ""}
              </div>
              <div>
                <div className="pair">
                  {c.left.title}
                  <em>VS</em>
                  {c.right.title}
                </div>
                <p className="txt" style={{ marginTop: "0.35rem" }}>
                  {c.verdict}
                </p>
              </div>
              <a className="btn" href={href(`/epoch/${c.epochId}#matrix`)}>
                看四维对照 →
              </a>
            </div>
          );
        })}
        {comparisons.length === 0 ? (
          <p className="txt">对照矩阵正在修撰，暂未合卷。</p>
        ) : null}
      </section>

      {/* 最新收录 */}
      <section className="wrap" style={{ paddingBlock: "var(--spacing-xl) 0" }}>
        <div className="head" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem" }}>
          <h2 style={{ fontSize: "var(--text-headline-lg)" }}>新入卷册</h2>
          <a className="btn ghost" href={href("/archive")}>
            查看全部 {events.length} 条 →
          </a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(17rem, 1fr))", gap: "var(--spacing-gutter)", marginTop: "var(--spacing-md)" }}>
          {events
            .slice()
            .sort((a, b) => b.start - a.start)
            .slice(0, 4)
            .map((e) => (
              <EventCard key={e.id} event={e} plate={false} />
            ))}
        </div>
      </section>
    </main>
  );
}
