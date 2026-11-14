import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import BackBar from "@/components/BackButton";
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
  icons: {
    icon: [
      { url: `${BASE}/icon.svg`, type: "image/svg+xml" },
      { url: `${BASE}/favicon.ico`, sizes: "48x48" },
      { url: `${BASE}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${BASE}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${BASE}/apple-icon.png`, sizes: "180x180", type: "image/png" }],
    shortcut: [`${BASE}/favicon.ico`],
  },
  manifest: `${BASE}/site.webmanifest`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteNav />
        <BackBar />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
