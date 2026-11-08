import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { BASE } from "@/lib/format";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "历策时空 · 中外千载双轨平行编年史策",
    template: "%s · 历策时空",
  },
  description:
    "把中国史与世界史放在同一条时间轴上的学习站：同一时期，另一边在发生什么。以故事为经，以年代为纬。",
  metadataBase: new URL("https://sky-blue-ai.github.io"),
  alternates: { canonical: BASE || "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
