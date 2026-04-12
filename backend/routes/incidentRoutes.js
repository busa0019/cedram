const express = require("express");
const DisasterIncident = require("../models/DisasterIncident");
const { protect, authorizePermissions } = require("../middleware/authMiddleware");
const AuditLog = require("../models/AuditLog");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

/* ✅ Normalize State */
const normalizeState = (state) => String(state || "").trim().toLowerCase();

/* ✅ Snapshot helper for audit log before/after */
const snapshot = (doc) => {
  if (!doc) return null;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return obj;
};

/* -------------------------------------------------------
   ✅ PUBLIC ENDPOINTS (must be ABOVE "/:id" admin route)
-------------------------------------------------------- */

/**
 * ✅ PUBLIC SUMMARY (Homepage Stats)
 * GET /api/incidents/public/summary
 */
router.get("/public/summary", async (req, res) => {
  try {
    const match = { status: "published", archived: false };

    const [summary] = await DisasterIncident.aggregate([
      { $match: match },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalIncidents: { $sum: 1 },
                totalAffected: { $sum: "$affected_population" },
                totalFatalities: { $sum: "$fatalities" },
                lastUpdatedAt: { $max: "$updatedAt" },
                minDate: { $min: "$date" },
                maxDate: { $max: "$date" },
              },
            },
          ],
          states: [{ $group: { _id: "$state" } }, { $count: "statesCovered" }],
        },
      },
      {
        $project: {
          totalIncidents: { $ifNull: [{ $arrayElemAt: ["$totals.totalIncidents", 0] }, 0] },
          totalAffected: { $ifNull: [{ $arrayElemAt: ["$totals.totalAffected", 0] }, 0] },
          totalFatalities: { $ifNull: [{ $arrayElemAt: ["$totals.totalFatalities", 0] }, 0] },
          lastUpdatedAt: { $arrayElemAt: ["$totals.lastUpdatedAt", 0] },
          minDate: { $arrayElemAt: ["$totals.minDate", 0] },
          maxDate: { $arrayElemAt: ["$totals.maxDate", 0] },
          statesCovered: { $ifNull: [{ $arrayElemAt: ["$states.statesCovered", 0] }, 0] },
        },
      },
    ]);

    const minYear = summary?.minDate ? new Date(summary.minDate).getFullYear() : null;
    const maxYear = summary?.maxDate ? new Date(summary.maxDate).getFullYear() : null;
    const yearsOfCoverage = minYear && maxYear ? maxYear - minYear + 1 : 0;

    res.json({
      totalIncidents: summary?.totalIncidents || 0,
      totalAffected: summary?.totalAffected || 0,
      totalFatalities: summary?.totalFatalities || 0,
      statesCovered: summary?.statesCovered || 0,
      yearsOfCoverage,
      minYear,
      maxYear,
      lastUpdatedAt: summary?.lastUpdatedAt || null,
    });
  } catch (error) {
    console.error("Public summary error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ PUBLIC LATEST (Homepage Latest Incidents)
// GET /api/incidents/public/latest?limit=6
router.get("/public/latest", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);

    const incidents = await DisasterIncident.find({
      status: "published",
      archived: false,
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .select(
        "disaster_type state location date status affected_population fatalities latitude longitude description createdAt updatedAt"
      );

    res.json(incidents);
  } catch (error) {
    console.error("Public latest error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ PUBLIC SINGLE INCIDENT (Details Page)
 * GET /api/incidents/public/:id
 */
router.get("/public/:id", async (req, res) => {
  try {
    const incident = await DisasterIncident.findOne({
      _id: req.params.id,
      status: "published",
      archived: false,
    }).select(
      "disaster_type state location latitude longitude date description affected_population fatalities response_actions images attachments status createdAt updatedAt"
    );

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ✅ PUBLIC INCIDENTS LIST (for map)
   GET /api/incidents
*/
router.get("/", async (req, res) => {
  try {
    const incidents = await DisasterIncident.find({
      status: "published",
      archived: false,
    });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* -------------------------------------------------------
   ✅ ADMIN / PROTECTED ENDPOINTS
-------------------------------------------------------- */

/* ✅ CREATE INCIDENT */
router.post(
  "/",
  protect,
  authorizePermissions("manage_incidents"),
  upload.array("files", 5),
  async (req, res) => {
    try {
      const fileUrls = req.files ? req.files.map((file) => file.path) : [];

      const incident = await DisasterIncident.create({
        disaster_type: req.body.disaster_type,
        state: normalizeState(req.body.state),
        location: req.body.location,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        date: req.body.date,
        description: req.body.description,
        affected_population: req.body.affected_population || 0,
        fatalities: req.body.fatalities || 0,
        response_actions: req.body.response_actions,
        images: req.body.images || [],
        attachments: fileUrls,
        status: "pending",
        created_by: req.user._id,
      });

      // Optional: create audit entry for create
      await AuditLog.create({
        incident: incident._id,
        action: "CREATE",
        performed_by: req.user._id,
        previous_data: null,
        new_data: snapshot(incident),
      });

      res.status(201).json(incident);
    } catch (error) {
      console.error("Create incident error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ GET INCIDENTS (Admin View) */
router.get(
  "/admin",
  protect,
  authorizePermissions("manage_incidents"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const total = await DisasterIncident.countDocuments();

      const incidents = await DisasterIncident.find()
        .populate("created_by", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        total,
        page,
        pages: Math.ceil(total / limit),
        incidents,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ GET SINGLE INCIDENT (Admin protected) */
router.get(
  "/:id",
  protect,
  authorizePermissions("manage_incidents"),
  async (req, res) => {
    try {
      const incident = await DisasterIncident.findById(req.params.id);
      if (!incident) return res.status(404).json({ message: "Incident not found" });
      res.json(incident);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ UPDATE INCIDENT (FULL EDIT) */
router.put(
  "/:id",
  protect,
  authorizePermissions("manage_incidents"),
  async (req, res) => {
    try {
      const existing = await DisasterIncident.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: "Incident not found" });

      const before = snapshot(existing);

      if (req.body.state) req.body.state = normalizeState(req.body.state);

      const updated = await DisasterIncident.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      const after = snapshot(updated);

      await AuditLog.create({
        incident: updated._id,
        action: "FULL_EDIT",
        performed_by: req.user._id,
        previous_data: before,
        new_data: after,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ UPDATE STATUS */
router.put(
  "/:id/status",
  protect,
  authorizePermissions("manage_incidents"),
  async (req, res) => {
    try {
      const incident = await DisasterIncident.findById(req.params.id);
      if (!incident) return res.status(404).json({ message: "Incident not found" });

      const before = snapshot(incident);
      const previousStatus = incident.status;

      incident.status = req.body.status;
      await incident.save();

      const after = snapshot(incident);

      await AuditLog.create({
        incident: incident._id,
        action: "STATUS_UPDATE",
        performed_by: req.user._id,
        previous_status: previousStatus,
        new_status: req.body.status,
        previous_data: before,
        new_data: after,
      });

      res.json(incident);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ ARCHIVE INCIDENT */
router.put(
  "/:id/archive",
  protect,
  authorizePermissions("manage_incidents"),
  async (req, res) => {
    try {
      const existing = await DisasterIncident.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: "Incident not found" });

      const before = snapshot(existing);

      const updated = await DisasterIncident.findByIdAndUpdate(
        req.params.id,
        { archived: true },
        { new: true, runValidators: true }
      );

      const after = snapshot(updated);

      await AuditLog.create({
        incident: updated._id,
        action: "ARCHIVE",
        performed_by: req.user._id,
        previous_data: before,
        new_data: after,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ RESTORE ARCHIVED INCIDENT */
router.put(
  "/:id/restore",
  protect,
  authorizePermissions("manage_incidents"),
  async (req, res) => {
    try {
      const existing = await DisasterIncident.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: "Incident not found" });

      const before = snapshot(existing);

      const updated = await DisasterIncident.findByIdAndUpdate(
        req.params.id,
        { archived: false },
        { new: true, runValidators: true }
      );

      const after = snapshot(updated);

      await AuditLog.create({
        incident: updated._id,
        action: "RESTORE",
        performed_by: req.user._id,
        previous_data: before,
        new_data: after,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ DELETE INCIDENT */
router.delete(
  "/:id",
  protect,
  authorizePermissions("manage_incidents"),
  async (req, res) => {
    try {
      const incident = await DisasterIncident.findById(req.params.id);
      if (!incident) return res.status(404).json({ message: "Incident not found" });

      const before = snapshot(incident);

      await AuditLog.create({
        incident: incident._id,
        action: "DELETE",
        performed_by: req.user._id,
        previous_data: before,
        new_data: null,
      });

      await DisasterIncident.findByIdAndDelete(req.params.id);

      res.json({ message: "Incident deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;