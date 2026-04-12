import { Suspense, lazy, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const IncidentMiniMap = lazy(() => import("../components/IncidentMiniMap"));

const titleCase = (s = "") =>
  String(s)
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) =>
      word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-")
    )
    .join(" ");

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toDateString();
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/60 px-5 py-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-textmuted">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-textmain">{value}</div>
    </div>
  );
}

function InfoPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/70 px-3 py-1 text-xs font-semibold text-textmain">
      {children}
    </span>
  );
}

export default function IncidentDetails() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchIncident = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/incidents/public/${id}`);
        if (!alive) return;
        setIncident(res.data);
      } catch (e) {
        console.error(e);
        if (alive) setIncident(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchIncident();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-background py-28">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-border bg-surface/80 p-8 shadow-sm backdrop-blur-[2px] md:p-10">
            <div className="h-8 w-2/3 rounded bg-border/60" />
            <div className="mt-6 h-4 w-1/2 rounded bg-border/60" />
            <div className="mt-10 h-[340px] rounded-2xl border border-border bg-muted" />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="h-24 rounded-2xl bg-border/60" />
              <div className="h-24 rounded-2xl bg-border/60" />
              <div className="h-24 rounded-2xl bg-border/60" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!incident) {
    return (
      <section className="relative overflow-hidden bg-background py-28">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-border bg-surface/80 p-10 shadow-sm backdrop-blur-[2px]">
            <h1 className="text-3xl font-semibold text-primary">Incident record not found</h1>
            <p className="mt-4 text-textmuted">
              This record may have been removed, archived, or is not publicly available.
            </p>
            <Link
              to="/disaster-map"
              className="mt-8 inline-flex items-center font-semibold text-secondary hover:underline"
            >
              Back to disaster map →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const stateLabel = incident.state ? titleCase(incident.state) : "—";
  const title = `${incident.disaster_type || "Incident"} Incident`;
  const subtitle = `${stateLabel} • ${formatDate(incident.date)}`;

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative overflow-hidden bg-primary text-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Public incident record
            </div>

            <h1 className="mt-5 text-4xl font-semibold md:text-5xl xl:text-6xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/85">{subtitle}</p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <InfoPill>{stateLabel}</InfoPill>
              <InfoPill>{String(incident.status || "published").toUpperCase()}</InfoPill>
              {incident.location && <InfoPill>{incident.location}</InfoPill>}
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden pt-8">
        <div className="mx-auto max-w-5xl px-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-textmain transition hover:bg-muted"
                >
                  Home
                </Link>
              </li>
              <li className="text-textmuted">/</li>
              <li>
                <Link
                  to="/disaster-map"
                  className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-textmain transition hover:bg-muted"
                >
                  Disaster Map
                </Link>
              </li>
              <li className="text-textmuted">/</li>
              <li className="text-textmuted">Incident Record</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-10 px-6 py-10">
        <div className="overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-sm backdrop-blur-[2px]">
          <div className="border-b border-border bg-muted/40 px-6 py-5">
            <h2 className="text-xl font-semibold text-textmain">Location overview</h2>
            <p className="mt-2 text-sm text-textmuted">
              Geographic view of the incident location based on the published record.
            </p>
          </div>

          <div className="p-6">
            <Suspense
              fallback={
                <div className="flex h-[340px] items-center justify-center rounded-2xl border border-border bg-muted text-textmuted">
                  Loading map…
                </div>
              }
            >
              <IncidentMiniMap
                lat={incident.latitude}
                lng={incident.longitude}
                title={incident.disaster_type}
                subtitle={stateLabel}
              />
            </Suspense>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric
            label="Affected population"
            value={(incident.affected_population ?? 0).toLocaleString()}
          />
          <Metric
            label="Fatalities"
            value={(incident.fatalities ?? 0).toLocaleString()}
          />
          <Metric
            label="Status"
            value={String(incident.status || "published").toUpperCase()}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-surface/80 p-6 shadow-sm backdrop-blur-[2px]">
            <h3 className="text-xl font-semibold text-textmain">Incident metadata</h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Metric label="State" value={stateLabel} />
              <Metric label="Date" value={formatDate(incident.date)} />
              <Metric label="Disaster type" value={incident.disaster_type || "—"} />
              <Metric label="Location" value={incident.location || "—"} />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface/80 p-6 shadow-sm backdrop-blur-[2px]">
            <h3 className="text-xl font-semibold text-textmain">Public note</h3>
            <p className="mt-4 leading-relaxed text-textmuted">
              This record is presented as part of CEDRAM’s public disaster information,
              research, and evidence support system. Figures shown are based on currently
              published data and may be updated as validation and review progress.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <InfoPill>Public incident record</InfoPill>
              <InfoPill>Operational awareness</InfoPill>
              <InfoPill>Evidence support</InfoPill>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface/80 p-8 shadow-sm backdrop-blur-[2px] md:p-10">
          <h2 className="text-2xl font-semibold text-textmain">Incident summary</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-textmuted">
            {incident.description || "No public summary is available for this incident record."}
          </p>

          {incident.response_actions && (
            <>
              <h3 className="mt-10 text-xl font-semibold text-textmain">Response actions</h3>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-textmuted">
                {incident.response_actions}
              </p>
            </>
          )}
        </div>

        {incident.attachments?.length > 0 && (
          <div className="rounded-3xl border border-border bg-surface/80 p-8 shadow-sm backdrop-blur-[2px]">
            <h2 className="text-2xl font-semibold text-textmain">Attachments</h2>
            <p className="mt-2 text-textmuted">
              Supporting files and reference materials linked to this published incident record.
            </p>

            <ul className="mt-6 space-y-3">
              {incident.attachments.map((url, i) => (
                <li key={url + i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/50 px-5 py-4 transition hover:bg-muted"
                  >
                    <span className="font-medium text-textmain">
                      Open attachment {i + 1}
                    </span>
                    <span className="font-semibold text-secondary">Open →</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Link
            to="/disaster-map"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 font-semibold text-white transition hover:bg-secondary"
          >
            Back to disaster map
          </Link>

          <Link
            to="/submit-report"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-8 py-3 font-semibold text-textmain transition hover:bg-muted"
          >
            Submit related report
          </Link>
        </div>
      </div>
    </section>
  );
}