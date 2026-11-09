"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BASE, href } from "@/lib/format";

const TABS = [
  { path: "/overview", label: "总览分期" },
  { path: "/cn", label: "华夏编年" },
  { path: "/world", label: "域外编年" },
  { path: "/timeline", label: "编年长卷" },
  { path: "/archive", label: "典籍与故事" },
  { path: "/compare", label: "对照视图" },
  { path: "/sources", label: "馆藏通则" },
];

export default function SiteNav() {
  const raw = usePathname() || "/";
  const path = BASE && raw.startsWith(BASE) ? raw.slice(BASE.length) || "/" : raw;
  const [q, setQ] = useState("");
  const router = useRouter();

  const isActive = (tabPath: string) => {
    if (tabPath === "/archive") return path.startsWith("/archive") || path.startsWith("/event");
    if (tabPath === "/timeline") return path.startsWith("/timeline");
    if (tabPath === "/overview") return path.startsWith("/overview") || path.startsWith("/stage");
    if (tabPath === "/cn") return path === "/cn" || path.startsWith("/epoch/c");
    if (tabPath === "/world") return path === "/world" || path.startsWith("/epoch/w");
    return path.startsWith(tabPath);
  };

  return (
    <header className="site-header">
      <div className="wrap inner">
        <a className="brand" href={href("/")} aria-label="历策时空 首页">
          <span className="mark" aria-hidden="true">历</span>
          <span>
            <span className="name">历策时空</span>
            <span className="sub">中外通史编年研学馆</span>
          </span>
        </a>

        <nav className="nav" aria-label="主导航">
          {TABS.map((t) => (
            <a key={t.path} href={href(t.path)} aria-current={isActive(t.path) ? "page" : undefined}>
              {t.label}
            </a>
          ))}
        </nav>

        <div className="header-tools">
          <form
            className="searchbox"
            onSubmit={(ev) => {
              ev.preventDefault();
              router.push(`${href("/archive")}${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
            }}
            role="search"
          >
            <svg width="13" height="13" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13 13l4.5 4.5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <label className="visually-hidden" htmlFor="site-search" style={{ position: "absolute", left: "-9999px" }}>
              检索事件、人物、朝代
            </label>
            <input
              id="site-search"
              value={q}
              onChange={(ev) => setQ(ev.target.value)}
              placeholder="检索事件 / 人物 / 朝代"
              autoComplete="off"
            />
          </form>
          <span className="toggle" title="双轨对照：中国轨与世界轨并排显示">
            <i className="dot" aria-hidden="true" />
            双轨纪元对比
          </span>
          <span className="scribe">
            <span className="avatar" aria-hidden="true">翔</span>
            <span>修撰使</span>
          </span>
        </div>
      </div>
    </header>
  );
}
