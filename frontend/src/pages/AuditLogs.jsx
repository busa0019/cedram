import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AuditLogs() {
  const { accessToken } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/audit/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLogs(res.data);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchLogs();
    }
  }, [accessToken]);

  if (loading) {
    return <div className="p-6">Loading audit logs...</div>;
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold mb-8">
        Audit Log History
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Performed By</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Incident</th>
              <th className="p-4 text-left">Action</th>
              <th className="p-4 text-left">Previous</th>
              <th className="p-4 text-left">New</th>
              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-t">
                <td className="p-4">
                  {log.performed_by?.name || "Unknown"}
                </td>
                <td className="p-4">
                  {log.performed_by?.role || "—"}
                </td>
                <td className="p-4">
                  {log.incident?.disaster_type || "—"} — {log.incident?.state || ""}
                </td>
                <td className="p-4">{log.action}</td>
                <td className="p-4">{log.previous_status || "—"}</td>
                <td className="p-4">{log.new_status || "—"}</td>
                <td className="p-4">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AuditLogs;