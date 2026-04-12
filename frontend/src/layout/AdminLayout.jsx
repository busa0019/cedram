import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  AlertTriangle,
  PlusCircle,
  Archive,
  FileSearch,
  FilePlus,
  FileText,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Activity,
  Users,
  UserPlus,
  User,
  LogOut,
} from "lucide-react";

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
            <span className="flex items-center gap-3">
              <LayoutDashboard size={18} />
              {!collapsed && "Dashboard"}
            </span>
          </NavLink>

          {hasPermission("manage_incidents") && (
            <>
              <NavLink to="/admin/incidents" className={linkStyle}>
                <span className="flex items-center gap-3">
                  <AlertTriangle size={18} />
                  {!collapsed && "All Incidents"}
                </span>
              </NavLink>
              <NavLink to="/admin/create-incident" className={linkStyle}>
                <span className="flex items-center gap-3">
                  <PlusCircle size={18} />
                  {!collapsed && "Create Incident"}
                </span>
              </NavLink>
              <NavLink to="/admin/archived-incidents" className={linkStyle}>
                <span className="flex items-center gap-3">
                  <Archive size={18} />
                  {!collapsed && "Archived Incidents"}
                </span>
              </NavLink>
            </>
          )}

          {hasPermission("manage_field_reports") && (
            <NavLink to="/admin/field-reports" className={linkStyle}>
              <span className="flex items-center gap-3">
                <FileSearch size={18} />
                {!collapsed && "Review Field Reports"}
              </span>
            </NavLink>
          )}

          {hasPermission("manage_publications") && (
            <>
              <NavLink to="/admin/create-article" className={linkStyle}>
                <span className="flex items-center gap-3">
                  <FilePlus size={18} />
                  {!collapsed && "Create Content"}
                </span>
              </NavLink>
              <NavLink to="/admin/publications" className={linkStyle}>
                <span className="flex items-center gap-3">
                  <FileText size={18} />
                  {!collapsed && "All Content"}
                </span>
              </NavLink>
            </>
          )}

          {hasPermission("manage_trainings") && (
            <>
              <NavLink to="/admin/trainings" className={linkStyle}>
                <span className="flex items-center gap-3">
                  <GraduationCap size={18} />
                  {!collapsed && "All Trainings"}
                </span>
              </NavLink>
              <NavLink to="/admin/create-training" className={linkStyle}>
                <span className="flex items-center gap-3">
                  <PlusCircle size={18} />
                  {!collapsed && "Create Training"}
                </span>
              </NavLink>
            </>
          )}

          {hasPermission("view_analytics") && (
            <NavLink to="/admin/analytics" className={linkStyle}>
              <span className="flex items-center gap-3">
                <BarChart3 size={18} />
                {!collapsed && "Analytics"}
              </span>
            </NavLink>
          )}

          {hasPermission("view_audit_logs") && (
            <>
              <NavLink to="/admin/audit-logs" className={linkStyle}>
                <span className="flex items-center gap-3">
                  <ShieldCheck size={18} />
                  {!collapsed && "Audit Logs"}
                </span>
              </NavLink>
              <NavLink to="/admin/activity" className={linkStyle}>
                <span className="flex items-center gap-3">
                  <Activity size={18} />
                  {!collapsed && "Activity Logs"}
                </span>
              </NavLink>
            </>
          )}

          {hasPermission("manage_users") && (
            <>
              <NavLink to="/admin/users" className={linkStyle}>
                <span className="flex items-center gap-3">
                  <Users size={18} />
                  {!collapsed && "View Users"}
                </span>
              </NavLink>
              <NavLink to="/admin/create-user" className={linkStyle}>
                <span className="flex items-center gap-3">
                  <UserPlus size={18} />
                  {!collapsed && "Create User"}
                </span>
              </NavLink>
            </>
          )}

          <NavLink to="/admin/profile" className={linkStyle}>
            <span className="flex items-center gap-3">
              <User size={18} />
              {!collapsed && "My Profile"}
            </span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={logout}
            className="w-full bg-white text-primary py-2 rounded-md text-sm font-semibold"
          >
            <span className="flex items-center justify-center gap-2">
              <LogOut size={18} />
              {!collapsed && "Logout"}
            </span>
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