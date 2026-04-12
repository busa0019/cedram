import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function EditTraining() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [training, setTraining] = useState(null);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    facilitatorName: "",
    location: "",
    participants: "",
    registrationUrl: "",
  });

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const toDateInput = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toISOString().slice(0, 10);
  };

  const fetchOne = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/trainings/admin/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const t = res.data;
      setTraining(t);

      setForm({
        title: t.title || "",
        summary: t.summary || "",
        startDate: toDateInput(t.startDate),
        endDate: toDateInput(t.endDate),
        startTime: t.startTime || "",
        endTime: t.endTime || "",
        facilitatorName: t.facilitatorName || "",
        location: t.location || "",
        participants: String(t.participants ?? ""),
        registrationUrl: t.registrationUrl || "",
      });
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to load training");
      navigate("/admin/trainings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, id]);

  const save = async (e) => {
    e.preventDefault();
    if (!accessToken) return;

    if (saving) return;
    setSaving(true);

    try {
      await axios.put(`${API_URL}/api/trainings/${id}`, form, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      alert("Updated");
      navigate("/admin/trainings");
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    try {
      await axios.put(
        `${API_URL}/api/trainings/${id}/publish`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await fetchOne();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed");
    }
  };

  const toggleArchive = async () => {
    try {
      await axios.put(
        `${API_URL}/api/trainings/${id}/archive`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await fetchOne();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Edit Training</h1>
          <p className="mt-2 text-gray-600">
            Update details, then publish/unpublish or archive/restore as needed.
          </p>
        </div>

        <Link
          to="/admin/trainings"
          className="px-4 py-2 rounded-md border border-gray-200 font-semibold text-sm hover:bg-gray-50 transition"
        >
          Back
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={togglePublish}
          className={`px-4 py-2 rounded-md font-semibold text-sm transition ${
            training?.isPublished
              ? "bg-gray-700 text-white hover:bg-gray-800"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {training?.isPublished ? "Unpublish" : "Publish"}
        </button>

        <button
          onClick={toggleArchive}
          className={`px-4 py-2 rounded-md font-semibold text-sm transition ${
            training?.archived
              ? "bg-blue-700 text-white hover:bg-blue-800"
              : "bg-amber-600 text-white hover:bg-amber-700"
          }`}
        >
          {training?.archived ? "Restore" : "Archive"}
        </button>
      </div>

      <form onSubmit={save} className="mt-8 space-y-5">
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="Title"
          className="w-full border border-gray-200 p-4 rounded-md"
          required
        />

        <textarea
          name="summary"
          value={form.summary}
          onChange={onChange}
          placeholder="Summary"
          className="w-full border border-gray-200 p-4 rounded-md min-h-[120px]"
          required
        />

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={onChange}
              className="w-full border border-gray-200 p-4 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={onChange}
              className="w-full border border-gray-200 p-4 rounded-md"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={onChange}
              className="w-full border border-gray-200 p-4 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={onChange}
              className="w-full border border-gray-200 p-4 rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Facilitator (optional)
          </label>
          <input
            name="facilitatorName"
            value={form.facilitatorName}
            onChange={onChange}
            placeholder="e.g. Prof. Amina Yusuf (UNILAG)"
            className="w-full border border-gray-200 p-4 rounded-md"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="Location"
            className="w-full border border-gray-200 p-4 rounded-md"
            required
          />
          <input
            name="participants"
            value={form.participants}
            onChange={onChange}
            placeholder="Participants (optional)"
            className="w-full border border-gray-200 p-4 rounded-md"
            inputMode="numeric"
          />
        </div>

        <input
          name="registrationUrl"
          value={form.registrationUrl}
          onChange={onChange}
          placeholder="Registration URL"
          className="w-full border border-gray-200 p-4 rounded-md"
          required
        />

        <button
          disabled={saving}
          className="bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-secondary transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}