import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toDateString();
}

function StatusBadge({ isPublished }) {
  return isPublished ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
      Published
    </span>
  ) : (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">
      Draft
    </span>
  );
}

function ArchiveBadge({ archived }) {
  return archived ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100">
      Archived
    </span>
  ) : (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
      Active
    </span>
  );
}

export default function AdminTrainings() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/trainings/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const sorted = useMemo(() => {
    return items
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [items]);

  const togglePublish = async (id) => {
    try {
      setActionId(id);
      await axios.put(
        `${API_URL}/api/trainings/${id}/publish`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to update publish status");
    } finally {
      setActionId(null);
    }
  };

  const toggleArchive = async (id) => {
    try {
      setActionId(id);
      await axios.put(
        `${API_URL}/api/trainings/${id}/archive`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to update archive status");
    } finally {
      setActionId(null);
    }
  };

  const deleteTraining = async (id) => {
    const ok = window.confirm("Delete this training permanently?");
    if (!ok) return;

    try {
      setActionId(id);
      await axios.delete(`${API_URL}/api/trainings/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to delete");
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Trainings & Workshops</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Manage trainings shown on the public Training page. Publish/unpublish, archive/restore, edit, or delete.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={fetchAll}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-md border border-gray-200 font-semibold text-sm hover:bg-white transition"
          >
            Refresh
          </button>

          <Link
            to="/admin/create-training"
            className="inline-flex items-center justify-center bg-primary text-white px-5 py-2.5 rounded-md font-semibold hover:bg-secondary transition"
          >
            + Create Training
          </Link>
        </div>
      </div>

      {!loading && sorted.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-600 shadow-sm">
          No trainings yet. Create your first workshop.
        </div>
      ) : null}

      {/* Mobile cards */}
      <div className="grid gap-4 md:hidden">
        {loading
          ? [...Array(5)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="h-4 w-3/4 bg-gray-100 rounded" />
                <div className="mt-4 h-4 w-1/2 bg-gray-100 rounded" />
                <div className="mt-6 h-10 w-full bg-gray-100 rounded-md" />
              </div>
            ))
          : sorted.map((t) => (
              <div key={t._id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="font-semibold text-gray-900 text-lg leading-snug">{t.title}</div>
                <div className="mt-1 text-sm text-gray-600 line-clamp-2">{t.summary}</div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ArchiveBadge archived={t.archived} />
                  <StatusBadge isPublished={t.isPublished} />
                </div>

                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  <div><span className="font-semibold">Dates:</span> {formatDate(t.startDate)} to {formatDate(t.endDate)}</div>
                  <div><span className="font-semibold">Time:</span> {t.startTime || "—"} - {t.endTime || "—"}</div>
                  {t.facilitatorName ? (
                    <div><span className="font-semibold">Facilitator:</span> {t.facilitatorName}</div>
                  ) : null}
                  <div><span className="font-semibold">Location:</span> {t.location || "—"}</div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/admin/edit-training/${t._id}`)}
                    className="px-3 py-2.5 rounded-md border border-gray-200 font-semibold text-sm hover:bg-gray-50 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => togglePublish(t._id)}
                    disabled={actionId === t._id}
                    className={`px-3 py-2.5 rounded-md font-semibold text-sm transition disabled:opacity-60 ${
                      t.isPublished
                        ? "bg-gray-700 text-white hover:bg-gray-800"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {t.isPublished ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={() => toggleArchive(t._id)}
                    disabled={actionId === t._id}
                    className={`px-3 py-2.5 rounded-md font-semibold text-sm transition disabled:opacity-60 ${
                      t.archived
                        ? "bg-blue-700 text-white hover:bg-blue-800"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                  >
                    {t.archived ? "Restore" : "Archive"}
                  </button>

                  <button
                    onClick={() => deleteTraining(t._id)}
                    disabled={actionId === t._id}
                    className="px-3 py-2.5 rounded-md font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-gray-700">
                <th className="p-4 text-left font-semibold">Title</th>
                <th className="p-4 text-left font-semibold">Dates</th>
                <th className="p-4 text-left font-semibold">Time</th>
                <th className="p-4 text-left font-semibold">Facilitator</th>
                <th className="p-4 text-left font-semibold">Location</th>
                <th className="p-4 text-left font-semibold">State</th>
                <th className="p-4 text-left font-semibold">Visibility</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-4"><div className="h-4 w-64 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-44 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-28 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-40 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-28 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-6 w-24 bg-gray-100 rounded-full" /></td>
                    <td className="p-4"><div className="h-6 w-24 bg-gray-100 rounded-full" /></td>
                    <td className="p-4"><div className="h-8 w-64 bg-gray-100 rounded" /></td>
                  </tr>
                ))
              ) : (
                sorted.map((t) => (
                  <tr key={t._id} className="border-t hover:bg-gray-50/60 transition">
                    <td className="p-4 min-w-[320px]">
                      <div className="font-semibold text-gray-900">{t.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{t.summary}</div>
                    </td>

                    <td className="p-4 text-gray-700">
                      <div>{formatDate(t.startDate)}</div>
                      <div className="text-xs text-gray-500">to {formatDate(t.endDate)}</div>
                    </td>

                    <td className="p-4 text-gray-700">
                      <div className="font-semibold">{t.startTime || "—"} - {t.endTime || "—"}</div>
                    </td>

                    <td className="p-4 text-gray-700">
                      {t.facilitatorName ? (
                        <div className="font-semibold">{t.facilitatorName}</div>
                      ) : (
                        <div className="text-gray-400">—</div>
                      )}
                    </td>

                    <td className="p-4 text-gray-700">{t.location || "—"}</td>

                    <td className="p-4">
                      <ArchiveBadge archived={t.archived} />
                    </td>

                    <td className="p-4">
                      <StatusBadge isPublished={t.isPublished} />
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/admin/edit-training/${t._id}`)}
                          className="px-3 py-2 text-xs rounded-md border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => togglePublish(t._id)}
                          disabled={actionId === t._id}
                          className={`px-3 py-2 text-xs rounded-md font-semibold transition disabled:opacity-60 ${
                            t.isPublished
                              ? "bg-gray-700 text-white hover:bg-gray-800"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {actionId === t._id ? "Working..." : t.isPublished ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          onClick={() => toggleArchive(t._id)}
                          disabled={actionId === t._id}
                          className={`px-3 py-2 text-xs rounded-md font-semibold transition disabled:opacity-60 ${
                            t.archived
                              ? "bg-blue-700 text-white hover:bg-blue-800"
                              : "bg-amber-600 text-white hover:bg-amber-700"
                          }`}
                        >
                          {actionId === t._id ? "Working..." : t.archived ? "Restore" : "Archive"}
                        </button>

                        <button
                          onClick={() => deleteTraining(t._id)}
                          disabled={actionId === t._id}
                          className="px-3 py-2 text-xs rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                        >
                          Delete
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