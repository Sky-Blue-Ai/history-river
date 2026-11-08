/**
 * 程序生成的水墨示意图（确定性：同一条 event id → 同一张图）
 * 不伪造历史图像：画面是抽象山川，角上标「示意图」。
 * 以后接入 CC0 文物图时，把 <Plate> 换成 <img> 即可，布局不变。
 */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Plate({
  id,
  title,
  track,
  className,
  height = 300,
}: {
  id: string;
  title: string;
  track: "cn" | "world";
  className?: string;
  height?: number;
}) {
  const r = rng(hash(id));
  const uid = `p${hash(id).toString(36)}`;
  const ink = track === "cn" ? "#7A2410" : "#161C24";
  const accent = track === "cn" ? "#AC3400" : "#B45309";

  // 三层山脊：每层 5 个控制点，用二次曲线连成起伏
  const ridge = (baseY: number, amp: number, n: number) => {
    const pts: string[] = [`M 0 ${height}`];
    for (let i = 0; i <= n; i += 1) {
      const x = (640 / n) * i;
      const y = baseY - amp * r() - (i % 2 === 0 ? amp * 0.4 : 0);
      if (i === 0) pts.push(`L 0 ${y.toFixed(1)}`);
      else {
        const px = (640 / n) * (i - 1);
        pts.push(`Q ${((px + x) / 2).toFixed(1)} ${(y - amp * 0.55).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
    }
    pts.push(`L 640 ${height} Z`);
    return pts.join(" ");
  };

  const far = ridge(height * 0.62, 46, 5);
  const mid = ridge(height * 0.76, 60, 6);
  const near = ridge(height * 0.9, 34, 4);
  const sunX = 90 + r() * 460;
  const sunY = 40 + r() * 60;
  const sunR = 16 + r() * 14;
  const waveY = height * 0.93;

  return (
    <svg
      className={className}
      viewBox={`0 0 640 ${height}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${title} · 水墨示意图`}
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${uid}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <linearGradient id={`${uid}-wash`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF8F5" stopOpacity="0" />
          <stop offset="100%" stopColor={ink} stopOpacity="0.14" />
        </linearGradient>
      </defs>

      <rect width="640" height={height} fill="#FCF2EB" />

      {/* 远山 */}
      <path d={far} fill={ink} opacity="0.10" />
      {/* 中景 */}
      <path d={mid} fill={ink} opacity="0.17" />
      {/* 前景 */}
      <path d={near} fill={ink} opacity="0.26" />
      {/* 山脚积墨 */}
      <rect y={height * 0.86} width="640" height={height * 0.14} fill={`url(#${uid}-wash)`} />

      {/* 日 / 月 */}
      <circle cx={sunX} cy={sunY} r={sunR} fill={accent} opacity="0.28" filter={`url(#${uid}-soft)`} />
      <circle cx={sunX} cy={sunY} r={sunR * 0.55} fill={accent} opacity="0.42" />

      {/* 云雾 */}
      <ellipse cx={sunX - 120} cy={height * 0.55} rx="150" ry="18" fill="#FFF8F5" opacity="0.75" filter={`url(#${uid}-soft)`} />
      <ellipse cx={sunX + 150} cy={height * 0.68} rx="120" ry="14" fill="#FFF8F5" opacity="0.6" filter={`url(#${uid}-soft)`} />

      {/* 水纹 */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${30 + i * 40} ${waveY + i * 6} q 22 -4 44 0 t 44 0 t 44 0 t 44 0`}
          fill="none"
          stroke={ink}
          strokeWidth="0.9"
          opacity={0.28 - i * 0.06}
        />
      ))}

      {/* 印章 */}
      <g transform={`translate(${640 - 74} ${height - 58})`} opacity="0.85">
        <rect width="46" height="46" fill="none" stroke={accent} strokeWidth="1.6" />
        <rect x="3.5" y="3.5" width="39" height="39" fill="none" stroke={accent} strokeWidth="0.6" opacity="0.7" />
        <text
          x="23"
          y="31"
          textAnchor="middle"
          fontSize="20"
          fontFamily="'Noto Serif SC', Songti SC, STSong, serif"
          fill={accent}
        >
          {title.slice(0, 1)}
        </text>
      </g>

      {/* 图注 */}
      <text x="16" y={height - 12} fontSize="9" letterSpacing="2" fill="#75777C" fontFamily="Inter, sans-serif">
        示意图 · 文物图授权中
      </text>

      {/* 纸纹 */}
      <rect width="640" height={height} filter={`url(#${uid}-grain)`} opacity="0.05" style={{ mixBlendMode: "multiply" }} />
    </svg>
  );
}
