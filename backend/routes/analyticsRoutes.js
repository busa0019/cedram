const express = require("express");
const DisasterIncident = require("../models/DisasterIncident");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { Parser } = require("json2csv");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ✅ Utility: Build Dynamic Match Filter (Admin)
|--------------------------------------------------------------------------
*/
const buildMatchFilter = (query, includePending = false) => {
  const { startDate, endDate, state } = query;

  const match = {
    archived: false,
  };

  if (!includePending) {
    match.status = { $ne: "pending" };
  }

  if (state) {
    match.state = state.toLowerCase();
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      match.date = {
        $gte: start,
        $lte: end,
      };
    }
  }

  return match;
};

/*
|--------------------------------------------------------------------------
| ✅ Utility: Public match + safe date parsing
|--------------------------------------------------------------------------
*/
const buildPublicMatch = (query = {}) => {
  const { startDate, endDate, state } = query;

  const match = {
    status: "published",
    archived: false,
  };

  if (state) {
    match.state = String(state).toLowerCase();
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      match.date = { $gte: start, $lte: end };
    }
  }

  return match;
};

const toTitleCase = (s = "") =>
  String(s)
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/*
|--------------------------------------------------------------------------
| ✅ SUMMARY (Admin)
|--------------------------------------------------------------------------
*/
router.get(
  "/summary",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const match = buildMatchFilter(req.query);

      const totalIncidents = await DisasterIncident.countDocuments(match);

      const totals = await DisasterIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalAffected: { $sum: { $ifNull: ["$affected_population", 0] } },
            totalFatalities: { $sum: { $ifNull: ["$fatalities", 0] } },
          },
        },
      ]);

      res.json({
        totalIncidents,
        totalAffected: totals[0]?.totalAffected || 0,
        totalFatalities: totals[0]?.totalFatalities || 0,
      });
    } catch (error) {
      console.error("Summary analytics error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ DISTINCT STATES (Admin)
|--------------------------------------------------------------------------
*/
router.get(
  "/states",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const states = await DisasterIncident.distinct("state", {
        archived: false,
      });

      const formattedStates = states
        .filter(Boolean)
        .map((state) => toTitleCase(state))
        .sort();

      res.json(formattedStates);
    } catch (error) {
      console.error("Fetch states error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ INCIDENTS BY YEAR (Admin)
|--------------------------------------------------------------------------
*/
router.get(
  "/incidents-by-year",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const match = buildMatchFilter(req.query);

      const result = await DisasterIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $year: "$date" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json(result);
    } catch (error) {
      console.error("Year analytics error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ INCIDENTS BY STATE (Admin)
|--------------------------------------------------------------------------
*/
router.get(
  "/incidents-by-state",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const match = buildMatchFilter(req.query);

      const result = await DisasterIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$state",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const formatted = result.map((r) => ({
        _id: toTitleCase(r._id),
        count: r.count,
      }));

      res.json(formatted);
    } catch (error) {
      console.error("State analytics error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ DISASTER TYPES (Admin)
|--------------------------------------------------------------------------
*/
router.get(
  "/disaster-types",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const match = buildMatchFilter(req.query);

      const result = await DisasterIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$disaster_type",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      res.json(result);
    } catch (error) {
      console.error("Type analytics error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ MONTHLY DISASTER TREND (Admin)
|--------------------------------------------------------------------------
*/
router.get(
  "/monthly-disaster-trend",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const match = buildMatchFilter(req.query);

      const result = await DisasterIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $month: "$date" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      const full = months.map((month, index) => {
        const found = result.find((r) => r._id === index + 1);
        return {
          month,
          count: found?.count || 0,
        };
      });

      res.json(full);
    } catch (error) {
      console.error("Monthly disaster trend error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ MONTHLY AFFECTED POPULATION (Admin)
|--------------------------------------------------------------------------
*/
router.get(
  "/monthly-affected-population",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const match = buildMatchFilter(req.query);

      const result = await DisasterIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $month: "$date" },
            affected: { $sum: { $ifNull: ["$affected_population", 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      const full = months.map((month, index) => {
        const found = result.find((r) => r._id === index + 1);
        return {
          month,
          affected: found?.affected || 0,
        };
      });

      res.json(full);
    } catch (error) {
      console.error("Monthly affected population error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ MONTHLY FATALITIES TREND (Admin)
|--------------------------------------------------------------------------
*/
router.get(
  "/monthly-fatalities-trend",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const match = buildMatchFilter(req.query);

      const result = await DisasterIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $month: "$date" },
            fatalities: { $sum: { $ifNull: ["$fatalities", 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      const full = months.map((month, index) => {
        const found = result.find((r) => r._id === index + 1);
        return {
          month,
          fatalities: found?.fatalities || 0,
        };
      });

      res.json(full);
    } catch (error) {
      console.error("Monthly fatalities trend error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ TOP STATES BY AFFECTED POPULATION (Admin)
|--------------------------------------------------------------------------
*/
router.get(
  "/top-states-by-affected",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const match = buildMatchFilter(req.query);
      const limit = Math.min(Math.max(parseInt(req.query.limit || "8", 10), 1), 20);

      const result = await DisasterIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$state",
            affected: { $sum: { $ifNull: ["$affected_population", 0] } },
            incidents: { $sum: 1 },
            fatalities: { $sum: { $ifNull: ["$fatalities", 0] } },
          },
        },
        { $sort: { affected: -1 } },
        { $limit: limit },
      ]);

      const formatted = result.map((r) => ({
        _id: toTitleCase(r._id),
        affected: r.affected || 0,
        incidents: r.incidents || 0,
        fatalities: r.fatalities || 0,
      }));

      res.json(formatted);
    } catch (error) {
      console.error("Top states by affected error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ RAW INCIDENT CSV EXPORT (Admin)
|--------------------------------------------------------------------------
*/
router.get(
  "/export/raw-csv",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const match = buildMatchFilter(req.query);

      const incidents = await DisasterIncident.find(match)
        .sort({ date: -1 })
        .lean();

      const fields = [
        { label: "Disaster Type", value: "disaster_type" },
        { label: "State", value: "state" },
        { label: "Location", value: "location" },
        { label: "Date", value: "date" },
        { label: "Affected Population", value: "affected_population" },
        { label: "Fatalities", value: "fatalities" },
        { label: "Status", value: "status" },
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(incidents);

      res.header("Content-Type", "text/csv");
      res.attachment("disaster_incidents_report.csv");
      return res.send(csv);
    } catch (error) {
      console.error("Raw CSV export error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ EXECUTIVE SUMMARY CSV EXPORT (Admin)
|--------------------------------------------------------------------------
*/
router.get(
  "/export/summary-csv",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const match = buildMatchFilter(req.query);

      const totalIncidents = await DisasterIncident.countDocuments(match);

      const totals = await DisasterIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalAffected: { $sum: { $ifNull: ["$affected_population", 0] } },
            totalFatalities: { $sum: { $ifNull: ["$fatalities", 0] } },
          },
        },
      ]);

      const summaryData = [
        {
          totalIncidents,
          totalAffected: totals[0]?.totalAffected || 0,
          totalFatalities: totals[0]?.totalFatalities || 0,
        },
      ];

      const fields = [
        { label: "Total Incidents", value: "totalIncidents" },
        { label: "Total Affected Population", value: "totalAffected" },
        { label: "Total Fatalities", value: "totalFatalities" },
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(summaryData);

      res.header("Content-Type", "text/csv");
      res.attachment("executive_summary_report.csv");
      return res.send(csv);
    } catch (error) {
      console.error("Summary CSV export error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ✅ PUBLIC - SUMMARY
|--------------------------------------------------------------------------
*/
router.get("/public/summary", async (req, res) => {
  try {
    const match = buildPublicMatch(req.query);

    const [totalIncidents, states, totals, dateRange] = await Promise.all([
      DisasterIncident.countDocuments(match),

      DisasterIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $toLower: { $ifNull: ["$state", ""] } },
          },
        },
        { $match: { _id: { $ne: "" } } },
      ]),

      DisasterIncident.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalAffected: { $sum: { $ifNull: ["$affected_population", 0] } },
            totalFatalities: { $sum: { $ifNull: ["$fatalities", 0] } },
            lastUpdatedAt: { $max: { $ifNull: ["$updatedAt", "$createdAt"] } },
            earliestDate: { $min: "$date" },
            latestDate: { $max: "$date" },
          },
        },
      ]),

      DisasterIncident.aggregate([
        { $match: match },
        { $group: { _id: { $year: "$date" } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const statesCovered = states.length;
    const years = (dateRange || [])
      .map((y) => y._id)
      .filter((x) => typeof x === "number");
    const yearsOfCoverage = years.length
      ? years[years.length - 1] - years[0] + 1
      : 0;

    res.json({
      totalIncidents,
      statesCovered,
      totalAffected: totals[0]?.totalAffected || 0,
      totalFatalities: totals[0]?.totalFatalities || 0,
      yearsOfCoverage,
      lastUpdatedAt: totals[0]?.lastUpdatedAt || null,
    });
  } catch (error) {
    console.error("Public summary error:", error);
    res.status(500).json({ message: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| ✅ PUBLIC - INCIDENTS BY YEAR
|--------------------------------------------------------------------------
*/
router.get("/public/incidents-by-year", async (req, res) => {
  try {
    const match = buildPublicMatch(req.query);

    const result = await DisasterIncident.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $year: "$date" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(result);
  } catch (error) {
    console.error("Public incidents-by-year error:", error);
    res.status(500).json({ message: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| ✅ PUBLIC - DISASTER TYPES
|--------------------------------------------------------------------------
*/
router.get("/public/disaster-types", async (req, res) => {
  try {
    const match = buildPublicMatch(req.query);

    const result = await DisasterIncident.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$disaster_type",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(result);
  } catch (error) {
    console.error("Public disaster-types error:", error);
    res.status(500).json({ message: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| ✅ PUBLIC - INCIDENTS BY STATE
|--------------------------------------------------------------------------
*/
router.get("/public/incidents-by-state", async (req, res) => {
  try {
    const match = buildPublicMatch(req.query);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "40", 10), 1), 80);

    const result = await DisasterIncident.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $toLower: { $ifNull: ["$state", ""] } },
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: "" } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          state: "$_id",
          count: 1,
        },
      },
    ]);

    const formatted = result.map((r) => ({
      _id: toTitleCase(r.state),
      count: r.count,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Public incidents-by-state error:", error);
    res.status(500).json({ message: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| ✅ PUBLIC - IMPACT BY STATE
|--------------------------------------------------------------------------
*/
router.get("/public/impact-by-state", async (req, res) => {
  try {
    const match = buildPublicMatch(req.query);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "12", 10), 1), 36);

    const result = await DisasterIncident.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $toLower: { $ifNull: ["$state", ""] } },
          incidents: { $sum: 1 },
          affected: { $sum: { $ifNull: ["$affected_population", 0] } },
          fatalities: { $sum: { $ifNull: ["$fatalities", 0] } },
        },
      },
      { $match: { _id: { $ne: "" } } },
      { $sort: { incidents: -1 } },
      { $limit: limit },
    ]);

    const formatted = result.map((r) => ({
      _id: toTitleCase(r._id),
      incidents: r.incidents,
      affected: r.affected,
      fatalities: r.fatalities,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Public impact-by-state error:", error);
    res.status(500).json({ message: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| ✅ PUBLIC - MOST AFFECTED STATES
|--------------------------------------------------------------------------
*/
router.get("/public/most-affected-states", async (req, res) => {
  try {
    const match = buildPublicMatch(req.query);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 30);
    const metric = String(req.query.metric || "incidents").toLowerCase();

    const groupStage = {
      _id: { $toLower: { $ifNull: ["$state", ""] } },
      incidents: { $sum: 1 },
      affected: { $sum: { $ifNull: ["$affected_population", 0] } },
      fatalities: { $sum: { $ifNull: ["$fatalities", 0] } },
    };

    const sortKey =
      metric === "affected"
        ? "affected"
        : metric === "fatalities"
        ? "fatalities"
        : "incidents";

    const result = await DisasterIncident.aggregate([
      { $match: match },
      { $group: groupStage },
      { $match: { _id: { $ne: "" } } },
      { $sort: { [sortKey]: -1 } },
      { $limit: limit },
    ]);

    const formatted = result.map((r) => ({
      _id: toTitleCase(r._id),
      count: r[sortKey] || 0,
      incidents: r.incidents || 0,
      affected: r.affected || 0,
      fatalities: r.fatalities || 0,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Public most-affected-states error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;