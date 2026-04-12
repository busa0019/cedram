import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminProfile() {
  const { user, token } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const updateProfile = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.put(
        `${API_URL}/api/profile/me`,
        { name, email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Profile updated successfully");

    } catch (error) {
      setMessage("❌ Failed to update profile");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.put(
        `${API_URL}/api/profile/me/password`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");

    } catch (error) {
      setMessage("❌ Password change failed");
    }
  };

  return (
    <div className="max-w-2xl space-y-10">

      <h1 className="text-2xl font-semibold">
        My Profile
      </h1>

      {message && <p className="text-sm">{message}</p>}

      {/* Profile Info */}
      <form onSubmit={updateProfile} className="space-y-4">
        <h2 className="font-semibold">Profile Information</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <button className="bg-primary text-white px-6 py-2 rounded">
          Update Profile
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={changePassword} className="space-y-4">
        <h2 className="font-semibold">Change Password</h2>

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border p-3 rounded"
          required
        />

        <button className="bg-secondary text-white px-6 py-2 rounded">
          Change Password
        </button>
      </form>

      <div className="text-sm text-gray-500">
        <p>Role: {user?.role}</p>
        <p>Account Created: {new Date(user?.createdAt).toLocaleDateString()}</p>
      </div>

    </div>
  );
}

export default AdminProfile;