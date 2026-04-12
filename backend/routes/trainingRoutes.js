const express = require("express");
const Training = require("../models/Training");
const AuditLog = require("../models/AuditLog");
const { protect, authorizePermissions } = require("../middleware/authMiddleware");

const router = express.Router();

const snapshot = (doc) => {
  if (!doc) return null;
  return typeof doc.toObject === "function" ? doc.toObject() : doc;
};

const isValidUrl = (s = "") => {
  try {
    const u = new URL(String(s));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const isTimeHHMM = (s = "") =>
  /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(s || "").trim());

/**
 * ✅ Prevent date shifting across timezones:
 * Take "YYYY-MM-DD" and store as UTC 12:00 (noon).
 * Noon UTC avoids rolling back a day in many timezones.
 */
function parseDateOnlyToUTCNoon(dateStr) {
  const s = String(dateStr || "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;

  const yyyy = Number(m[1]);
  const mm = Number(m[2]);
  const dd = Number(m[3]);

  const dt = new Date(Date.UTC(yyyy, mm - 1, dd, 12, 0, 0)); // noon UTC
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

/* =========================================================
   ✅ PUBLIC
========================================================= */

/**
 * GET /api/trainings/public/upcoming?limit=9
 * Only published + not archived + startDate >= today
 */
router.get("/public/upcoming", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 9, 50);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trainings = await Training.find({
      isPublished: true,
      archived: false,
      startDate: { $gte: today },
    })
      .sort({ startDate: 1 })
      .limit(limit)
      .select(
        "title summary startDate endDate startTime endTime facilitatorName location participants registrationUrl"
      );

    res.json(trainings);
  } catch (error) {
    console.error("Upcoming trainings error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   ✅ ADMIN / PROTECTED
========================================================= */

/**
 * POST /api/trainings
 */
router.post(
  "/",
  protect,
  authorizePermissions("manage_trainings"),
  async (req, res) => {
    try {
      const {
        title,
        summary,
        startDate,
        endDate,
        startTime,
        endTime,
        facilitatorName,
        location,
        participants,
        registrationUrl,
      } = req.body;

      if (!title?.trim())
        return res.status(400).json({ message: "Title is required" });
      if (!summary?.trim())
        return res.status(400).json({ message: "Summary is required" });

      if (!startDate)
        return res.status(400).json({ message: "Start date is required" });
      if (!endDate)
        return res.status(400).json({ message: "End date is required" });

      if (!startTime?.trim())
        return res.status(400).json({ message: "Start time is required" });
      if (!endTime?.trim())
        return res.status(400).json({ message: "End time is required" });
      if (!isTimeHHMM(startTime))
        return res.status(400).json({ message: "Start time must be HH:mm" });
      if (!isTimeHHMM(endTime))
        return res.status(400).json({ message: "End time must be HH:mm" });

      if (!location?.trim())
        return res.status(400).json({ message: "Location is required" });

      if (!registrationUrl?.trim())
        return res.status(400).json({ message: "Registration URL is required" });
      if (!isValidUrl(registrationUrl)) {
        return res
          .status(400)
          .json({ message: "Registration URL must be a valid http(s) link" });
      }

      const s = parseDateOnlyToUTCNoon(startDate);
      const e = parseDateOnlyToUTCNoon(endDate);
      if (!s || !e)
        return res
          .status(400)
          .json({ message: "Dates must be in YYYY-MM-DD format" });
      if (e < s)
        return res
          .status(400)
          .json({ message: "End date cannot be earlier than start date" });

      const training = await Training.create({
        title: title.trim(),
        summary: summary.trim(),
        startDate: s,
        endDate: e,
        startTime: String(startTime).trim(),
        endTime: String(endTime).trim(),
        facilitatorName: String(facilitatorName || "").trim(),
        location: location.trim(),
        participants: Number(participants) || 0,
        registrationUrl: registrationUrl.trim(),
        isPublished: false,
        archived: false,
        created_by: req.user._id,
      });

      await AuditLog.create({
        entityType: "training",
        entityId: training._id,
        action: "CREATE",
        performed_by: req.user._id,
        previous_data: null,
        new_data: snapshot(training),
      });

      res.status(201).json(training);
    } catch (error) {
      console.error("Create training error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * GET /api/trainings/admin
 */
router.get(
  "/admin",
  protect,
  authorizePermissions("manage_trainings"),
  async (req, res) => {
    try {
      const trainings = await Training.find()
        .sort({ createdAt: -1 })
        .populate("created_by", "name email");

      res.json(trainings);
    } catch (error) {
      console.error("Admin trainings list error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * GET /api/trainings/admin/:id
 */
router.get(
  "/admin/:id",
  protect,
  authorizePermissions("manage_trainings"),
  async (req, res) => {
    try {
      const training = await Training.findById(req.params.id).populate(
        "created_by",
        "name email"
      );
      if (!training)
        return res.status(404).json({ message: "Training not found" });
      res.json(training);
    } catch (error) {
      console.error("Admin training get error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * PUT /api/trainings/:id
 */
router.put(
  "/:id",
  protect,
  authorizePermissions("manage_trainings"),
  async (req, res) => {
    try {
      const existing = await Training.findById(req.params.id);
      if (!existing)
        return res.status(404).json({ message: "Training not found" });

      const before = snapshot(existing);
      const patch = { ...req.body };

      if (patch.registrationUrl !== undefined) {
        if (!String(patch.registrationUrl || "").trim()) {
          return res
            .status(400)
            .json({ message: "Registration URL cannot be empty" });
        }
        if (!isValidUrl(patch.registrationUrl)) {
          return res
            .status(400)
            .json({ message: "Registration URL must be a valid http(s) link" });
        }
        patch.registrationUrl = String(patch.registrationUrl).trim();
      }

      if (patch.title !== undefined) patch.title = String(patch.title).trim();
      if (patch.summary !== undefined)
        patch.summary = String(patch.summary).trim();
      if (patch.location !== undefined)
        patch.location = String(patch.location).trim();

      if (patch.participants !== undefined)
        patch.participants = Number(patch.participants) || 0;

      if (patch.facilitatorName !== undefined) {
        patch.facilitatorName = String(patch.facilitatorName || "").trim();
      }

      if (patch.startTime !== undefined) {
        const st = String(patch.startTime || "").trim();
        if (!isTimeHHMM(st))
          return res.status(400).json({ message: "Start time must be HH:mm" });
        patch.startTime = st;
      }

      if (patch.endTime !== undefined) {
        const et = String(patch.endTime || "").trim();
        if (!isTimeHHMM(et))
          return res.status(400).json({ message: "End time must be HH:mm" });
        patch.endTime = et;
      }

      // Dates: accept YYYY-MM-DD and store UTC noon
      let s = existing.startDate;
      let e = existing.endDate;

      if (patch.startDate !== undefined) {
        const ds = parseDateOnlyToUTCNoon(patch.startDate);
        if (!ds)
          return res
            .status(400)
            .json({ message: "Invalid startDate. Use YYYY-MM-DD" });
        s = ds;
        patch.startDate = ds;
      }

      if (patch.endDate !== undefined) {
        const de = parseDateOnlyToUTCNoon(patch.endDate);
        if (!de)
          return res
            .status(400)
            .json({ message: "Invalid endDate. Use YYYY-MM-DD" });
        e = de;
        patch.endDate = de;
      }

      if (e < s)
        return res
          .status(400)
          .json({ message: "End date cannot be earlier than start date" });

      const updated = await Training.findByIdAndUpdate(req.params.id, patch, {
        new: true,
        runValidators: true,
      });

      await AuditLog.create({
        entityType: "training",
        entityId: updated._id,
        action: "UPDATE",
        performed_by: req.user._id,
        previous_data: before,
        new_data: snapshot(updated),
      });

      res.json(updated);
    } catch (error) {
      console.error("Update training error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * PUT /api/trainings/:id/publish
 */
router.put(
  "/:id/publish",
  protect,
  authorizePermissions("manage_trainings"),
  async (req, res) => {
    try {
      const training = await Training.findById(req.params.id);
      if (!training)
        return res.status(404).json({ message: "Training not found" });

      const before = snapshot(training);

      training.isPublished = !training.isPublished;
      await training.save();

      await AuditLog.create({
        entityType: "training",
        entityId: training._id,
        action: "PUBLISH_TOGGLE",
        performed_by: req.user._id,
        previous_data: before,
        new_data: snapshot(training),
      });

      res.json(training);
    } catch (error) {
      console.error("Publish training error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * PUT /api/trainings/:id/archive
 */
router.put(
  "/:id/archive",
  protect,
  authorizePermissions("manage_trainings"),
  async (req, res) => {
    try {
      const training = await Training.findById(req.params.id);
      if (!training)
        return res.status(404).json({ message: "Training not found" });

      const before = snapshot(training);

      training.archived = !training.archived;
      await training.save();

      await AuditLog.create({
        entityType: "training",
        entityId: training._id,
        action: "ARCHIVE_TOGGLE",
        performed_by: req.user._id,
        previous_data: before,
        new_data: snapshot(training),
      });

      res.json(training);
    } catch (error) {
      console.error("Archive training error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * DELETE /api/trainings/:id
 */
router.delete(
  "/:id",
  protect,
  authorizePermissions("manage_trainings"),
  async (req, res) => {
    try {
      const training = await Training.findById(req.params.id);
      if (!training)
        return res.status(404).json({ message: "Training not found" });

      const before = snapshot(training);

      await AuditLog.create({
        entityType: "training",
        entityId: training._id,
        action: "DELETE",
        performed_by: req.user._id,
        previous_data: before,
        new_data: null,
      });

      await Training.findByIdAndDelete(req.params.id);

      res.json({ message: "Training deleted" });
    } catch (error) {
      console.error("Delete training error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;