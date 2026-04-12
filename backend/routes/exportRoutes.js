const express = require("express");
const { Parser } = require("json2csv");
const DisasterIncident = require("../models/DisasterIncident");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/incidents",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    const incidents = await DisasterIncident.find();

    const parser = new Parser();
    const csv = parser.parse(incidents);

    res.header("Content-Type", "text/csv");
    res.attachment("incidents.csv");
    return res.send(csv);
  }
);

module.exports = router;