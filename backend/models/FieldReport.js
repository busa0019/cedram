const mongoose = require("mongoose");

const fieldReportSchema = new mongoose.Schema(
  {
    reporter_name: { type: String, required: true, trim: true },
    reporter_email: { type: String, required: true, trim: true },

    disaster_type: { type: String, required: true, trim: true },

    // Keep legacy field (your approval conversion uses it)
    location: { type: String, required: true, trim: true },

    incident_date: { type: Date },
    state: { type: String, trim: true },
    specific_location: { type: String, trim: true },

    description: { type: String, required: true },

    // ✅ New: best practice evidence array
    evidence: [
      {
        url: { type: String, required: true },
        kind: { type: String, enum: ["image", "video", "document", "other"], default: "other" },
        originalName: { type: String },
        mimeType: { type: String },
        bytes: { type: Number },
      },
    ],

    // ✅ Legacy support (old records). Keep it so nothing breaks.
    images: [{ type: String }],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FieldReport", fieldReportSchema);