import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Eye,
  CheckCircle2,
  XCircle,
  Search,
  MapPin,
  CalendarDays,
  User,
  Mail,
  FileText,
  Image as ImageIcon,
  Video,
  FileBadge,
  ShieldCheck,
  Clock3,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StatusBadge({ status }) {
  const map = {
    pending: "bg-yellow-50 text-yellow-800 border-yellow-100",
    approved: "bg-green-50 text-green-800 border-green-100",
    rejected: "bg-red-50 text-red-800 border-red-100",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
        map[status] || "bg-gray-50 text-gray-700 border-gray-100"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toDateString();
}

function isVideoUrl(url = "") {
  return /\.(mp4|webm|mov|mkv|avi)(\?|#|$)/i.test(url);
}
function isImageUrl(url = "") {
  return /\.(png|jpg|jpeg|webp|gif)(\?|#|$)/i.test(url);
}
function isPdfOrDoc(url = "") {
  return /\.(pdf|doc|docx)(\?|#|$)/i.test(url);
}

function KindBadge({ kind }) {
  const map = {
    image: "bg-blue-50 text-blue-800 border-blue-100",
    video: "bg-purple-50 text-purple-800 border-purple-100",
    document: "bg-gray-100 text-gray-800 border-gray-200",
    other: "bg-gray-50 text-gray-700 border-gray-100",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        map[kind] || map.other
      }`}
    >
      {kind || "other"}
    </span>
  );
}

function normalizeEvidence(report) {
  if (Array.isArray(report?.evidence) && report.evidence.length > 0) {
    return report.evidence
      .filter((e) => e?.url)
      .map((e) => ({
        url: e.url,
        kind: e.kind || "other",
        originalName: e.originalName || "",
        mimeType: e.mimeType || "",
        bytes: e.bytes || null,
      }));
  }

  if (Array.isArray(report?.images) && report.images.length > 0) {
    return report.images
      .filter(Boolean)
      .map((url) => ({
        url,
        kind: "image",
        originalName: "",
        mimeType: "",
        bytes: null,
      }));
  }

  return [];
}

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function SummaryCard({ title, value, icon, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}
      >
        {icon}
      </div>
      <div className="mt-4 text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{title}</div>
    </div>
  );
}

export default function AdminFieldReports() {
  const { accessToken } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/field-reports/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchReports();
  }, [accessToken]);

  const approve = async (id) => {
    const ok = window.confirm("Approve this report and convert it to an incident?");
    if (!ok) return;

    try {
      setActionId(id);
      await axios.put(
        `${API_URL}/api/field-reports/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await fetchReports();
      setOpen(false);
      setSelected(null);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to approve report");
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id) => {
    const ok = window.confirm("Reject this report?");
    if (!ok) return;

    try {
      setActionId(id);
      await axios.put(
        `${API_URL}/api/field-reports/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await fetchReports();
      setOpen(false);
      setSelected(null);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to reject report");
    } finally {
      setActionId(null);
    }
  };

  const stats = useMemo(() => {
    const pending = reports.filter((r) => r.status === "pending").length;
    const approved = reports.filter((r) => r.status === "approved").length;
    const rejected = reports.filter((r) => r.status === "rejected").length;
    return { pending, approved, rejected, total: reports.length };
  }, [reports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return reports.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;

      const hay = [
        r.disaster_type,
        r.location,
        r.state,
        r.specific_location,
        r.reporter_name,
        r.reporter_email,
        r.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [reports, statusFilter, query]);

  const selectedEvidence = useMemo(() => normalizeEvidence(selected), [selected]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Field Report Review
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Review community-submitted reports. Approved reports can be converted
            into verified incident records for institutional use.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Reports"
          value={stats.total}
          icon={<FileText size={20} />}
          tone="slate"
        />
        <SummaryCard
          title="Pending"
          value={stats.pending}
          icon={<Clock3 size={20} />}
          tone="yellow"
        />
        <SummaryCard
          title="Approved"
          value={stats.approved}
          icon={<CheckCircle2 size={20} />}
          tone="green"
        />
        <SummaryCard
          title="Rejected"
          value={stats.rejected}
          icon={<XCircle size={20} />}
          tone="red"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "approved", label: "Approved" },
              { key: "rejected", label: "Rejected" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setStatusFilter(t.key)}
                className={classNames(
                  "px-3 py-2 text-xs font-semibold rounded-lg border transition",
                  statusFilter === t.key
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:ml-auto lg:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by type, location, reporter..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="h-4 w-40 rounded bg-slate-100" />
              <div className="mt-3 h-3 w-56 rounded bg-slate-100" />
              <div className="mt-4 h-8 w-28 rounded bg-slate-100" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
            No field reports found.
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">
                    {r.disaster_type || "—"}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {r.location || "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Submitted {formatDate(r.createdAt)}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelected(r);
                    setOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-secondary"
                >
                  <Eye size={15} />
                  View
                </button>

                {r.status === "pending" && (
                  <>
                    <button
                      onClick={() => approve(r._id)}
                      disabled={actionId === r._id}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                    >
                      <CheckCircle2 size={15} />
                      {actionId === r._id ? "Working..." : "Approve"}
                    </button>

                    <button
                      onClick={() => reject(r._id)}
                      disabled={actionId === r._id}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                      <XCircle size={15} />
                      {actionId === r._id ? "Working..." : "Reject"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-slate-700">
                <th className="p-4 text-left font-semibold">Type</th>
                <th className="p-4 text-left font-semibold">Location</th>
                <th className="p-4 text-left font-semibold">Submitted</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                    <td className="p-4"><div className="h-4 w-56 rounded bg-slate-100" /></td>
                    <td className="p-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="p-4"><div className="h-6 w-24 rounded-full bg-slate-100" /></td>
                    <td className="p-4"><div className="h-8 w-44 rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-600">
                    No field reports found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r._id}
                    className="border-t border-slate-100 hover:bg-slate-50/60 transition"
                  >
                    <td className="p-4 font-semibold text-slate-900">
                      {r.disaster_type || "—"}
                    </td>

                    <td className="p-4 text-slate-700">
                      <div>{r.location || "—"}</div>
                      {(r.state || r.specific_location) && (
                        <div className="text-xs text-slate-500">
                          {r.specific_location ? r.specific_location : ""}
                          {r.specific_location && r.state ? ", " : ""}
                          {r.state ? r.state : ""}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-slate-700">{formatDate(r.createdAt)}</td>

                    <td className="p-4">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setSelected(r);
                            setOpen(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => approve(r._id)}
                              disabled={actionId === r._id}
                              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition disabled:opacity-60"
                            >
                              <CheckCircle2 size={14} />
                              {actionId === r._id ? "Working..." : "Approve"}
                            </button>

                            <button
                              onClick={() => reject(r._id)}
                              disabled={actionId === r._id}
                              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-60"
                            >
                              <XCircle size={14} />
                              {actionId === r._id ? "Working..." : "Reject"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setOpen(false);
              setSelected(null);
            }}
          />

          <div className="relative flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
              <div className="min-w-0">
                <div className="truncate text-xl font-semibold text-slate-900">
                  {selected.disaster_type || "Field Report"}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span>Submitted {formatDate(selected.createdAt)}</span>
                  <span className="text-slate-300">•</span>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  setSelected(null);
                }}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard
                  icon={<User size={16} />}
                  title="Reporter"
                  lines={[
                    selected.reporter_name || "—",
                    selected.reporter_email || "—",
                  ]}
                />

                <InfoCard
                  icon={<CalendarDays size={16} />}
                  title="Incident Info"
                  lines={[
                    `Date: ${
                      selected.incident_date
                        ? formatDate(selected.incident_date)
                        : "—"
                    }`,
                    `Location: ${selected.location || "—"}`,
                  ]}
                />

                <InfoCard
                  icon={<MapPin size={16} />}
                  title="Place Details"
                  lines={[
                    `State: ${selected.state || "—"}`,
                    `Specific Location: ${selected.specific_location || "—"}`,
                  ]}
                />

                <InfoCard
                  icon={<ShieldCheck size={16} />}
                  title="Current Status"
                  lines={[selected.status || "unknown"]}
                />
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {selected.description || "—"}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Evidence
                </div>

                {selectedEvidence.length ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {selectedEvidence.map((e, idx) => {
                      const url = e.url;
                      const inferredKind =
                        e.kind && e.kind !== "other"
                          ? e.kind
                          : isImageUrl(url)
                          ? "image"
                          : isVideoUrl(url)
                          ? "video"
                          : isPdfOrDoc(url)
                          ? "document"
                          : "other";

                      return (
                        <div
                          key={`${url}-${idx}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-sm font-semibold text-slate-800">
                                  File {idx + 1}
                                </div>
                                <KindBadge kind={inferredKind} />
                              </div>
                              {e.originalName ? (
                                <div className="mt-1 truncate text-xs text-slate-500">
                                  {e.originalName}
                                </div>
                              ) : null}
                            </div>

                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 text-sm font-semibold text-secondary hover:underline"
                            >
                              Open
                            </a>
                          </div>

                          <div className="mt-3">
                            {inferredKind === "image" ? (
                              <div>
                                <div className="mb-2 inline-flex items-center gap-2 text-xs text-slate-500">
                                  <ImageIcon size={14} />
                                  Image Preview
                                </div>
                                <img
                                  src={url}
                                  alt={`Evidence ${idx + 1}`}
                                  className="h-[220px] w-full rounded-lg border border-slate-200 bg-white object-contain"
                                />
                              </div>
                            ) : inferredKind === "video" ? (
                              <div>
                                <div className="mb-2 inline-flex items-center gap-2 text-xs text-slate-500">
                                  <Video size={14} />
                                  Video Preview
                                </div>
                                <video
                                  src={url}
                                  controls
                                  className="h-[220px] w-full rounded-lg bg-black"
                                />
                              </div>
                            ) : inferredKind === "document" ? (
                              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                                <div className="inline-flex items-center gap-2">
                                  <FileBadge size={16} />
                                  Document uploaded. Use “Open” to view.
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                                File uploaded. Use “Open” to view.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">No evidence uploaded.</div>
                )}
              </div>
            </div>

            {selected.status === "pending" && (
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white p-6">
                <button
                  onClick={() => reject(selected._id)}
                  disabled={actionId === selected._id}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60"
                >
                  <XCircle size={16} />
                  {actionId === selected._id ? "Working..." : "Reject"}
                </button>

                <button
                  onClick={() => approve(selected._id)}
                  disabled={actionId === selected._id}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition disabled:opacity-60"
                >
                  <CheckCircle2 size={16} />
                  {actionId === selected._id ? "Working..." : "Approve & Convert"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function InfoCard({ icon, title, lines = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {title}
      </div>
      <div className="space-y-1 text-sm text-slate-800">
        {lines.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
    </div>
  );
}