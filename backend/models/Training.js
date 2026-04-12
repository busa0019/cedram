const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },

    // Date-only concept stored safely as Date
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Times stored separately
    startTime: { type: String, required: true, trim: true }, // "HH:mm"
    endTime: { type: String, required: true, trim: true },   // "HH:mm"

    // ✅ Facilitator (optional)
    facilitatorName: { type: String, trim: true, default: "" },

    location: { type: String, required: true, trim: true },
    participants: { type: Number, default: 0 },

    registrationUrl: { type: String, required: true, trim: true },

    isPublished: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Training", trainingSchema);