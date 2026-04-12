import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function DataPreview() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/analytics/public/incidents-by-year`)
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="bg-surface py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
            Trend analysis
          </div>

          <h2 className="mt-5 text-3xl font-semibold text-primary">
            National disaster trends
          </h2>

          <p className="mt-4 leading-relaxed text-textmuted">
            A simplified longitudinal view of incident counts over time, supporting pattern analysis and research interpretation.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-muted p-6 md:p-10 shadow-sm">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
              <XAxis dataKey="_id" stroke="rgb(var(--color-text-muted))" />
              <YAxis stroke="rgb(var(--color-text-muted))" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="rgb(var(--color-primary))"
                strokeWidth={3}
                dot={{ fill: "rgb(var(--color-accent))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export default DataPreview;