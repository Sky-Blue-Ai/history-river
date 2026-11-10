"use client";

import { usePathname, useRouter } from "next/navigation";
import { BASE, href } from "@/lib/format";

/** 二级/三级页的返回条：先浏览器后退，无历史则回上一级 */
export default function BackBar() {
  const raw = usePathname() || "/";
  const path = BASE && raw.startsWith(BASE) ? raw.slice(BASE.length) || "/" : raw;
  const router = useRouter();

  if (path === "/") return null;

  const parent = (() => {
    if (path.startsWith("/event/")) return { href: "/archive", label: "典籍与故事" };
    if (path.startsWith("/epoch/")) {
      const id = path.split("/")[2] || "";
      return id.startsWith("w")
        ? { href: "/world", label: "域外编年" }
        : { href: "/cn", label: "华夏编年" };
    }
    if (path.startsWith("/stage/")) return { href: "/overview", label: "总览分期" };
    if (path.startsWith("/timeline/")) return { href: "/timeline", label: "编年长卷" };
    if (path.startsWith("/archive")) return { href: "/", label: "两条路线" };
    if (path.startsWith("/compare")) return { href: "/", label: "两条路线" };
    if (path.startsWith("/sources")) return { href: "/", label: "两条路线" };
    if (path.startsWith("/overview")) return { href: "/", label: "两条路线" };
    return { href: "/", label: "两条路线" };
  })();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(href(parent.href));
  };

  return (
    <div className="backbar">
      <div className="wrap backbar-inner">
        <button type="button" className="back-btn" onClick={goBack} aria-label="返回上一页">
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M9.5 2.5 4 8l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          返回
        </button>
        <span className="back-sep" aria-hidden="true">/</span>
        <a className="back-parent" href={href(parent.href)}>
          上一级：{parent.label}
        </a>
      </div>
    </div>
  );
}
