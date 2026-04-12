import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const customIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: rgb(52,82,153);
      border: 3px solid rgb(238,212,79);
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(15,23,42,0.25);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const titleCase = (s = "") =>
  String(s)
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-black/10 bg-accent text-accenttext"
          : "border-white/15 bg-white/10 text-white hover:bg-white/15",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-white/65">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold leading-relaxed text-white">
        {value}
      </div>
    </div>
  );
}

export default function MapPreview() {
  const reduceMotion = useReducedMotion();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("all");

  useEffect(() => {
    let alive = true;

    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/incidents`);
        const arr = Array.isArray(res.data) ? res.data : [];
        if (!alive) return;
        setIncidents(arr);
      } catch (err) {
        console.error(err);
        if (alive) setIncidents([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchIncidents();
    return () => {
      alive = false;
    };
  }, []);

  const derived = useMemo(() => {
    const arr = Array.isArray(incidents) ? incidents : [];

    const typeCounts = new Map();
    for (const i of arr) {
      const t = String(i?.disaster_type || "Other").trim() || "Other";
      typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
    }

    const topTypes = [...typeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    const stateCounts = new Map();
    for (const i of arr) {
      const s = String(i?.state || "").trim();
      if (!s) continue;
      stateCounts.set(s, (stateCounts.get(s) || 0) + 1);
    }

    const topStates = [...stateCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([state, count]) => ({ state, count }));

    return { topTypes, topStates };
  }, [incidents]);

  const filtered = useMemo(() => {
    if (activeType === "all") return incidents;
    const t = String(activeType).toLowerCase();
    return (incidents || []).filter(
      (i) => String(i?.disaster_type || "").toLowerCase() === t
    );
  }, [incidents, activeType]);

  const markers = useMemo(() => {
    return (filtered || [])
      .map((i) => ({
        ...i,
        latitude: safeNum(i?.latitude),
        longitude: safeNum(i?.longitude),
      }))
      .filter((i) => i.latitude != null && i.longitude != null)
      .slice(0, 250);
  }, [filtered]);

  const showingText = useMemo(() => {
    if (loading) return "Loading…";
    if (activeType === "all") return `${markers.length.toLocaleString()} markers shown`;
    return `${markers.length.toLocaleString()} filtered markers`;
  }, [loading, markers.length, activeType]);

  return (
    <section className="relative overflow-hidden bg-primary py-20 text-white">
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[0.92fr_1.08fr] items-center">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Disaster map
          </div>

          <h2 className="mt-5 text-3xl md:text-5xl font-semibold leading-tight">
            Explore disaster patterns across Nigeria
          </h2>

          <div className="mt-5 h-1 w-20 rounded-full bg-accent" />

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            Explore mapped disaster incidents across Nigeria, identify geographic patterns,
            and move into the full map for deeper filtering, monitoring, and location-based analysis.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <StatPill
              label="Top states"
              value={
                loading
                  ? "—"
                  : derived.topStates.length
                  ? derived.topStates
                      .map((s) => `${titleCase(s.state)} (${s.count})`)
                      .join(", ")
                  : "—"
              }
            />
            <StatPill label="Preview status" value={showingText} />
          </div>

          <div className="mt-7">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/65">
              Filter by disaster type
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip active={activeType === "all"} onClick={() => setActiveType("all")}>
                All
              </Chip>

              {(derived.topTypes || []).map((t) => (
                <Chip
                  key={t.type}
                  active={String(activeType).toLowerCase() === String(t.type).toLowerCase()}
                  onClick={() => setActiveType(t.type)}
                >
                  {titleCase(t.type)} · {t.count}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/disaster-map"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 font-semibold text-accenttext transition hover:brightness-95 shadow-sm"
            >
              Explore full map
            </Link>

            <Link
              to="/submit-report"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Submit field report
            </Link>
          </div>

          <p className="mt-5 max-w-xl text-xs leading-relaxed text-white/65">
            This homepage preview shows a limited number of markers for performance.
            Use the full map for broader exploration, filtering, and deeper spatial analysis.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="h-[380px] md:h-[460px] overflow-hidden rounded-3xl border border-white/12 bg-white shadow-2xl">
            <MapContainer
              center={[9.082, 8.6753]}
              zoom={6}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {markers.map((incident) => (
                <Marker
                  key={incident._id}
                  position={[incident.latitude, incident.longitude]}
                  icon={customIcon}
                >
                  <Popup>
                    <strong>{titleCase(incident.disaster_type || "Incident")}</strong>
                    <br />
                    {incident.state ? titleCase(incident.state) : "—"}
                    {incident.location ? ` • ${incident.location}` : ""}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            <div className="pointer-events-none absolute left-4 right-4 top-4 flex justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Map preview
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm">
                {loading ? "Loading…" : `${markers.length.toLocaleString()} markers`}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}