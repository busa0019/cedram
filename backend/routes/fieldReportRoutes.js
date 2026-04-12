const express = require("express");
const FieldReport = require("../models/FieldReport");
const DisasterIncident = require("../models/DisasterIncident");
const upload = require("../middleware/uploadMiddleware");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

function kindFromMime(mime = "") {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (
    mime === "application/pdf" ||
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "document";
  return "other";
}

/*
|--------------------------------------------------------------------------
| ✅ PUBLIC SUBMIT REPORT (multipart/form-data)
|--------------------------------------------------------------------------
| files field name: "files"
*/
router.post("/", upload.array("files", 5), async (req, res) => {
  try {
    const evidence = (req.files || []).map((f) => ({
      url: f.path, // Cloudinary URL
      kind: kindFromMime(f.mimetype || ""),
      originalName: f.originalname,
      mimeType: f.mimetype,
      bytes: f.size,
    }));

    const report = await FieldReport.create({
      reporter_name: req.body.reporter_name,
      reporter_email: req.body.reporter_email,
      disaster_type: req.body.disaster_type,
      location: req.body.location,
      description: req.body.description,

      incident_date: req.body.incident_date ? new Date(req.body.incident_date) : null,
      state: req.body.state,
      specific_location: req.body.specific_location,

      evidence,

      // legacy: keep only image urls here so old code still makes sense
      images: evidence.filter((e) => e.kind === "image").map((e) => e.url),

      status: "pending",
    });

    res.status(201).json(report);
  } catch (error) {
    console.error("Create field report error:", error);
    res.status(500).json({ message: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| ✅ ADMIN GET ALL REPORTS
|--------------------------------------------------------------------------
*/
router.get(
  "/admin",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const reports = await FieldReport.find().sort({ createdAt: -1 });
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ APPROVE REPORT → CONVERT TO INCIDENT
|--------------------------------------------------------------------------
*/
router.put(
  "/:id/approve",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const report = await FieldReport.findById(req.params.id);
      if (!report) return res.status(404).json({ message: "Report not found" });

      // Map evidence into incident fields (simple approach):
      const evidence = report.evidence || [];
      const incidentImages = evidence.filter((e) => e.kind === "image").map((e) => e.url);
      const incidentAttachments = evidence
        .filter((e) => e.kind !== "image")
        .map((e) => e.url);

      const incident = await DisasterIncident.create({
        disaster_type: report.disaster_type,
        state: report.state || report.location,
        location: report.location,

        latitude: 0,
        longitude: 0,

        date: report.incident_date || new Date(),
        description: report.description,
        status: "verified",
        created_by: req.user._id,

        images: incidentImages,
        attachments: incidentAttachments,
      });

      report.status = "approved";
      await report.save();

      res.json({ message: "Report approved and converted", incident });
    } catch (error) {
      console.error("Approve report error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ REJECT REPORT
|--------------------------------------------------------------------------
*/
router.put(
  "/:id/reject",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const report = await FieldReport.findByIdAndUpdate(
        req.params.id,
        { status: "rejected" },
        { new: true }
      );

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;