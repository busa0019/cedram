const express = require("express");
const DisasterIncident = require("../models/DisasterIncident");
const Article = require("../models/Article");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/stats",
  protect,
  authorizeRoles("admin", "super_admin", "analyst", "researcher"),
  async (req, res) => {
    try {
      const totalIncidents = await DisasterIncident.countDocuments({
        archived: false,
      });

      const pendingIncidents = await DisasterIncident.countDocuments({
        archived: false,
        status: "pending",
      });

      const publishedArticles = await Article.countDocuments({
        isPublished: true,
      });

      const totals = await DisasterIncident.aggregate([
        { $match: { archived: false } },
        {
          $group: {
            _id: null,
            totalAffected: { $sum: { $ifNull: ["$affected_population", 0] } },
            totalFatalities: { $sum: { $ifNull: ["$fatalities", 0] } },
          },
        },
      ]);

      const statesCoveredAgg = await DisasterIncident.aggregate([
        { $match: { archived: false } },
        {
          $group: {
            _id: { $toLower: { $ifNull: ["$state", ""] } },
          },
        },
        { $match: { _id: { $ne: "" } } },
      ]);

      res.json({
        totalIncidents,
        pendingIncidents,
        publishedArticles,
        totalAffected: totals[0]?.totalAffected || 0,
        totalFatalities: totals[0]?.totalFatalities || 0,
        statesCovered: statesCoveredAgg.length,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  }
);

module.exports = router;