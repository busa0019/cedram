import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CreateUser() {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "researcher",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(
        `${API_URL}/api/auth/register`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ User created successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "researcher",
      });

    } catch (error) {
      setMessage("❌ Error creating user");
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">
        Create New User
      </h1>

      {message && (
        <p className="mb-4 text-sm">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        >
          <option value="researcher">Researcher</option>
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="bg-primary text-white px-6 py-3 rounded"
        >
          Create User
        </button>

      </form>
    </div>
  );
}

export default CreateUser;