import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function titleCase(s = "") {
  return String(s)
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toDateString();
}

function StatusBadge({ status, archived }) {
  if (archived) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
        Archived
      </span>
    );
  }

  const map = {
    pending: "bg-yellow-50 text-yellow-800 border-yellow-100",
    verified: "bg-blue-50 text-blue-800 border-blue-100",
    published: "bg-green-50 text-green-800 border-green-100",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        map[status] || "bg-gray-50 text-gray-700 border-gray-100"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

function canManage(user) {
  return user?.permissions?.includes("manage_incidents");
}

export default function AdminIncidents({ initialFilter = "all" }) {
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [actionBusy, setActionBusy] = useState(false);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // If wrapper changes initialFilter later, update filter
  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/incidents/admin?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setIncidents(Array.isArray(res.data.incidents) ? res.data.incidents : []);
      setPages(res.data.pages || 1);
    } catch (e) {
      console.error(e);
      setIncidents([]);
      setPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, accessToken]);

  const filteredIncidents = useMemo(() => {
    const q = search.trim().toLowerCase();

    return incidents
      .filter((i) => {
        if (filter === "archived") return i.archived === true;
        if (filter === "all") return i.archived !== true;
        return i.status === filter && i.archived !== true;
      })
      .filter((i) => {
        if (!q) return true;
        const hay = [i.disaster_type, i.state, i.location]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
  }, [incidents, filter, search]);

  const pageIds = useMemo(() => filteredIncidents.map((i) => i._id), [filteredIncidents]);

  const allSelectedOnPage =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const toggleSelectAllOnPage = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const updateStatus = async (id, status) => {
    await axios.put(
      `${API_URL}/api/incidents/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  };

  const archiveIncident = async (id) => {
    await axios.put(
      `${API_URL}/api/incidents/${id}/archive`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  };

  const restoreIncident = async (id) => {
    await axios.put(
      `${API_URL}/api/incidents/${id}/restore`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  };

  const deleteIncident = async (id) => {
    await axios.delete(`${API_URL}/api/incidents/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  };

  const bulk = async (mode) => {
    if (selectedIds.length === 0) return;

    const label =
      mode === "publish"
        ? "Publish"
        : mode === "verify"
        ? "Verify"
        : mode === "archive"
        ? "Archive"
        : "Proceed";

    const ok = window.confirm(`${label} ${selectedIds.length} selected incident(s)?`);
    if (!ok) return;

    try {
      setActionBusy(true);

      if (mode === "publish") {
        await Promise.all(selectedIds.map((id) => updateStatus(id, "published")));
      } else if (mode === "verify") {
        await Promise.all(selectedIds.map((id) => updateStatus(id, "verified")));
      } else if (mode === "archive") {
        await Promise.all(selectedIds.map((id) => archiveIncident(id)));
      }

      setSelectedIds([]);
      await fetchIncidents();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Bulk action failed");
    } finally {
      setActionBusy(false);
    }
  };

  const stats = useMemo(() => {
    const notArchived = incidents.filter((i) => !i.archived);
    return {
      total: incidents.length,
      pending: notArchived.filter((i) => i.status === "pending").length,
      verified: notArchived.filter((i) => i.status === "verified").length,
      published: notArchived.filter((i) => i.status === "published").length,
      archived: incidents.filter((i) => i.archived).length,
    };
  }, [incidents]);

  const manage = canManage(user);
  const canDelete = user?.role === "super_admin";

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Incident Management</h1>
          <p className="mt-2 text-gray-600">
            Verify, publish, archive, edit, and manage incidents shown on the public map.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {manage && (
            <Link
              to="/admin/create-incident"
              className="inline-flex justify-center bg-primary text-white px-5 py-2.5 rounded-md font-semibold hover:bg-secondary transition"
            >
              + Create Incident
            </Link>
          )}

          {manage && (
            <a
              href={`${API_URL}/api/analytics/export/raw-csv`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center border border-gray-200 bg-white px-5 py-2.5 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: `All (${stats.total - stats.archived})` },
            { key: "pending", label: `Pending (${stats.pending})` },
            { key: "verified", label: `Verified (${stats.verified})` },
            { key: "published", label: `Published (${stats.published})` },
            { key: "archived", label: `Archived (${stats.archived})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-2 text-xs font-semibold rounded-md border transition ${
                filter === t.key
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="lg:ml-auto w-full lg:w-[360px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by type/state/location..."
            className="w-full rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
          />
        </div>
      </div>

      {manage && selectedIds.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
          <div className="text-sm text-gray-700">
            Selected: <b>{selectedIds.length}</b>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              disabled={actionBusy}
              onClick={() => bulk("verify")}
              className="px-4 py-2 text-xs rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {actionBusy ? "Working..." : "Bulk Verify"}
            </button>

            <button
              disabled={actionBusy}
              onClick={() => bulk("publish")}
              className="px-4 py-2 text-xs rounded-md font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {actionBusy ? "Working..." : "Bulk Publish"}
            </button>

            <button
              disabled={actionBusy}
              onClick={() => bulk("archive")}
              className="px-4 py-2 text-xs rounded-md font-semibold bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {actionBusy ? "Working..." : "Bulk Archive"}
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 text-xs rounded-md font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-gray-700">
                <th className="p-4 text-left font-semibold">
                  {manage ? (
                    <input
                      type="checkbox"
                      checked={allSelectedOnPage}
                      onChange={toggleSelectAllOnPage}
                    />
                  ) : null}
                </th>
                <th className="p-4 text-left font-semibold">Type</th>
                <th className="p-4 text-left font-semibold">State</th>
                <th className="p-4 text-left font-semibold">Location</th>
                <th className="p-4 text-left font-semibold">Date</th>
                <th className="p-4 text-left font-semibold">Affected</th>
                <th className="p-4 text-left font-semibold">Fatalities</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-4">
                      <div className="h-4 w-4 bg-gray-100 rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-32 bg-gray-100 rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 bg-gray-100 rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-48 bg-gray-100 rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 bg-gray-100 rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-14 bg-gray-100 rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-14 bg-gray-100 rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-6 w-24 bg-gray-100 rounded-full" />
                    </td>
                    <td className="p-4">
                      <div className="h-8 w-56 bg-gray-100 rounded" />
                    </td>
                  </tr>
                ))
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-600">
                    No incidents found for this filter/search.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr key={incident._id} className="border-t hover:bg-gray-50/60 transition">
                    <td className="p-4">
                      {manage ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(incident._id)}
                          onChange={() => toggleOne(incident._id)}
                        />
                      ) : null}
                    </td>

                    <td className="p-4 font-semibold text-gray-900">
                      {incident.disaster_type || "—"}
                    </td>

                    <td className="p-4 text-gray-700">
                      {incident.state ? titleCase(incident.state) : "—"}
                    </td>

                    <td className="p-4 text-gray-700">
                      <div className="max-w-[260px] truncate">{incident.location || "—"}</div>
                      <div className="text-xs text-gray-500">
                        {incident.latitude}, {incident.longitude}
                      </div>
                    </td>

                    <td className="p-4 text-gray-700">{formatDate(incident.date)}</td>

                    <td className="p-4 text-gray-700">
                      {(incident.affected_population ?? 0).toLocaleString()}
                    </td>

                    <td className="p-4 text-gray-700">
                      {(incident.fatalities ?? 0).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={incident.status} archived={incident.archived} />
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/admin/edit-incident/${incident._id}`)}
                          className="px-3 py-2 text-xs rounded-md border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          Edit
                        </button>

                        {/* NEW: History button */}
                        <Link
                          to={`/admin/incidents/${incident._id}/history`}
                          className="px-3 py-2 text-xs rounded-md border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition"
                          title="View audit/version history"
                        >
                          History
                        </Link>

                        <Link
                          to={`/incidents/${incident._id}`}
                          className={`px-3 py-2 text-xs rounded-md font-semibold transition ${
                            incident.status === "published" && !incident.archived
                              ? "bg-secondary text-white hover:opacity-90"
                              : "bg-gray-100 text-gray-400 pointer-events-none"
                          }`}
                          title={
                            incident.status === "published" && !incident.archived
                              ? "View public page"
                              : "Publish to view publicly"
                          }
                        >
                          View
                        </Link>

                        {manage && !incident.archived && (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  setActionBusy(true);
                                  await updateStatus(incident._id, "verified");
                                  await fetchIncidents();
                                } finally {
                                  setActionBusy(false);
                                }
                              }}
                              disabled={actionBusy}
                              className="px-3 py-2 text-xs rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                              Verify
                            </button>

                            <button
                              onClick={async () => {
                                try {
                                  setActionBusy(true);
                                  await updateStatus(incident._id, "published");
                                  await fetchIncidents();
                                } finally {
                                  setActionBusy(false);
                                }
                              }}
                              disabled={actionBusy}
                              className="px-3 py-2 text-xs rounded-md font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                            >
                              Publish
                            </button>

                            <button
                              onClick={async () => {
                                const ok = window.confirm("Archive this incident?");
                                if (!ok) return;
                                try {
                                  setActionBusy(true);
                                  await archiveIncident(incident._id);
                                  await fetchIncidents();
                                } finally {
                                  setActionBusy(false);
                                }
                              }}
                              disabled={actionBusy}
                              className="px-3 py-2 text-xs rounded-md font-semibold bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-60"
                            >
                              Archive
                            </button>
                          </>
                        )}

                        {manage && incident.archived && (
                          <button
                            onClick={async () => {
                              try {
                                setActionBusy(true);
                                await restoreIncident(incident._id);
                                await fetchIncidents();
                              } finally {
                                setActionBusy(false);
                              }
                            }}
                            disabled={actionBusy}
                            className="px-3 py-2 text-xs rounded-md font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                          >
                            Restore
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={async () => {
                              const ok = window.confirm(
                                "FINAL WARNING: This will permanently delete this incident. Continue?"
                              );
                              if (!ok) return;

                              try {
                                setActionBusy(true);
                                await deleteIncident(incident._id);
                                await fetchIncidents();
                              } finally {
                                setActionBusy(false);
                              }
                            }}
                            disabled={actionBusy}
                            className="px-3 py-2 text-xs rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-white">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 text-sm rounded-md border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Previous
          </button>

          <div className="text-sm text-gray-700">
            Page <b>{page}</b> of <b>{pages}</b>
          </div>

          <button
            disabled={page >= pages || loading}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="px-4 py-2 text-sm rounded-md border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}