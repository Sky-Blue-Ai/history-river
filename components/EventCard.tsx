import { href, spanText } from "@/lib/format";
import type { HEvent } from "@/lib/content";

export default function EventCard({ event, plate = true }: { event: HEvent; plate?: boolean }) {
  const figures = event.figures.slice(0, 4);
  return (
    <a className="card" data-track={event.track} href={href(`/event/${event.id}`)}>
      <div className="top">
        <span className="when">{spanText(event.start, event.end)}</span>
        <span className="badge">{event.track === "cn" ? "华夏轨" : "世界轨"}</span>
      </div>
      <h2>{event.title}</h2>
      {event.subtitle ? <div className="sub">{event.subtitle}</div> : null}
      {plate ? (
        <div className="plate" aria-hidden="true">
          <span className="glyph">{event.title.slice(0, 2)}</span>
          <span className="mark-note">图待补 · 文物图授权中</span>
        </div>
      ) : null}
      <p className="sum">{event.summary}</p>
      {figures.length > 0 ? (
        <div className="figures">
          {figures.map((f) => (
            <span key={f.name}>
              {f.name}
              {f.role ? ` · ${f.role}` : ""}
            </span>
          ))}
        </div>
      ) : null}
      <div className="foot">
        <span>
          {event.era ?? ""}
          {event.region ? ` · ${event.region}` : ""}
          {event.disputed ? " · 存异说" : ""}
        </span>
        <span className="go">入卷研读 →</span>
      </div>
    </a>
  );
}
