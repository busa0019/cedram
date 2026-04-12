const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const rolePermissions = require("../config/roles");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   ✅ TOKEN GENERATORS
===================================================== */

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

/* =====================================================
   ✅ REGISTER
===================================================== */

router.post(
  "/register",
  protect,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const assignedRole = role || "researcher";

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
        permissions: rolePermissions[assignedRole] || [],
      });

      res.status(201).json({
        message: "User created successfully",
        user,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* =====================================================
   ✅ LOGIN (LOCK + REFRESH TOKEN)
===================================================== */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account locked. Try again later.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ AUTO-SYNC PERMISSIONS IF MISSING
    const rolePermissions = require("../config/roles");

    if (!user.permissions || user.permissions.length === 0) {
      user.permissions = rolePermissions[user.role] || [];
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =====================================================
   ✅ REFRESH TOKEN
===================================================== */

router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });

  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

/* =====================================================
   ✅ FORGOT PASSWORD
===================================================== */

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    res.json({
      message: "Reset token generated",
      resetToken, // remove in production
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =====================================================
   ✅ RESET PASSWORD
===================================================== */

router.post("/reset-password/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;