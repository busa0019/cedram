const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    /**
     * ✅ Backward compatible field (existing incident system)
     * Keep this so your current incident audit logs still work.
     */
    incident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisasterIncident",
      default: null,
    },

    /**
     * ✅ NEW (recommended): generic entity support
     * Use this for trainings, publications, etc.
     * Example:
     *   entityType: "training"
     *   entityId: <Training._id>
     */
    entityType: {
      type: String,
      trim: true,
      default: null,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    previous_data: {
      type: Object,
      default: null,
    },

    new_data: {
      type: Object,
      default: null,
    },

    previous_status: {
      type: String,
      default: null,
    },

    new_status: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Helpful indexes 
auditLogSchema.index({ incident: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ performed_by: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);