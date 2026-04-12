const express = require("express");
const AuditLog = require("../models/AuditLog");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/admin",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const { incidentId } = req.query;

      const query = incidentId ? { incident: incidentId } : {};

      const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .populate("performed_by", "name email role")
        .populate("incident", "disaster_type state");

      res.json(logs);

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;