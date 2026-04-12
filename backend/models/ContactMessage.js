const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    subject: String,
    message: String,
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);