import Plate from "@/components/Plate";
import { href, spanText } from "@/lib/format";
import type { HEvent } from "@/lib/content";

export default function EventCard({ event, plate = true }: { event: HEvent; plate?: boolean }) {
  const figures = event.figures.slice(0, 4);

  return (
    <a className="card" data-track={event.track} href={href(`/event/${event.id}`)}>
      <div className="top">
        <span className="when">{spanText(event.start, event.end)}</span>
        <span className="top-right">
          <span className="badge">{event.track === "cn" ? "华夏轨" : "世界轨"}</span>
          <svg className="mark" width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
            <path d="M2 1.2h10v13.2L7 11.4 2 14.4z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <h2>{event.title}</h2>
      {event.subtitle ? <div className="sub">{event.subtitle}</div> : null}

      {plate ? (
        <figure className="plate-wrap">
          <Plate id={event.id} title={event.title} track={event.track} />
          <figcaption>{event.subtitle ? `${event.subtitle} · 图卷` : `${event.title} · 图卷`}</figcaption>
        </figure>
      ) : null}

      <p className="sum">{event.summary}</p>

      <div className="figures">
        <span className="fig-label">风云人物列传</span>
        {figures.length > 0 ? (
          figures.map((f) => (
            <span key={f.name}>
              {f.name}
              {f.role ? ` · ${f.role}` : ""}
            </span>
          ))
        ) : (
          <span>史载未详</span>
        )}
      </div>

      <div className="foot">
        <span className="go">入卷研读 →</span>
        <span className="go ghost">考课 · 下一期</span>
      </div>
    </a>
  );
}
