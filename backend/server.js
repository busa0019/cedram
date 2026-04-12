const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const incidentRoutes = require("./routes/incidentRoutes");
app.use("/api/incidents", incidentRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

const fieldReportRoutes = require("./routes/fieldReportRoutes");
app.use("/api/field-reports", fieldReportRoutes);

const exportRoutes = require("./routes/exportRoutes");
app.use("/api/export", exportRoutes);

const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/api/analytics", analyticsRoutes);

const auditRoutes = require("./routes/auditRoutes");
app.use("/api/audit", auditRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const profileRoutes = require("./routes/profileRoutes");
app.use("/api/profile", profileRoutes);

const activityRoutes = require("./routes/activityRoutes");
app.use("/api/activity", activityRoutes);

const contactRoutes = require("./routes/contactRoutes");
app.use("/api/contact", contactRoutes);

// Article routes (for publications)
const articleRoutes = require("./routes/articleRoutes");
app.use("/api/articles", articleRoutes);

//  Trainings (
const trainingRoutes = require("./routes/trainingRoutes");
app.use("/api/trainings", trainingRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Research Platform API Running...");
});

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });
module.exports = app;