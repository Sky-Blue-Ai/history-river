import RouteHome from "@/components/RouteHome";

export const metadata = {
  title: "域外编年 · 世界史",
  description: "世界史单轨编年：从金字塔到工业帝国，按时期顺读，不与中国史混排。",
};

export default function WorldRoutePage() {
  return <RouteHome track="world" />;
}
