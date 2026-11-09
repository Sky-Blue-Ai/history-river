import { href } from "@/lib/format";
import { stats } from "@/lib/content";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: "0.8rem" }}>
              <span className="mark" aria-hidden="true">历</span>
              <span>
                <span className="name">历策时空</span>
                <span className="sub">CHRONOS SYNCHRONOUS ATLAS</span>
              </span>
            </div>
            <p>
              以严谨考据与可追溯来源，中国史与世界史各走一条路线，需要时才把两条线并置对照。
              目前已收录 {stats.events} 条已核验事件（中国 {stats.cn} · 世界 {stats.world}）、
              {stats.comparisons} 组可选对照。
            </p>
          </div>
          <div>
            <h4>研学殿堂</h4>
            <ul>
              <li><a href={href("/timeline")}>华夏编年长卷</a></li>
              <li><a href={href("/timeline/world")}>域外编年长卷</a></li>
              <li><a href={href("/archive")}>典籍与故事索引</a></li>
              <li><a href={href("/sources")}>来源与口径说明</a></li>
            </ul>
          </div>
          <div>
            <h4>馆藏索引</h4>
            <ul>
              <li><a href={href("/epoch/c1")}>先秦：从良渚到战国</a></li>
              <li><a href={href("/epoch/c2")}>秦汉：大一统的定型</a></li>
              <li><a href={href("/epoch/w2")}>古典时代：希腊与罗马</a></li>
            </ul>
          </div>
          <div>
            <h4>版本</h4>
            <ul>
              <li>内容版本：v0.1（{stats.events} 条）</li>
              <li>时间范围：{stats.earliest < 0 ? `公元前 ${-stats.earliest}` : `公元 ${stats.earliest}`} — {stats.latest < 0 ? `公元前 ${-stats.latest}` : `公元 ${stats.latest}`}</li>
              <li>卷目：华夏 {stats.epochsCn} 卷 · 域外 {stats.epochsWorld} 卷</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} 历策时空 · 个人研学项目 · 内容依据公开史料与百科条目整理，逐条标注来源</span>
          <span>静态站 · 无账号 · 无追踪</span>
        </div>
      </div>
    </footer>
  );
}
