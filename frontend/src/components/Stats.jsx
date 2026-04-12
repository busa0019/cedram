import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StatIcon({ kind }) {
  const cls = "h-8 w-8";
  switch (kind) {
    case "incidents":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2 2 7l10 5 10-5-10-5Z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case "states":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-6-4.35-6-10a6 6 0 0 1 12 0c0 5.65-6 10-6 10Z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
      );
    case "affected":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21a8 8 0 1 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "fatalities":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s7-4 7-11c0-4-2-7-5-9 0 3-2 4-2 6 0-2-2-3-4-5C5 6 5 9 5 11c0 7 7 11 7 11Z" />
        </svg>
      );
    default:
      return null;
  }
}

function StatCard({ item, yearsOfCoverage, loading }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface px-6 py-8 md:px-8 md:py-10 shadow-sm text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-border bg-muted text-primary shadow-sm">
        <StatIcon kind={item.kind} />
      </div>

      <div className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-primary">
        {loading ? "—" : Number(item.value || 0).toLocaleString()}
      </div>

      <div className="mt-2 text-xl md:text-2xl font-semibold text-textmain">
        {item.label}
      </div>

      <div className="mt-4 text-xs text-textmuted">
        Coverage: {loading ? "—" : `${yearsOfCoverage} year(s)`}
      </div>
    </div>
  );
}

export default function Stats() {
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [page, setPage] = useState(0);

  const [stats, setStats] = useState({
    totalIncidents: 0,
    statesCovered: 0,
    totalAffected: 0,
    totalFatalities: 0,
    yearsOfCoverage: 0,
  });

  useEffect(() => {
    let alive = true;

    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/incidents/public/summary`);
        if (!alive) return;

        setStats({
          totalIncidents: res.data.totalIncidents || 0,
          statesCovered: res.data.statesCovered || 0,
          totalAffected: res.data.totalAffected || 0,
          totalFatalities: res.data.totalFatalities || 0,
          yearsOfCoverage: res.data.yearsOfCoverage || 0,
        });

        setLastUpdated(res.data.lastUpdatedAt ? new Date(res.data.lastUpdatedAt) : new Date());
        setLoading(false);
      } catch (error) {
        console.error(error);
        if (alive) setLoading(false);
      }
    };

    fetchSummary();
    const interval = setInterval(fetchSummary, 60_000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const items = useMemo(
    () => [
      {
        key: "totalIncidents",
        label: "Incidents Recorded",
        value: stats.totalIncidents,
        kind: "incidents",
      },
      {
        key: "statesCovered",
        label: "States Covered",
        value: stats.statesCovered,
        kind: "states",
      },
      {
        key: "totalAffected",
        label: "People Affected",
        value: stats.totalAffected,
        kind: "affected",
      },
      {
        key: "totalFatalities",
        label: "Reported Fatalities",
        value: stats.totalFatalities,
        kind: "fatalities",
      },
    ],
    [stats]
  );

  const pages = useMemo(() => {
    if (items.length <= 3) return [items];
    return [
      items.slice(0, 3),
      items.slice(1, 4),
      [items[2], items[3], items[0]],
      [items[3], items[0], items[1]],
    ];
  }, [items]);

  useEffect(() => {
    if (reduceMotion || pages.length <= 1) return;
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % pages.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [pages.length, reduceMotion]);

  const activeDesktopSet = pages[page];
  const activeMobileItem = items[page % items.length];

  return (
    <section className="bg-surface py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
            National overview
          </div>

          <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight text-primary">
            Disaster risk data at a glance
          </h2>

          <p className="mt-4 max-w-3xl mx-auto text-lg leading-relaxed text-textmuted">
            A high-level snapshot of recorded incidents, geographic coverage, affected populations,
            and reported fatalities to support awareness, research, planning, and informed action.
          </p>

          {lastUpdated && (
            <p className="mt-3 text-xs text-textmuted">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        <div className="mt-12 rounded-[32px] border border-border bg-white p-6 md:p-8 lg:p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="block lg:hidden">
            <div className="rounded-[28px] bg-muted/50 px-4 py-6 shadow-inner">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMobileItem.key}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.4 }}
                >
                  <StatCard
                    item={activeMobileItem}
                    yearsOfCoverage={stats.yearsOfCoverage}
                    loading={loading}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-[28px] bg-muted/50 p-6 shadow-inner">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`desktop-${page}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-3 gap-6"
                >
                  {activeDesktopSet.map((item) => (
                    <StatCard
                      key={item.key}
                      item={item}
                      yearsOfCoverage={stats.yearsOfCoverage}
                      loading={loading}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={`rounded-full transition ${
                  i === page ? "h-4 w-4 bg-primary" : "h-3 w-3 bg-border hover:bg-primary/40"
                }`}
                aria-label={`Go to stats slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}