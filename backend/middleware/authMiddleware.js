const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserActivity = require("../models/UserActivity");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!user.active) {
        return res.status(403).json({ message: "Account disabled" });
      }

      req.user = user;

      await UserActivity.create({
        user: user._id,
        action: req.method + " " + req.originalUrl,
        ipAddress: req.ip,
      });

      next();

    } else {
      return res.status(401).json({ message: "No token provided" });
    }

  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

const authorizePermissions = (...permissions) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];

    const hasPermission = permissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
  authorizePermissions,
};