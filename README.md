# 历策时空 · 中外双轨平行编年史

把**中国史**与**世界史**并排放在同一条时间轴上的学习站：不是各背一遍，而是随时知道「这件事发生时，另一边在发生什么」。

线上地址：<https://sky-blue-ai.github.io/history-river/>（GitHub Pages，静态导出）

## 现状（v0.1 首期）

| 项 | 值 |
|---|---|
| 事件条目 | 27 条（华夏 14 · 世界 13），全部 `verified` |
| 时间范围 | 公元前 3300 — 公元 1912 |
| 纪元卷目 | 7 卷 |
| 双轨对照矩阵 | 3 组（汉 vs 罗马、唐 vs 阿拔斯、明清 vs 欧洲） |
| 页面 | 首页 / 编年长卷 / 索引 / 纪元页（含四维矩阵）/ 事件详情 / 来源说明 = 40 页 |
| 图片 | 占位纹样（文物图授权中，见「待办」） |

下一期：补到 120 条（P1 前 3000—1911）→ 太史考课台（练习/考课）→ 文物图与地图。

## 怎么跑

```bash
npm install
python3 tools/gen_tokens.py        # 令牌 → app/tokens.css（prebuild 自动跑）
python3 tools/export_content.py    # 门禁导出 → app/data/content.json（prebuild 自动跑）
npm run build                      # 静态导出到 out/
./scripts/serve-web.sh start 8099  # http://127.0.0.1:8099
```

子路径部署（GitHub Pages）时构建要带前缀：

```bash
NEXT_PUBLIC_BASE_PATH=/history-river npm run build
```

## 目录

```
content/design/tokens.json    设计令牌单一事实源（改设计只改这里）
content/epochs.json           纪元卷目
content/events/e*.json        事件条目（按纪元分文件）
content/comparisons.json      双轨四维对照矩阵
tools/gen_tokens.py           令牌生成器（--check 校验漂移）
tools/check_content.py        内容门禁校验
tools/export_content.py       门禁视图 → app/data/content.json（前端唯一入口）
app/                          页面（App Router，静态导出）
preview/tokens.html           令牌可视化核对页（浏览器直接打开）
```

## 内容门禁（这是这套东西的关键，别绕开）

`tools/check_content.py` 校验：id 唯一、track 合法、年份为整数且 start ≤ end、无公元 0 年、对照关系**双向**、至少一个可点来源、四段正文齐全、中文里混入英文单词给警告。

`tools/export_content.py` 只导出 `verified: true` 的条目，并且：

- 导出结果为 0 条 → **拒绝产出**，退出码 2
- 已核验条目比上一次产物少 20% 以上 → **拒绝覆盖**（防误删）

所以「未核验内容出现在页面上」在技术上不成立。

## 加一条内容

1. 在 `content/events/e<N>.json` 的 `events` 数组里加一个对象（字段照抄现有条目）
2. 若写了 `counterparts`，被指向的条目也要反向写上本条 id，否则门禁报错
3. 跑 `python3 tools/export_content.py`，过了再 `npm run build`
4. 有争议的说法在 `impact` 里并列标注，并把 `disputed` 置 true（来源页会自动列出）

## 数据字段

```jsonc
{
  "id": "cn-silkroad",            // 稳定 id，别改（页面链接依赖它）
  "track": "cn",                  // cn | world
  "epochId": "e3",
  "start": -138, "end": -126,     // 负数=公元前；end 可省略
  "title": "张骞凿空西域",
  "subtitle": "一条商路被政治打开",
  "era": "西汉 · 汉武帝", "region": "河西走廊至中亚",
  "themes": ["商路", "征伐"],
  "summary": "…", "background": "…", "course": "…", "impact": "…",
  "figures": [{ "name": "张骞", "role": "博望侯" }],
  "counterparts": ["world-rome-principate"],   // 必须双向
  "sources": [{ "title": "张骞", "url": "https://…", "publisher": "维基百科" }],
  "verified": true, "disputed": false
}
```

## 待办

- [ ] 内容补到 120 条（P1：前 3000 — 1911，每世纪至少 1 条）
- [ ] 文物图：CC0 公有领域（Met / Wikimedia），逐条署名与授权信息
- [ ] 太史考课台：时间排序练习 + 卡片复习，进度存 localStorage
- [ ] 双轨对照矩阵补到 7 组（每纪元一组）
- [ ] 移动端长卷的横轴视图（当前窄屏为单列堆叠）

## 口径

以中国大陆通行教材与通史口径为主；涉学界分歧并列多源并标「存异说」；地理用历史地理范围，不以后世国界倒推古代疆域。详见站内 `/sources`。
