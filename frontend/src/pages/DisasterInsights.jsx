import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const BRAND = {
  primary: "#345299",
  secondary: "#2E6AE6",
  accent: "#EED44F",
};

const PIE_COLORS = [
  BRAND.primary,
  BRAND.secondary,
  "#009E73",
  "#D55E00",
  "#CC79A7",
  "#56B4E9",
  "#E69F00",
];

function nfmt(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toLocaleString() : "—";
}

function titleCase(s = "") {
  return String(s)
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function shortLabel(value = "", max = 12) {
  const str = String(value || "");
  if (str.length <= max) return str;
  return `${str.slice(0, max)}…`;
}

function KpiCard({ label, value, icon, tone = "blue" }) {
  const toneCls =
    tone === "accent"
      ? "bg-accent text-accenttext border-black/10"
      : tone === "muted"
      ? "bg-muted text-textmain border-border"
      : "bg-primary text-white border-white/10";

  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${toneCls}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-3xl font-semibold">{value}</div>
          <div
            className={`mt-1 text-sm font-semibold ${
              tone === "blue" ? "text-white/80" : "text-textmuted"
            }`}
          >
            {label}
          </div>
        </div>

        <div
          className={[
            "flex h-12 w-12 items-center justify-center rounded-2xl border",
            tone === "blue" ? "border-white/15 bg-white/10" : "border-border bg-surface",
          ].join(" ")}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function CardShell({ title, subtitle, right, children }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface/85 shadow-sm backdrop-blur-[2px]">
      <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-start md:justify-between md:p-7">
        <div>
          <h2 className="text-lg font-semibold text-textmain md:text-xl">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-textmuted">{subtitle}</p> : null}
        </div>
        {right}
      </div>

      <div className="p-6 md:p-7">{children}</div>
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-primary md:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-3xl text-textmuted">{subtitle}</p> : null}
    </div>
  );
}

function Segmented({ value, onChange, options = [] }) {
  return (
    <div className="inline-flex overflow-hidden rounded-2xl border border-border bg-muted">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "px-4 py-2 text-xs font-semibold transition sm:text-sm",
              active ? "bg-primary text-white" : "text-textmain hover:bg-surface",
            ].join(" ")}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function InsightNote({ children }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/55 px-5 py-4 text-sm leading-relaxed text-textmuted">
      {children}
    </div>
  );
}

function ChartEmptyState({ message }) {
  return (
    <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/35 px-6 text-center text-sm text-textmuted">
      {message}
    </div>
  );
}

function ChartSkeleton({ height = "h-[320px]" }) {
  return (
    <div className={`w-full animate-pulse rounded-2xl border border-border bg-muted/35 p-5 ${height}`}>
      <div className="flex h-full items-end justify-between gap-3">
        <div className="h-[45%] w-8 rounded-t-lg bg-border/60" />
        <div className="h-[60%] w-8 rounded-t-lg bg-border/60" />
        <div className="h-[30%] w-8 rounded-t-lg bg-border/60" />
        <div className="h-[72%] w-8 rounded-t-lg bg-border/60" />
        <div className="h-[52%] w-8 rounded-t-lg bg-border/60" />
        <div className="h-[78%] w-8 rounded-t-lg bg-border/60" />
        <div className="h-[40%] w-8 rounded-t-lg bg-border/60" />
      </div>
    </div>
  );
}

function ExportButton({ filename, data }) {
  const handleExport = () => {
    if (!Array.isArray(data) || data.length === 0) return;

    const keys = Array.from(
      data.reduce((set, row) => {
        Object.keys(row || {}).forEach((k) => set.add(k));
        return set;
      }, new Set())
    );

    const escapeCell = (value) => {
      const str = value == null ? "" : String(value);
      if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const csv = [
      keys.join(","),
      ...data.map((row) => keys.map((k) => escapeCell(row?.[k])).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={!Array.isArray(data) || data.length === 0}
      className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-textmain transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      Export CSV
    </button>
  );
}

function CustomTooltip({ active, payload, label, formatterLabel }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
      {label !== undefined && label !== null ? (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-textmuted">
          {formatterLabel ? formatterLabel(label) : label}
        </div>
      ) : null}

      <div className="space-y-1.5">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color || BRAND.primary }}
              />
              <span className="text-textmuted">{entry.name}</span>
            </div>
            <span className="font-semibold text-textmain">{nfmt(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FadeInSection({ children, delay = 0 }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 4.6 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-6-4.35-6-10a6 6 0 0 1 12 0c0 5.65-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M14 8h6v6" />
    </svg>
  );
}

export default function DisasterInsights() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [yearData, setYearData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [metric, setMetric] = useState("incidents");
  const [stateData, setStateData] = useState([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let alive = true;

    async function loadBase() {
      setLoading(true);
      try {
        const reqs = await Promise.allSettled([
          axios.get(`${API_URL}/api/analytics/public/summary`),
          axios.get(`${API_URL}/api/analytics/public/incidents-by-year`),
          axios.get(`${API_URL}/api/analytics/public/disaster-types`),
        ]);

        if (!alive) return;

        const sRes = reqs[0];
        const yRes = reqs[1];
        const tRes = reqs[2];

        if (sRes.status === "fulfilled") setSummary(sRes.value.data || null);
        if (yRes.status === "fulfilled")
          setYearData(Array.isArray(yRes.value.data) ? yRes.value.data : []);
        if (tRes.status === "fulfilled")
          setTypeData(Array.isArray(tRes.value.data) ? tRes.value.data : []);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setSummary(null);
        setYearData([]);
        setTypeData([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadBase();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadStates() {
      try {
        const res = await axios.get(`${API_URL}/api/analytics/public/most-affected-states`, {
          params: { metric, limit: 10 },
        });

        const arr = Array.isArray(res.data) ? res.data : [];
        if (!alive) return;
        setStateData(arr);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setStateData([]);
      }
    }

    loadStates();
    return () => {
      alive = false;
    };
  }, [metric]);

  const lastUpdatedLabel = useMemo(() => {
    const d = summary?.lastUpdatedAt;
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toLocaleString();
  }, [summary?.lastUpdatedAt]);

  const metricLabel = useMemo(() => {
    if (metric === "affected") return "Affected population";
    if (metric === "fatalities") return "Fatalities";
    return "Incidents";
  }, [metric]);

  const computedFindings = useMemo(() => {
    const findings = [];

    const topType = typeData.slice().sort((a, b) => (b?.count || 0) - (a?.count || 0))[0];
    const topYear = yearData.slice().sort((a, b) => (b?.count || 0) - (a?.count || 0))[0];
    const topState = stateData?.[0];

    if (topType?._id) {
      findings.push(
        `${titleCase(topType._id)} is the most frequently recorded disaster type in the published dataset (${nfmt(topType.count)} incident(s)).`
      );
    }

    if (topYear?._id != null) {
      findings.push(
        `${topYear._id} records the highest published incident count in the available time series (${nfmt(topYear.count)}).`
      );
    }

    if (summary?.statesCovered != null) {
      findings.push(`Published records currently cover ${nfmt(summary.statesCovered)} state(s) across Nigeria.`);
    }

    if (summary?.totalAffected != null) {
      findings.push(
        `Reported affected population totals ${nfmt(summary.totalAffected)}, indicating the scale of documented human impact in the published dataset.`
      );
    }

    if (topState?._id) {
      findings.push(
        `${titleCase(topState._id)} ranks highest by ${metricLabel.toLowerCase()} in the “Most affected states” view (${nfmt(topState.count)}).`
      );
    }

    if (!findings.length) {
      findings.push("As published coverage grows, stronger trend signals and geographic concentration patterns will become clearer.");
    }

    return findings.slice(0, 6);
  }, [typeData, yearData, summary, stateData, metricLabel]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative overflow-hidden bg-primary text-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-7xl px-6 pb-14 pt-20"
        >
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-accent" />
              CEDRAM • Public analytics
            </div>

            <h1 className="mt-6 text-4xl font-semibold md:text-5xl">
              Disaster Insights
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/85">
              Explore statistical patterns and public analytics derived from published disaster incident
              records across Nigeria. These insights support research, preparedness analysis, planning,
              and evidence-based decision-making.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/disaster-map"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 font-semibold text-accenttext transition hover:brightness-95"
              >
                Explore disaster map →
              </Link>
              <Link
                to="/submit-report"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Submit field report
              </Link>
            </div>

            <div className="mt-6 text-xs text-white/70">
              {loading
                ? "Loading analytics…"
                : lastUpdatedLabel
                ? `Last updated: ${lastUpdatedLabel}`
                : "Updated from published incident records"}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto -mt-8 max-w-7xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total incidents",
              value: loading ? "—" : nfmt(summary?.totalIncidents),
              icon: <IconAlert />,
              tone: "blue",
            },
            {
              label: "States covered",
              value: loading ? "—" : nfmt(summary?.statesCovered),
              icon: <IconPin />,
              tone: "blue",
            },
            {
              label: "People affected",
              value: loading ? "—" : nfmt(summary?.totalAffected),
              icon: <IconUsers />,
              tone: "accent",
            },
            {
              label: "Reported fatalities",
              value: loading ? "—" : nfmt(summary?.totalFatalities),
              icon: <IconTrend />,
              tone: "accent",
            },
          ].map((item, idx) => (
            <FadeInSection key={item.label} delay={idx * 0.05}>
              <KpiCard {...item} />
            </FadeInSection>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14">
        <FadeInSection>
          <div className="rounded-3xl border border-border bg-surface/85 p-6 shadow-sm backdrop-blur-[2px] md:p-7">
            <h2 className="text-xl font-semibold text-primary md:text-2xl">
              Public analytics overview
            </h2>
            <p className="mt-3 max-w-4xl leading-relaxed text-textmuted">
             This page presents high-level analytics from CEDRAM’s public incident records. Figures should
be interpreted as public disaster information and may change as validation improves, additional
records are published, and historical coverage expands.
            </p>
          </div>
        </FadeInSection>

        <div className="mt-12">
          <FadeInSection>
            <SectionTitle
              title="Disasters by type"
              subtitle="Distribution of published incident records across disaster categories."
            />
          </FadeInSection>

          <div className="grid gap-6 lg:grid-cols-2">
            <FadeInSection>
              <CardShell
                title="Type frequency"
                subtitle="Published incident counts by disaster category."
                right={<ExportButton filename="disasters-by-type.csv" data={typeData} />}
              >
                <div className="h-[320px]">
                  {loading ? (
                    <ChartSkeleton height="h-[320px]" />
                  ) : typeData.length === 0 ? (
                    <ChartEmptyState message="No published disaster type data is available yet." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={typeData}>
                        <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
                        <XAxis
                          dataKey="_id"
                          tick={{ fill: "#475569", fontSize: 12 }}
                          interval={0}
                          tickFormatter={(value) => shortLabel(value, 10)}
                        />
                        <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                        <Tooltip
                          content={<CustomTooltip formatterLabel={(label) => titleCase(label)} />}
                          cursor={{ fill: "rgba(52,82,153,0.08)" }}
                        />
                        <Bar
                          dataKey="count"
                          name="Incidents"
                          fill={BRAND.primary}
                          radius={[8, 8, 0, 0]}
                          animationDuration={reduceMotion ? 0 : 900}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardShell>
            </FadeInSection>

            <FadeInSection delay={0.05}>
              <CardShell
                title="Type distribution"
                subtitle="Relative share of published incidents by disaster type."
                right={<ExportButton filename="disaster-type-distribution.csv" data={typeData} />}
              >
                <div className="h-[320px]">
                  {loading ? (
                    <ChartSkeleton height="h-[320px]" />
                  ) : typeData.length === 0 ? (
                    <ChartEmptyState message="No distribution data is available yet." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeData}
                          dataKey="count"
                          nameKey="_id"
                          outerRadius={120}
                          innerRadius={60}
                          paddingAngle={2}
                          animationDuration={reduceMotion ? 0 : 900}
                        >
                          {typeData.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={<CustomTooltip formatterLabel={(label) => titleCase(label)} />}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="mt-2 text-xs text-textmuted">
                  Distribution patterns become more stable as the published dataset grows over time.
                </div>
              </CardShell>
            </FadeInSection>
          </div>
        </div>

        <div className="mt-12">
          <FadeInSection>
            <SectionTitle
              title="Disaster trends over time"
              subtitle="Year-by-year view of published incident records."
            />
          </FadeInSection>

          <FadeInSection>
            <CardShell
              title="Incidents by year"
              subtitle="Time-series view based on published incident records."
              right={<ExportButton filename="incidents-by-year.csv" data={yearData} />}
            >
              <div className="h-[360px]">
                {loading ? (
                  <ChartSkeleton height="h-[360px]" />
                ) : yearData.length === 0 ? (
                  <ChartEmptyState message="No time-series data is available yet." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearData}>
                      <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
                      <XAxis dataKey="_id" tick={{ fill: "#475569", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Incidents"
                        stroke={BRAND.secondary}
                        strokeWidth={3}
                        dot={{ r: 4, stroke: BRAND.secondary, strokeWidth: 2, fill: "#fff" }}
                        activeDot={{ r: 6 }}
                        animationDuration={reduceMotion ? 0 : 1100}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="mt-4">
                <InsightNote>
                  Trend interpretation should take into account publication timing, dataset maturity,
                  reporting completeness, and improvements in historical coverage.
                </InsightNote>
              </div>
            </CardShell>
          </FadeInSection>
        </div>

        <div className="mt-12">
          <FadeInSection>
            <SectionTitle
              title="Most affected states"
              subtitle="Compare incident frequency, affected population, and reported fatalities to understand concentration of impact."
            />
          </FadeInSection>

          <FadeInSection>
            <CardShell
              title={`Top states by ${metricLabel.toLowerCase()}`}
              subtitle="Derived from published incident records in the public analytics layer."
              right={
                <div className="flex flex-wrap items-center gap-3">
                  <Segmented
                    value={metric}
                    onChange={setMetric}
                    options={[
                      { value: "incidents", label: "Incidents" },
                      { value: "affected", label: "Affected" },
                      { value: "fatalities", label: "Fatalities" },
                    ]}
                  />
                  <ExportButton filename={`most-affected-states-${metric}.csv`} data={stateData} />
                </div>
              }
            >
              {loading ? (
                <ChartSkeleton height="h-[380px]" />
              ) : stateData.length === 0 ? (
                <ChartEmptyState message="No state-level analytics are available yet, or this metric does not currently have published values." />
              ) : (
                <div className="h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateData} layout="vertical" margin={{ left: 20, right: 12 }}>
                      <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
                      <XAxis type="number" tick={{ fill: "#475569", fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="_id"
                        tick={{ fill: "#475569", fontSize: 12 }}
                        tickFormatter={(value) => shortLabel(titleCase(value), 14)}
                        width={110}
                      />
                      <Tooltip
                        content={<CustomTooltip formatterLabel={(label) => titleCase(label)} />}
                        cursor={{ fill: "rgba(52,82,153,0.08)" }}
                      />
                      <Bar
                        dataKey="count"
                        name={metricLabel}
                        fill={BRAND.primary}
                        radius={[0, 8, 8, 0]}
                        animationDuration={reduceMotion ? 0 : 900}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="mt-4 text-xs leading-relaxed text-textmuted">
                Note: affected-population and fatality totals depend on reported field completeness and may be incomplete for some incident records.
              </div>
            </CardShell>
          </FadeInSection>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <FadeInSection>
              <SectionTitle
                title="Key findings"
                subtitle="Auto-generated summary based on the currently published dataset."
              />
            </FadeInSection>

            <FadeInSection>
              <div className="rounded-3xl border border-border bg-surface/85 p-8 shadow-sm backdrop-blur-[2px]">
                <ul className="list-disc space-y-4 pl-6 leading-relaxed text-textmuted">
                  {computedFindings.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>

                <div className="mt-6 text-xs text-textmuted">
                  These findings are dataset-dependent and should be interpreted in light of reporting completeness and publication coverage.
                </div>
              </div>
            </FadeInSection>
          </div>

          <div className="lg:col-span-5">
            <FadeInSection delay={0.05}>
              <SectionTitle
                title="Method note"
                subtitle="How to interpret this public analytics view."
              />
            </FadeInSection>

            <FadeInSection delay={0.05}>
              <div className="space-y-4 rounded-3xl border border-border bg-muted/55 p-8 shadow-sm backdrop-blur-[2px]">
                <InsightNote>
                  This analytics page reflects CEDRAM’s published incident records only. Draft, pending review, archived, or non-public workflow states are excluded.
                </InsightNote>

                <InsightNote>
                  Numeric values depend on field completeness. Missing affected-population or fatality values will influence aggregate interpretation.
                </InsightNote>

                <InsightNote>
                  Use this page as a high-level public analytics layer. For mapped exploration and record-level review, use the Disaster Map and individual incident pages.
                </InsightNote>
              </div>
            </FadeInSection>
          </div>
        </div>

        <div className="mt-14">
          <FadeInSection>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-primary p-10 text-white shadow-lg md:p-12">
              <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                <div>
                  <h3 className="text-2xl font-semibold md:text-4xl">
                    Explore the underlying incident records
                  </h3>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
                   Move from summary analytics into mapped incidents, detailed records, and CEDRAM’s structured public reporting workflow.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/disaster-map"
                    className="inline-flex items-center justify-center rounded-xl bg-accent px-7 py-3 font-semibold text-accenttext transition hover:brightness-95"
                  >
                    Open disaster map
                  </Link>
                  <Link
                    to="/submit-report"
                    className="inline-flex items-center justify-center rounded-xl border border-white/25 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    Submit report
                  </Link>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}