import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const inputBase =
  "w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 " +
  "outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary";

export default function EditIncident() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchIncident = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/incidents/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setIncident(res.data);
    } catch (error) {
      console.error("Failed to fetch incident:", error);
      setIncident(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchIncident();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, accessToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "affected_population" || name === "fatalities") {
      setIncident((p) => ({ ...p, [name]: value === "" ? "" : Number(value) }));
      return;
    }

    setIncident((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessToken) return;

    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/incidents/${id}`, incident, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      alert("Incident updated successfully");
      navigate("/admin/incidents");
    } catch (e2) {
      console.error(e2);
      alert(e2.response?.data?.message || "Failed to update incident");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-8">Loading...</p>;
  if (!incident) return <p className="p-8">Incident not found</p>;

  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
          <h1 className="text-3xl font-semibold text-gray-900">Edit Incident</h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>
                <input
                  name="state"
                  value={incident.state || ""}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  name="location"
                  value={incident.location || ""}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  value={incident.latitude ?? ""}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  value={incident.longitude ?? ""}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  name="date"
                  type="date"
                  value={incident.date ? String(incident.date).slice(0, 10) : ""}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={incident.status || "pending"}
                  onChange={handleChange}
                  className={inputBase}
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Affected population
                </label>
                <input
                  name="affected_population"
                  type="number"
                  min="0"
                  value={incident.affected_population ?? 0}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fatalities
                </label>
                <input
                  name="fatalities"
                  type="number"
                  min="0"
                  value={incident.fatalities ?? 0}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={incident.description || ""}
                  onChange={handleChange}
                  className={`${inputBase} min-h-[160px]`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Response actions
                </label>
                <textarea
                  name="response_actions"
                  value={incident.response_actions || ""}
                  onChange={handleChange}
                  className={`${inputBase} min-h-[120px]`}
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                disabled={saving}
                className="bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-secondary transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="border border-gray-200 bg-white px-8 py-3 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}