import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

function numberOrZero(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function compactNumber(n) {
  return numberOrZero(n).toLocaleString();
}

function DisasterDot({ type = "" }) {
  const t = String(type || "").toLowerCase();

  if (t.includes("flood")) {
    return <span className="h-3 w-3 rounded-full bg-primary shadow-sm" />;
  }

  if (t.includes("fire")) {
    return <span className="h-3 w-3 rounded-full bg-accent shadow-sm" />;
  }

  return <span className="h-3 w-3 rounded-full bg-textmuted/50 shadow-sm" />;
}

function SignalStat({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-muted/60 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-textmuted">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-textmain">{value}</div>
    </div>
  );
}

export default function LatestIncidentsPreview({ limit = 3 }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/incidents/public/latest`, {
          params: { limit },
        });

        const arr = Array.isArray(res.data) ? res.data : [];
        if (!alive) return;
        setIncidents(arr.slice(0, limit));
      } catch (e) {
        console.error(e);
        if (alive) setIncidents([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchIncidents();
    return () => {
      alive = false;
    };
  }, [limit]);

  const content = useMemo(() => {
    if (loading) return new Array(limit).fill(null);
    return incidents.slice(0, limit);
  }, [loading, incidents, limit]);

  return (
    <section className="bg-muted py-20">
      <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <div className="order-1 lg:pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
            Latest incident records
          </div>

          <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
            Recent disaster and emergency incidents
          </h2>

          <div className="mt-5 h-1 w-20 rounded-full bg-primary" />

          <p className="mt-8 max-w-md text-lg leading-relaxed text-textmuted">
            A quick view of recently published incident records across the platform.
            Use the full disaster map to explore location, severity, and broader national context.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/disaster-map"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
            >
              Explore disaster map
            </Link>
          </div>
        </div>

        <div className="order-2">
          <div className="rounded-[24px] border border-border bg-white p-3 md:p-4 shadow-[0_20px_55px_rgba(15,23,42,0.10)]">
            <div className="rounded-[18px] border border-border bg-surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-textmuted">
                    Recent incident feed
                  </span>
                </div>

                <Link
                  to="/disaster-map"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="divide-y divide-border">
                {content.map((incident, idx) => (
                  <motion.article
                    key={incident?._id || idx}
                    initial={{ opacity: 0, x: 18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.04 }}
                    viewport={{ once: true }}
                    className="px-4 py-4 md:px-5"
                  >
                    {!incident ? (
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="h-4 w-32 rounded bg-border/60" />
                          <div className="h-4 w-20 rounded bg-border/60" />
                        </div>
                        <div className="h-4 w-48 rounded bg-border/60" />
                        <div className="grid grid-cols-2 gap-3 sm:w-[240px]">
                          <div className="h-14 rounded-xl bg-border/60" />
                          <div className="h-14 rounded-xl bg-border/60" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <DisasterDot type={incident.disaster_type} />
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-textmuted">
                              {formatDate(incident.date || incident.createdAt)}
                            </span>
                          </div>

                          <h3 className="mt-2 text-base md:text-lg font-semibold text-textmain">
                            {titleCase(incident.disaster_type || "Incident")}
                          </h3>

                          <div className="mt-1 text-sm text-textmuted truncate">
                            {incident.state ? titleCase(incident.state) : "—"}
                            {incident.location ? ` • ${incident.location}` : ""}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 md:min-w-[260px]">
                          <div className="grid grid-cols-2 gap-3">
                            <SignalStat
                              label="Affected"
                              value={compactNumber(incident.affected_population)}
                            />
                            <SignalStat
                              label="Fatalities"
                              value={compactNumber(incident.fatalities)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Link
                              to={`/incidents/${incident._id}`}
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              View details
                            </Link>

                            <Link
                              to="/disaster-map"
                              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-textmain transition hover:bg-accent/20"
                            >
                              Map
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.article>
                ))}
              </div>
            </div>
          </div>

          {!loading && incidents.length === 0 && (
            <div className="mt-4 rounded-2xl border border-border bg-white p-8 text-center text-textmuted">
              No recent incident records available yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}