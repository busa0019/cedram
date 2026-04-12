const rolePermissions = {
  super_admin: [
    "manage_users",
    "manage_incidents",
    "view_analytics",
    "manage_publications",
    "view_audit_logs",
    "manage_field_reports",
    "manage_training",
  ],

  admin: [
    "manage_users",
    "manage_incidents",
    "view_analytics",
    "manage_publications",
    "view_audit_logs",
    "manage_field_reports",
    "manage_training",
  ],

  analyst: [
    "view_analytics",
  ],

  researcher: [
    "manage_incidents",
    "manage_publications",
  ],
};

module.exports = rolePermissions;