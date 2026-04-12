const express = require("express");
const User = require("../models/User");
const { protect, authorizePermissions } = require("../middleware/authMiddleware");

const router = express.Router();

/* ✅ GET ALL USERS */
router.get(
  "/",
  protect,
  authorizePermissions("manage_users"),
  async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
  }
);

/* ✅ CHANGE USER ROLE */
router.put(
  "/:id/role",
  protect,
  authorizePermissions("manage_users"),
  async (req, res) => {
    const { role } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    res.json(updated);
  }
);

/* ✅ TOGGLE ACTIVE STATUS */
router.put(
  "/:id/toggle",
  protect,
  authorizePermissions("manage_users"),
  async (req, res) => {
    const user = await User.findById(req.params.id);

    user.active = !user.active;
    await user.save();

    res.json(user);
  }
);

/* ✅ DELETE USER (Super Admin Only) */
router.delete(
  "/:id",
  protect,
  async (req, res) => {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Only super admin can delete users" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  }
);

module.exports = router;