import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password }
      );

      login(
        {
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        },
        res.data.user
      );

      navigate("/admin/dashboard");

    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <section className="py-28">
      <div className="max-w-md mx-auto bg-white p-10 rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold mb-8">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="bg-primary text-white w-full py-3 rounded-md">
            Login
          </button>
        </form>
      </div>
    </section>
  );
}

export default AdminLogin;