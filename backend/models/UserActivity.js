const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: String,
    ipAddress: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserActivity", activitySchema);