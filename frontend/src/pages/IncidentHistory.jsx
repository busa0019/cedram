import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatDateTime(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">
      {children}
    </span>
  );
}

function JsonBlock({ title, data }) {
  const [open, setOpen] = useState(false);

  const hasData =
    data &&
    typeof data === "object" &&
    (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="text-sm font-semibold text-gray-800">{title}</div>
        <div className="text-xs font-semibold text-gray-600">
          {hasData ? (open ? "Hide" : "Show") : "Empty"}
        </div>
      </button>

      {open && (
        <pre className="text-xs bg-gray-50 border-t border-gray-100 p-4 overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function IncidentHistory() {
  const { id } = useParams(); // incident id
  const { accessToken } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // IMPORTANT: this is where the new code goes.
      // We ask the server for logs for this incident only.
      const res = await axios.get(`${API_URL}/api/audit/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { incidentId: id }, // <-- query param
      });

      const arr = Array.isArray(res.data) ? res.data : [];

      // In case backend doesn't support incidentId yet, this fallback still works:
      const filtered = arr.filter((log) => {
        const incidentId = log?.incident?._id || log?.incident; // populated or not
        return String(incidentId) === String(id);
      });

      // If the backend supports filtering, `arr` and `filtered` should be the same.
      setLogs(filtered);
    } catch (e) {
      console.error(e);
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        (status === 401
          ? "Unauthorized (401). Your token may be missing/expired, or you are not allowed to access audit logs."
          : "Failed to load audit logs.");

      setErrorMsg(msg);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && id) fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, id]);

  const summary = useMemo(() => {
    const total = logs.length;
    const actions = new Set(logs.map((l) => l.action).filter(Boolean));
    return { total, actions: Array.from(actions) };
  }, [logs]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Incident Version History</h1>
          <p className="mt-2 text-gray-600">
            Audit trail for incident <span className="font-semibold">{id}</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/incidents"
            className="inline-flex justify-center border border-gray-200 bg-white px-5 py-2.5 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            ← Back to Incidents
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-wrap gap-2 text-sm">
        <Pill>Total logs: {summary.total}</Pill>
        {summary.actions.map((a) => (
          <Pill key={a}>Action: {a}</Pill>
        ))}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <div className="h-4 w-56 bg-gray-100 rounded" />
          <div className="mt-4 h-4 w-80 bg-gray-100 rounded" />
          <div className="mt-6 h-24 bg-gray-50 border border-gray-100 rounded-xl" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-600">
          No audit logs found for this incident.
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const by =
              log?.performed_by?.name ||
              log?.performed_by?.email ||
              (log?.performed_by ? String(log.performed_by) : "—");

            return (
              <div
                key={log._id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-500">{formatDateTime(log.createdAt)}</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      {log.action || "ACTION"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {log.previous_status && <Pill>From: {log.previous_status}</Pill>}
                    {log.new_status && <Pill>To: {log.new_status}</Pill>}
                    <Pill>By: {by}</Pill>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <JsonBlock title="Previous Data" data={log.previous_data} />
                  <JsonBlock title="New Data" data={log.new_data} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}