import { useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DISASTER_TYPES = [
  "Flood",
  "Fire",
  "Earthquake",
  "Windstorm",
  "Storm",
  "Landslide",
  "Drought",
  "Epidemic",
  "Outbreak",
  "Building Collapse",
  "Explosion",
  "Conflict / Violence",
  "Road Accident (Mass casualty)",
  "Other",
];

const inputBase =
  "w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 " +
  "outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary";

export default function CreateIncident() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const fileRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    disaster_type: "",
    state: "",
    location: "",
    latitude: "",
    longitude: "",
    date: "",
    description: "",
    affected_population: 0,
    fatalities: 0,
    response_actions: "",
  });

  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    setErrorMsg("");
    const { name, value } = e.target;

    // force numeric fields to numbers (or empty)
    if (name === "affected_population" || name === "fatalities") {
      setFormData((p) => ({ ...p, [name]: value === "" ? "" : Number(value) }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessToken) return;

    setSaving(true);
    setErrorMsg("");

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      files.forEach((f) => data.append("files", f));

      await axios.post(`${API_URL}/api/incidents`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Incident created successfully");
      navigate("/admin/incidents");
    } catch (error) {
      console.log("ERROR:", error.response?.data || error);
      setErrorMsg(error.response?.data?.message || "Failed to create incident");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
          <h1 className="text-3xl font-semibold text-gray-900">Create Disaster Incident</h1>
          <p className="mt-2 text-gray-600">
            Add a new incident with coordinates so it can appear on the public map after publishing.
          </p>

          {errorMsg && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Disaster Type *
                </label>
                <select
                  name="disaster_type"
                  value={formData.disaster_type}
                  onChange={handleChange}
                  className={inputBase}
                  required
                >
                  <option value="">Select Disaster Type</option>
                  {DISASTER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State *
                </label>
                <input
                  name="state"
                  placeholder="e.g., Lagos"
                  value={formData.state}
                  onChange={handleChange}
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specific Location *
                </label>
                <input
                  name="location"
                  placeholder="e.g., Sabon Gari Market"
                  value={formData.location}
                  onChange={handleChange}
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  name="latitude"
                  placeholder="e.g., 6.5244"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  name="longitude"
                  placeholder="e.g., 3.3792"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  className={inputBase}
                  required
                />
              </div>

              {/* ✅ These were missing in your UI before */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Affected population
                </label>
                <input
                  name="affected_population"
                  type="number"
                  min="0"
                  value={formData.affected_population}
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
                  value={formData.fatalities}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  placeholder="What happened?"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputBase} min-h-[160px]`}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Response actions (optional)
                </label>
                <textarea
                  name="response_actions"
                  placeholder="What response actions were taken?"
                  value={formData.response_actions}
                  onChange={handleChange}
                  className={`${inputBase} min-h-[120px]`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload evidence (optional)
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full"
                  accept="image/png,image/jpeg,application/pdf,video/mp4,video/webm,video/quicktime"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Images, PDFs, and videos allowed.
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                disabled={saving}
                className="bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-secondary transition disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Incident"}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="border border-gray-200 bg-white px-8 py-3 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-500">
              After creating, set status to <b>Published</b> from Incident Management to show on the public map.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}