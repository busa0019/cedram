const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ✅ GET MY PROFILE
|--------------------------------------------------------------------------
*/
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

/*
|--------------------------------------------------------------------------
| ✅ UPDATE PROFILE (Name + Email)
|--------------------------------------------------------------------------
*/
router.put("/me", protect, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| ✅ CHANGE PASSWORD
|--------------------------------------------------------------------------
*/
router.put("/me/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;