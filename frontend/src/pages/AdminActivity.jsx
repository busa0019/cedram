import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminActivity() {
  const { accessToken } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ✅ Define function BEFORE useEffect */
  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/activity`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setActivities(res.data);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchActivities();
    }
  }, [accessToken]);

  if (loading) {
    return <div className="p-6">Loading activity logs...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        User Activity Logs
      </h1>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="bg-white p-4 rounded shadow"
          >
            <p className="font-semibold">
              {activity.user?.name} ({activity.user?.role})
            </p>

            <p className="text-sm text-gray-600">
             {activity.action.replace("/api/", "").replace("/", " → ")}
            </p>

            <p className="text-xs text-gray-400">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminActivity;