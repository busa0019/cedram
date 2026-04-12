import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const pinIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toDateString();
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

function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-surface/80 border border-border text-textmain">
      {children}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-surface/80 backdrop-blur-[2px] rounded-2xl border border-border shadow-sm p-6 text-center">
      <div className="text-3xl font-semibold text-primary">{value}</div>
      <div className="mt-2 text-sm text-textmuted">{label}</div>
    </div>
  );
}

function PopupCard({ incident }) {
  const stateLabel = incident.state ? titleCase(incident.state) : "—";

  return (
    <div className="w-[300px]">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold">
          !
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xl font-semibold text-textmain leading-tight">
            {incident.disaster_type || "Incident"}
          </div>
          <div className="mt-1 text-sm text-textmuted truncate">
            {incident.location || "—"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-muted/60 border border-border rounded-xl p-3">
          <div className="text-xs text-textmuted font-semibold">State</div>
          <div className="mt-1 text-sm font-semibold text-textmain">{stateLabel}</div>
        </div>

        <div className="bg-muted/60 border border-border rounded-xl p-3">
          <div className="text-xs text-textmuted font-semibold">Date</div>
          <div className="mt-1 text-sm font-semibold text-textmain">
            {formatDate(incident.date)}
          </div>
        </div>

        <div className="bg-muted/60 border border-border rounded-xl p-3">
          <div className="text-xs text-textmuted font-semibold">Affected</div>
          <div className="mt-1 text-sm font-semibold text-textmain">
            {(incident.affected_population ?? 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-muted/60 border border-border rounded-xl p-3">
          <div className="text-xs text-textmuted font-semibold">Fatalities</div>
          <div className="mt-1 text-sm font-semibold text-textmain">
            {(incident.fatalities ?? 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-textmuted font-semibold">Description</div>
        <div className="mt-2 text-sm text-textmain leading-relaxed line-clamp-4">
          {incident.description || "—"}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge>{incident.status || "published"}</Badge>

        <Link
          to={`/incidents/${incident._id}`}
          className="text-sm font-semibold text-secondary hover:underline"
        >
          View →
        </Link>
      </div>
    </div>
  );
}

function ResultCard({ incident, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(incident)}
      className={[
        "w-full text-left rounded-2xl border p-4 transition",
        active
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-surface/70 hover:bg-muted",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-textmain">
            {incident.disaster_type || "Incident"}
          </div>
          <div className="mt-1 text-sm text-textmuted">
            {incident.location || "—"}
          </div>
        </div>
        <span className="text-xs text-textmuted shrink-0">{formatDate(incident.date)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {incident.state && <Badge>{titleCase(incident.state)}</Badge>}
        <Badge>{incident.status || "published"}</Badge>
      </div>
    </button>
  );
}

function MapFlyController({ selectedIncident }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedIncident) return;
    if (
      typeof selectedIncident.latitude !== "number" ||
      typeof selectedIncident.longitude !== "number"
    ) {
      return;
    }

    map.flyTo([selectedIncident.latitude, selectedIncident.longitude], 10, {
      duration: 0.9,
    });
  }, [map, selectedIncident]);

  return null;
}

export default function DisasterMap() {
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  useEffect(() => {
    let alive = true;

    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/incidents`);
        const arr = Array.isArray(res.data) ? res.data : [];

        const clean = arr.filter(
          (x) =>
            typeof x.latitude === "number" &&
            typeof x.longitude === "number" &&
            !Number.isNaN(x.latitude) &&
            !Number.isNaN(x.longitude)
        );

        if (!alive) return;
        setIncidents(clean);
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
  }, []);

  const disasterTypes = useMemo(() => {
    const set = new Set(incidents.map((i) => i.disaster_type).filter(Boolean));
    return Array.from(set).sort();
  }, [incidents]);

  const states = useMemo(() => {
    const set = new Set(incidents.map((i) => i.state).filter(Boolean));
    return Array.from(set).sort((a, b) => titleCase(a).localeCompare(titleCase(b)));
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    const q = query.trim().toLowerCase();

    return incidents.filter((i) => {
      if (typeFilter !== "all" && i.disaster_type !== typeFilter) return false;
      if (stateFilter !== "all" && i.state !== stateFilter) return false;

      if (!q) return true;
      const hay = [i.disaster_type, i.state, i.location, i.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [incidents, query, typeFilter, stateFilter]);

  const selectedIncident = useMemo(
    () => filteredIncidents.find((i) => i._id === selectedIncidentId) || null,
    [filteredIncidents, selectedIncidentId]
  );

  useEffect(() => {
    if (!selectedIncidentId) return;
    const stillExists = filteredIncidents.some((i) => i._id === selectedIncidentId);
    if (!stillExists) setSelectedIncidentId(null);
  }, [filteredIncidents, selectedIncidentId]);

  const stats = useMemo(() => {
    const incidentsMapped = incidents.length;
    const statesCovered = new Set(incidents.map((i) => i.state).filter(Boolean)).size;
    const disasterTypesCount = new Set(incidents.map((i) => i.disaster_type).filter(Boolean)).size;
    return { incidentsMapped, statesCovered, disasterTypesCount };
  }, [incidents]);

  const handleSelectIncident = (incident) => {
    setSelectedIncidentId(incident._id);

    const map = mapRef.current;
    if (map) {
      map.flyTo([incident.latitude, incident.longitude], 10, {
        duration: 0.9,
      });
    }

    setTimeout(() => {
      const marker = markerRefs.current[incident._id];
      if (marker && typeof marker.openPopup === "function") {
        marker.openPopup();
      }
    }, 300);
  };

  const resetFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setStateFilter("all");
    setSelectedIncidentId(null);
  };

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative overflow-hidden bg-primary text-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-accent" />
              CEDRAM • Disaster mapping
            </div>

            <h1 className="mt-5 text-4xl font-semibold md:text-5xl">
              Disaster Map of Nigeria
            </h1>
            <p className="mt-4 max-w-3xl leading-relaxed text-white/85">
              Explore mapped and publicly available disaster incidents across Nigeria to support
              awareness, analysis, planning, and evidence-based decision-making.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface/80 p-5 shadow-sm backdrop-blur-[2px] lg:col-span-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10 font-bold text-secondary">
              i
            </div>
            <div className="text-sm text-textmain">
              <span className="font-semibold">Tip:</span> Use the results list to quickly navigate to a mapped incident record. Selecting a record will move the map to its location and open the incident summary.
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface/80 p-5 shadow-sm backdrop-blur-[2px]">
            <div className="text-sm font-semibold text-textmain">Legend</div>
            <div className="mt-4 space-y-3 text-sm text-textmuted">
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                  alt="Marker"
                  className="h-5 w-5"
                />
                <span>Incident marker</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-accent" />
                <span>Public incident record on map</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Currently selected record</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface/80 p-5 shadow-sm backdrop-blur-[2px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by disaster type, state, location, or keyword..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-textmain placeholder:text-textmuted outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-textmain outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            >
              <option value="all">All disaster types</option>
              {disasterTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-textmain outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            >
              <option value="all">All states</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-textmuted">
            <div>
              Showing <span className="font-semibold text-textmain">{filteredIncidents.length}</span> of{" "}
              <span className="font-semibold text-textmain">{incidents.length}</span> publicly available incident records.
            </div>

            <button
              onClick={resetFilters}
              className="rounded-xl border border-border px-4 py-2 font-semibold text-textmain transition hover:bg-muted"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-xl backdrop-blur-[2px]">
              <div className="border-b border-border bg-muted/40 px-5 py-4">
                <h2 className="text-lg font-semibold text-textmain">Incident map</h2>
                <p className="mt-1 text-sm text-textmuted">
                  Clustered spatial view of publicly available disaster incident records across Nigeria.
                </p>
              </div>

              <div className="h-[520px] md:h-[600px]">
                <MapContainer
                  center={[9.082, 8.6753]}
                  zoom={6}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                  whenCreated={(map) => {
                    mapRef.current = map;
                  }}
                >
                  <ZoomControl position="topleft" />

                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapFlyController selectedIncident={selectedIncident} />

                  <MarkerClusterGroup chunkedLoading>
                    {filteredIncidents.map((incident) => (
                      <Marker
                        key={incident._id}
                        position={[incident.latitude, incident.longitude]}
                        icon={pinIcon}
                        ref={(ref) => {
                          if (ref) markerRefs.current[incident._id] = ref;
                        }}
                        eventHandlers={{
                          click: () => {
                            setSelectedIncidentId(incident._id);
                          },
                        }}
                      >
                        <Popup className="incident-popup" closeButton minWidth={320}>
                          <PopupCard incident={incident} />
                        </Popup>
                      </Marker>
                    ))}
                  </MarkerClusterGroup>
                </MapContainer>
              </div>
            </div>

            {selectedIncident && (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-primary">Selected incident record</div>
                    <h3 className="mt-1 text-lg font-semibold text-textmain">
                      {selectedIncident.disaster_type || "Incident"}
                    </h3>
                    <p className="mt-1 text-sm text-textmuted">
                      {selectedIncident.location || "—"} •{" "}
                      {selectedIncident.state ? titleCase(selectedIncident.state) : "—"} •{" "}
                      {formatDate(selectedIncident.date)}
                    </p>
                  </div>

                  <Link
                    to={`/incidents/${selectedIncident._id}`}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 font-semibold text-white transition hover:bg-secondary"
                  >
                    Open details
                  </Link>
                </div>
              </div>
            )}

            {filteredIncidents.length === 0 && !loading && (
              <div className="mt-6 rounded-2xl border border-border bg-muted/55 p-8 text-center">
                <div className="text-lg font-semibold text-textmain">No incident records match your filters</div>
                <p className="mt-2 text-textmuted">
                  Try adjusting the search term or resetting the selected disaster type and state.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-secondary"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          <div className="xl:col-span-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-sm backdrop-blur-[2px] xl:sticky xl:top-24">
              <div className="border-b border-border bg-muted/40 px-5 py-4">
                <h3 className="text-lg font-semibold text-textmain">Results list</h3>
                <p className="mt-1 text-sm text-textmuted">
                  Select a record to move the map and open its incident summary.
                </p>
              </div>

              <div className="max-h-[600px] space-y-3 overflow-auto p-4">
                {filteredIncidents.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-muted/55 p-6 text-center text-sm text-textmuted">
                    No results to display.
                  </div>
                ) : (
                  filteredIncidents.slice(0, 30).map((incident) => (
                    <ResultCard
                      key={incident._id}
                      incident={incident}
                      active={incident._id === selectedIncidentId}
                      onSelect={handleSelectIncident}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-center text-3xl font-semibold text-textmain">
            Disaster Map Statistics
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard label="Incident Records Mapped" value={stats.incidentsMapped} />
            <StatCard label="States Covered" value={stats.statesCovered} />
            <StatCard label="Disaster Types Represented" value={stats.disasterTypesCount} />
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-surface/95 px-4 py-2 text-sm text-textmain shadow">
          Loading incidents…
        </div>
      )}
    </section>
  );
}