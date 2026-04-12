import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  TriangleAlert,
  FileText,
  BookOpen,
  Users,
  MapPinned,
  Skull,
  Clock3,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminDashboard() {
  const { accessToken, user } = useAuth();

  const [stats, setStats] = useState({
    totalIncidents: 0,
    pendingIncidents: 0,
    publishedArticles: 0,
    totalAffected: 0,
    totalFatalities: 0,
    statesCovered: 0,
  });

  const [recentIncidents, setRecentIncidents] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [recentPublications, setRecentPublications] = useState([]);
  const [stateChartData, setStateChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setStats({
        totalIncidents: res.data?.totalIncidents || 0,
        pendingIncidents: res.data?.pendingIncidents || 0,
        publishedArticles: res.data?.publishedArticles || 0,
        totalAffected: res.data?.totalAffected || 0,
        totalFatalities: res.data?.totalFatalities || 0,
        statesCovered: res.data?.statesCovered || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchRecentIncidents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/incidents`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const incidents = Array.isArray(res.data?.incidents)
        ? res.data.incidents
        : Array.isArray(res.data)
        ? res.data
        : [];

      setRecentIncidents(incidents.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch recent incidents:", error);
      setRecentIncidents([]);
    }
  };

  const fetchPendingReports = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/field-reports/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const reports = Array.isArray(res.data) ? res.data : [];
      setPendingReports(reports.filter((r) => r.status === "pending").slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch pending reports:", error);
      setPendingReports([]);
    }
  };

  const fetchRecentPublications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/articles/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const items = Array.isArray(res.data) ? res.data : [];
      const sorted = items
        .slice()
        .sort(
          (a, b) =>
            new Date(b.publishDate || b.createdAt || 0) -
            new Date(a.publishDate || a.createdAt || 0)
        );

      setRecentPublications(sorted.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch recent publications:", error);
      setRecentPublications([]);
    }
  };

  const fetchStateChart = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/analytics/incidents-by-state`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setStateChartData(Array.isArray(res.data) ? res.data.slice(0, 6) : []);
    } catch (error) {
      console.error("Failed to fetch dashboard chart:", error);
      setStateChartData([]);
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!accessToken) return;
      setLoading(true);

      await Promise.all([
        fetchStats(),
        fetchRecentIncidents(),
        fetchPendingReports(),
        fetchRecentPublications(),
        fetchStateChart(),
      ]);

      setLoading(false);
    };

    run();
  }, [accessToken]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-slate-600">
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}.
            Here is a high-level summary of incidents, reports, publications, and impact.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/create-incident"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
          >
            <Plus size={16} />
            New Incident
          </Link>

          <Link
            to="/admin/create-article"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            <Plus size={16} />
            New Publication
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <DashboardStatCard title="Total Incidents" value={stats.totalIncidents} icon={<TriangleAlert size={20} />} color="blue" />
        <DashboardStatCard title="Pending Reports" value={stats.pendingIncidents} icon={<FileText size={20} />} color="amber" />
        <DashboardStatCard title="Published Articles" value={stats.publishedArticles} icon={<BookOpen size={20} />} color="emerald" />
        <DashboardStatCard title="People Affected" value={stats.totalAffected} icon={<Users size={20} />} color="sky" />
        <DashboardStatCard title="Total Fatalities" value={stats.totalFatalities} icon={<Skull size={20} />} color="red" />
        <DashboardStatCard title="States Covered" value={stats.statesCovered} icon={<MapPinned size={20} />} color="slate" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-slate-900">
            Top States by Incident Concentration
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Geographic overview of recent incident distribution.
          </p>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-500">
            Loading dashboard chart...
          </div>
        ) : stateChartData.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            No chart data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stateChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f4b000" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <ListCard
          title="Recent Incidents"
          emptyText="No recent incidents."
          items={recentIncidents.map((item) => ({
            id: item._id,
            title: item.disaster_type || "Incident",
            subtitle: `${item.location || "Unknown location"}${item.state ? `, ${item.state}` : ""}`,
            meta: item.date ? new Date(item.date).toLocaleDateString() : "—",
            badge: item.status || "incident",
            badgeTone: item.status === "published" ? "green" : "yellow",
          }))}
        />

        <ListCard
          title="Pending Reports"
          emptyText="No pending reports."
          items={pendingReports.map((item) => ({
            id: item._id,
            title: item.disaster_type || "Field Report",
            subtitle: item.reporter_name || "Unknown reporter",
            meta: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—",
            badge: item.status || "pending",
            badgeTone: "yellow",
          }))}
        />

        <ListCard
          title="Recent Publications"
          emptyText="No publications found."
          items={recentPublications.map((item) => ({
            id: item._id,
            title: item.title || "Untitled",
            subtitle: item.category || "publication",
            meta: item.publishDate
              ? new Date(item.publishDate).toLocaleDateString()
              : item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "—",
            badge: item.isPublished ? "published" : "draft",
            badgeTone: item.isPublished ? "green" : "slate",
          }))}
        />
      </div>
    </section>
  );
}

function DashboardStatCard({ title, value, icon, color = "blue" }) {
  const tones = {
    blue: "bg-blue-900 text-white",
    amber: "bg-amber-500 text-white",
    emerald: "bg-emerald-600 text-white",
    sky: "bg-sky-500 text-white",
    red: "bg-red-600 text-white",
    slate: "bg-slate-700 text-white",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${tones[color]}`}>
        {icon}
      </div>
      <h2 className="mt-5 text-4xl font-bold text-slate-900">{value}</h2>
      <p className="mt-2 text-sm text-slate-600">{title}</p>
    </div>
  );
}

function ListCard({ title, items = [], emptyText }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 text-xl font-semibold text-slate-900">{title}</div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="py-6 text-slate-500">{emptyText}</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.subtitle}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <Clock3 size={14} />
                    {item.meta}
                  </div>
                </div>

                <MiniBadge tone={item.badgeTone}>{item.badge}</MiniBadge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MiniBadge({ children, tone = "slate" }) {
  const tones = {
    green: "bg-green-50 text-green-700 border border-green-100",
    yellow: "bg-yellow-50 text-yellow-700 border border-yellow-100",
    slate: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default AdminDashboard;