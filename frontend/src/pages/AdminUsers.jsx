import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Search, Mail, Shield, UserCheck, Users, UserX } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminUsers() {
  const { accessToken, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchUsers();
  }, [accessToken]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q);

      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalUsers = users.length;
  const adminCount = users.filter(
    (u) => u.role === "admin" || u.role === "super_admin"
  ).length;
  const researcherCount = users.filter((u) => u.role === "researcher").length;
  const activeCount = users.filter((u) => u.active).length;

  const changeRole = async (id, role) => {
    await axios.put(
      `${API_URL}/api/users/${id}/role`,
      { role },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    fetchUsers();
  };

  const toggleActive = async (id) => {
    await axios.put(
      `${API_URL}/api/users/${id}/toggle`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;

    await axios.delete(`${API_URL}/api/users/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    fetchUsers();
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            User Management
          </h1>
          <p className="mt-2 text-slate-600">
            Manage system users, roles, and account status.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Users" value={totalUsers} color="text-primary" />
        <MetricCard title="Admins" value={adminCount} color="text-red-500" />
        <MetricCard title="Researchers" value={researcherCount} color="text-blue-500" />
        <MetricCard title="Active" value={activeCount} color="text-green-500" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-primary"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-primary"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">super_admin</option>
            <option value="admin">admin</option>
            <option value="analyst">analyst</option>
            <option value="researcher">researcher</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50">
              <tr className="text-slate-700">
                <th className="p-4 text-left font-semibold">User</th>
                <th className="p-4 text-left font-semibold">Email</th>
                <th className="p-4 text-left font-semibold">Role</th>
                <th className="p-4 text-left font-semibold">Created</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-8 text-center text-slate-500" colSpan={6}>
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td className="p-8 text-center text-slate-500" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                          {u.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-500">{u._id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-700">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" />
                        {u.email}
                      </div>
                    </td>

                    <td className="p-4">
                      {user?.role === "super_admin" ? (
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u._id, e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2"
                        >
                          <option value="super_admin">super_admin</option>
                          <option value="admin">admin</option>
                          <option value="analyst">analyst</option>
                          <option value="researcher">researcher</option>
                        </select>
                      ) : (
                        <RoleBadge role={u.role} />
                      )}
                    </td>

                    <td className="p-4 text-slate-600">
                      {u.createdAt
                        ? new Date(u.createdAt).toISOString().slice(0, 10)
                        : "—"}
                    </td>

                    <td className="p-4">
                      <StatusBadge active={u.active} />
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleActive(u._id)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${
                            u.active
                              ? "bg-slate-700 hover:bg-slate-800"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {u.active ? "Disable" : "Enable"}
                        </button>

                        {user?.role === "super_admin" && (
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ title, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`text-5xl font-semibold ${color}`}>{value}</div>
      <p className="mt-3 text-sm text-slate-600">{title}</p>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    super_admin: "bg-red-50 text-red-700 border-red-100",
    admin: "bg-orange-50 text-orange-700 border-orange-100",
    analyst: "bg-green-50 text-green-700 border-green-100",
    researcher: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[role] || "bg-slate-50 text-slate-700 border-slate-100"
      }`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-100">
      active
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
      inactive
    </span>
  );
}

export default AdminUsers;