const mongoose = require("mongoose");

const disasterIncidentSchema = new mongoose.Schema(
  {
    disaster_type: {
      type: String,
      required: true,
      enum: [
        "Flood",
        "Fire",
        "Earthquake",
        "Windstorm",
        "Storm",
        "Landslide",
        "Drought",
        "Epidemic",
        "Outbreak",
        "Building Collapse",
        "Explosion",
        "Conflict / Violence",
        "Road Accident (Mass casualty)",
        "Other",
      ],
    },

    state: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    affected_population: {
      type: Number,
      default: 0,
    },

    fatalities: {
      type: Number,
      default: 0,
    },

    response_actions: {
      type: String,
    },

    images: [
      {
        type: String,
      },
    ],

    attachments: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "verified", "published"],
      default: "pending",
    },

    archived: {
      type: Boolean,
      default: false,
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

disasterIncidentSchema.index({ date: 1 });
disasterIncidentSchema.index({ state: 1 });
disasterIncidentSchema.index({ disaster_type: 1 });
disasterIncidentSchema.index({ status: 1 });
disasterIncidentSchema.index({ archived: 1 });

module.exports = mongoose.model("DisasterIncident", disasterIncidentSchema);