const express = require("express");
const UserActivity = require("../models/UserActivity");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const activities = await UserActivity.find()
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .limit(100);

      res.json(activities);

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;