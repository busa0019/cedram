import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CreateTraining() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!accessToken) return;

    if (submitting) return;
    setSubmitting(true);

    try {
      await axios.post(`${API_URL}/api/trainings`, form, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      alert("Training created successfully");
      navigate("/admin/trainings");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create training");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold">Create Training</h1>
      <p className="mt-2 text-gray-600">
        Add a workshop and publish it when ready. Registration link should be the Google Form URL.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
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
          placeholder="Summary (shown on the public card)"
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
          <p className="mt-2 text-xs text-gray-500">
            If provided, it will show publicly as “Facilitator: Name”.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="Location (e.g. Abuja)"
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
          placeholder="Registration URL (Google Form)"
          className="w-full border border-gray-200 p-4 rounded-md"
          required
        />

        <button
          disabled={submitting}
          className="bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-secondary transition disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Training"}
        </button>
      </form>
    </section>
  );
}