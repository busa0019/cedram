import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!user) return <div className="p-10">No session found</div>;

  const hasPermission = (permission) => user.permissions?.includes(permission);

  const linkStyle = ({ isActive }) =>
    `block px-4 py-2 rounded-md text-sm transition ${
      isActive ? "bg-secondary text-white" : "text-gray-200 hover:bg-white/10"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-primary text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-white/20 flex justify-between items-center">
          {!collapsed && (
            <span className="text-lg font-semibold">
              {user.role.toUpperCase()} PANEL
            </span>
          )}
          <button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "➤" : "◀"}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-4">
          <NavLink to="/admin/dashboard" className={linkStyle}>
            Dashboard
          </NavLink>

          {hasPermission("manage_incidents") && (
            <>
              <NavLink to="/admin/incidents" className={linkStyle}>
                All Incidents
              </NavLink>
              <NavLink to="/admin/create-incident" className={linkStyle}>
                Create Incident
              </NavLink>
              <NavLink to="/admin/archived-incidents" className={linkStyle}>
                Archived Incidents
              </NavLink>
            </>
          )}

          {hasPermission("manage_field_reports") && (
            <NavLink to="/admin/field-reports" className={linkStyle}>
              Review Field Reports
            </NavLink>
          )}

          {hasPermission("manage_publications") && (
            <>
              <NavLink to="/admin/create-article" className={linkStyle}>
                Create Content
              </NavLink>
              <NavLink to="/admin/publications" className={linkStyle}>
                All Content
              </NavLink>
            </>
          )}

          {hasPermission("manage_trainings") && (
            <>
              <NavLink to="/admin/trainings" className={linkStyle}>
                All Trainings
              </NavLink>
              <NavLink to="/admin/create-training" className={linkStyle}>
                Create Training
              </NavLink>
            </>
          )}

          {hasPermission("view_analytics") && (
            <NavLink to="/admin/analytics" className={linkStyle}>
              Analytics
            </NavLink>
          )}

          {hasPermission("view_audit_logs") && (
            <>
              <NavLink to="/admin/audit-logs" className={linkStyle}>
                Audit Logs
              </NavLink>
              <NavLink to="/admin/activity" className={linkStyle}>
                Activity Logs
              </NavLink>
            </>
          )}

          {hasPermission("manage_users") && (
            <>
              <NavLink to="/admin/users" className={linkStyle}>
                View Users
              </NavLink>
              <NavLink to="/admin/create-user" className={linkStyle}>
                Create User
              </NavLink>
            </>
          )}

          <NavLink to="/admin/profile" className={linkStyle}>
            My Profile
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={logout}
            className="w-full bg-white text-primary py-2 rounded-md text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;