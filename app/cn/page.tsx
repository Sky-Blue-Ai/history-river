import RouteHome from "@/components/RouteHome";

export const metadata = {
  title: "华夏编年 · 中国史",
  description: "中国史单轨编年：从良渚到辛亥，按朝代与制度顺读，不与其他文明混排。",
};

export default function CnRoutePage() {
  return <RouteHome track="cn" />;
}
