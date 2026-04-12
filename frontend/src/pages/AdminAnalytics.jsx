import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { useAuth } from "../context/AuthContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  Users,
  TriangleAlert,
  Download,
  Filter,
  BarChart3,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const COLORS = [
  "#0f766e",
  "#0284c7",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#16a34a",
  "#ea580c",
  "#2563eb",
];

function AdminAnalytics() {
  const { accessToken } = useAuth();

  const dashboardRef = useRef(null);
  const monthlyTrendRef = useRef(null);
  const affectedRef = useRef(null);
  const fatalitiesRef = useRef(null);
  const statesAffectedRef = useRef(null);

  const [summary, setSummary] = useState({});
  const [typeData, setTypeData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [statesAffectedData, setStatesAffectedData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [monthlyAffected, setMonthlyAffected] = useState([]);
  const [monthlyFatalities, setMonthlyFatalities] = useState([]);
  const [statesList, setStatesList] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [compareStartDate, setCompareStartDate] = useState("");
  const [compareEndDate, setCompareEndDate] = useState("");
  const [compareSummary, setCompareSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const axiosConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    [accessToken]
  );

  const avgAffected =
    summary?.totalIncidents > 0
      ? Math.round((summary?.totalAffected || 0) / summary.totalIncidents)
      : 0;

  const query = useMemo(
    () =>
      `?state=${selectedState.toLowerCase() || ""}&startDate=${startDate || ""}&endDate=${endDate || ""}`,
    [selectedState, startDate, endDate]
  );

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/analytics/states`, axiosConfig);
      setStatesList(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setPageError("Failed to load analytics filters.");
    }
  };

  const fetchAnalytics = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setPageError("");

      const [
        summaryRes,
        typeRes,
        stateRes,
        monthlyTrendRes,
        monthlyAffectedRes,
        monthlyFatalitiesRes,
        topAffectedStatesRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/summary${query}`, axiosConfig),
        axios.get(`${API_URL}/api/analytics/disaster-types${query}`, axiosConfig),
        axios.get(`${API_URL}/api/analytics/incidents-by-state${query}`, axiosConfig),
        axios.get(`${API_URL}/api/analytics/monthly-disaster-trend${query}`, axiosConfig),
        axios.get(`${API_URL}/api/analytics/monthly-affected-population${query}`, axiosConfig),
        axios.get(`${API_URL}/api/analytics/monthly-fatalities-trend${query}`, axiosConfig),
        axios.get(`${API_URL}/api/analytics/top-states-by-affected${query}`, axiosConfig),
      ]);

      setSummary(summaryRes.data || {});
      setTypeData(Array.isArray(typeRes.data) ? typeRes.data : []);
      setStateData(Array.isArray(stateRes.data) ? stateRes.data : []);
      setMonthlyTrend(Array.isArray(monthlyTrendRes.data) ? monthlyTrendRes.data : []);
      setMonthlyAffected(Array.isArray(monthlyAffectedRes.data) ? monthlyAffectedRes.data : []);
      setMonthlyFatalities(Array.isArray(monthlyFatalitiesRes.data) ? monthlyFatalitiesRes.data : []);
      setStatesAffectedData(Array.isArray(topAffectedStatesRes.data) ? topAffectedStatesRes.data : []);
    } catch (error) {
      console.error(error);
      const status = error?.response?.status;
      if (status === 401) {
        setPageError("Your session is no longer valid. Please log in again.");
      } else if (status === 403) {
        setPageError("You do not have permission to view analytics.");
      } else {
        setPageError("Failed to load analytics data.");
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, query, axiosConfig]);

  const fetchCompareSummary = async () => {
    if (!compareStartDate || !compareEndDate) return;
    try {
      const compareQuery = `?state=${selectedState.toLowerCase() || ""}&startDate=${compareStartDate}&endDate=${compareEndDate}`;
      const res = await axios.get(
        `${API_URL}/api/analytics/summary${compareQuery}`,
        axiosConfig
      );
      setCompareSummary(res.data || null);
    } catch (error) {
      console.error(error);
      setCompareSummary(null);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchStates();
      fetchAnalytics();
    }
  }, [accessToken, fetchAnalytics]);

  const exportRawCSV = () => {
    window.open(`${API_URL}/api/analytics/export/raw-csv${query}`, "_blank");
  };

  const exportSummaryCSV = () => {
    window.open(`${API_URL}/api/analytics/export/summary-csv${query}`, "_blank");
  };

  const exportSectionPNG = async (ref, filename) => {
    if (!ref?.current) return;
    const canvas = await html2canvas(ref.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, filename);
    });
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Analytics & Insights
          </h1>
          <p className="mt-2 text-slate-600">
            Comprehensive disaster analytics, monthly trends, impact metrics, and geographic summaries.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <ActionButton onClick={exportRawCSV} tone="blue" icon={<Download size={16} />}>
            Export Raw CSV
          </ActionButton>
          <ActionButton onClick={exportSummaryCSV} tone="green" icon={<Download size={16} />}>
            Export Summary CSV
          </ActionButton>
          <ActionButton
            onClick={() => exportSectionPNG(dashboardRef, "analytics-dashboard.png")}
            tone="purple"
            icon={<Download size={16} />}
          >
            Export Full View
          </ActionButton>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter size={16} className="text-primary" />
          Filters
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-primary"
            >
              <option value="">All States</option>
              {statesList.map((state, index) => (
                <option key={index} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-primary"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchAnalytics}
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-secondary"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <BarChart3 size={16} className="text-primary" />
          Compare Date Ranges
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Compare Start
            </label>
            <input
              type="date"
              value={compareStartDate}
              onChange={(e) => setCompareStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Compare End
            </label>
            <input
              type="date"
              value={compareEndDate}
              onChange={(e) => setCompareEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchCompareSummary}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-800 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-900"
            >
              Compare
            </button>
          </div>

          {compareSummary && (
            <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div>Incidents: <b>{compareSummary.totalIncidents || 0}</b></div>
              <div>Affected: <b>{compareSummary.totalAffected || 0}</b></div>
              <div>Fatalities: <b>{compareSummary.totalFatalities || 0}</b></div>
            </div>
          )}
        </div>
      </div>

      {pageError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      )}

      <div ref={dashboardRef} className="space-y-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Incidents" value={summary.totalIncidents || 0} icon={<Activity size={20} />} color="amber" />
          <StatCard title="People Affected" value={summary.totalAffected || 0} icon={<Users size={20} />} color="sky" />
          <StatCard title="Avg. Affected / Incident" value={avgAffected} icon={<Activity size={20} />} color="emerald" />
          <StatCard title="Total Fatalities" value={summary.totalFatalities || 0} icon={<TriangleAlert size={20} />} color="orange" />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading analytics...
          </div>
        ) : (
          <>
            <div ref={monthlyTrendRef}>
              <ChartShell
                title="Monthly Disaster Trend"
                onExport={() => exportSectionPNG(monthlyTrendRef, "monthly-disaster-trend.png")}
              >
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="monthlyTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f4b000" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#f4b000" stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#d89b10"
                      fill="url(#monthlyTrendFill)"
                      strokeWidth={3}
                      name="Number of Disasters"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartShell>
            </div>

            <div className="grid gap-8 xl:grid-cols-2">
              <div ref={affectedRef}>
                <ChartShell
                  title="Monthly Affected Population"
                  onExport={() => exportSectionPNG(affectedRef, "monthly-affected-population.png")}
                >
                  <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={monthlyAffected}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="affected"
                        stroke="#4f9d74"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        name="Affected Population"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartShell>
              </div>

              <div ref={fatalitiesRef}>
                <ChartShell
                  title="Monthly Fatalities Trend"
                  onExport={() => exportSectionPNG(fatalitiesRef, "monthly-fatalities-trend.png")}
                >
                  <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={monthlyFatalities}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="fatalities"
                        stroke="#dc2626"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        name="Fatalities"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartShell>
              </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-2">
              <ChartShell title="Disaster Type Distribution">
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      dataKey="count"
                      nameKey="_id"
                      outerRadius={118}
                      label
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartShell>

              <ChartShell title="Top States by Incident Count">
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={stateData.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="_id" angle={-35} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartShell>
            </div>

            <div ref={statesAffectedRef}>
              <ChartShell
                title="Top States by Affected Population"
                onExport={() => exportSectionPNG(statesAffectedRef, "top-states-by-affected.png")}
              >
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={statesAffectedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="_id" angle={-25} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="affected" fill="#0f766e" radius={[6, 6, 0, 0]} name="Affected Population" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartShell>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ActionButton({ children, onClick, tone = "blue", icon }) {
  const tones = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tones[tone]}`}
    >
      {icon}
      {children}
    </button>
  );
}

function StatCard({ title, value, icon, color = "amber" }) {
  const styles = {
    amber: "bg-amber-500 text-white",
    sky: "bg-sky-500 text-white",
    emerald: "bg-emerald-600 text-white",
    orange: "bg-orange-600 text-white",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${styles[color]}`}>
        {icon}
      </div>
      <h2 className="mt-5 text-4xl font-bold text-slate-900">{value}</h2>
      <p className="mt-2 text-sm text-slate-600">{title}</p>
    </div>
  );
}

function ChartShell({ title, children, onExport }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {onExport ? (
          <button
            onClick={onExport}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Export Chart
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default AdminAnalytics;