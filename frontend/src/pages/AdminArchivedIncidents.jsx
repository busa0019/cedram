import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

export default function AdminArchivedIncidents() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [query, setQuery] = useState("");

  const fetchArchived = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/incidents/admin?page=1&limit=200`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const all = Array.isArray(res.data.incidents) ? res.data.incidents : [];
      setIncidents(all.filter((i) => i.archived === true));
    } catch (e) {
      console.error(e);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchArchived();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return incidents;

    return incidents.filter((i) => {
      const hay = [i.disaster_type, i.state, i.location].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [incidents, query]);

  const restore = async (id) => {
    const ok = window.confirm("Restore this incident?");
    if (!ok) return;

    try {
      setActionId(id);
      await axios.put(
        `${API_URL}/api/incidents/${id}/restore`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Remove restored row immediately for UX
      setIncidents((prev) => prev.filter((x) => x._id !== id));

      // Optional: send user back
      // navigate("/admin/incidents");
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to restore incident");
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Archived Incidents</h1>
          <p className="mt-2 text-gray-600">
            These incidents are hidden from the public map. Restore to bring them back.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/incidents"
            className="inline-flex justify-center border border-gray-200 bg-white px-5 py-2.5 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            ← Back to Incident Management
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search archived by type/state/location..."
          className="w-full md:w-[420px] rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-gray-700">
                <th className="p-4 text-left font-semibold">Type</th>
                <th className="p-4 text-left font-semibold">State</th>
                <th className="p-4 text-left font-semibold">Location</th>
                <th className="p-4 text-left font-semibold">Date</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-4"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-64 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-8 w-28 bg-gray-100 rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-600">
                    No archived incidents found.
                  </td>
                </tr>
              ) : (
                filtered.map((i) => (
                  <tr key={i._id} className="border-t hover:bg-gray-50/60 transition">
                    <td className="p-4 font-semibold text-gray-900">{i.disaster_type || "—"}</td>
                    <td className="p-4 text-gray-700">{i.state ? titleCase(i.state) : "—"}</td>
                    <td className="p-4 text-gray-700">
                      <div className="max-w-[360px] truncate">{i.location || "—"}</div>
                      <div className="text-xs text-gray-500">
                        {i.latitude}, {i.longitude}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{formatDate(i.date)}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => restore(i._id)}
                          disabled={actionId === i._id}
                          className="px-3 py-2 text-xs rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                        >
                          {actionId === i._id ? "Working..." : "Restore"}
                        </button>

                        <button
                          onClick={() => navigate(`/admin/edit-incident/${i._id}`)}
                          className="px-3 py-2 text-xs rounded-md font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}