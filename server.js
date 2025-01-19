const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
// Routes
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const activityTypeRoutes = require("./routes/activityTypeRoutes");
const missionRoutes = require("./routes/missionRoutes");
const { refreshDailyMissions } = require("./controllers/missionController");
// Load .env file
dotenv.config();
//Các tuyến đường
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/organizations", organizationRoutes);
app.use("/api/activitytype", activityTypeRoutes);
app.use("/api/missions", missionRoutes);
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));
// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Tác vụ reset nhiệm vụ hàng ngày
cron.schedule(
  "0 0 * * *",
  async () => {
    try {
      console.log("Đang làm mới nhiệm vụ hằng ngày...");
      await refreshDailyMissions();
      console.log("Hoàn thành làm mới nhiệm vụ hằng ngày.");
    } catch (error) {
      console.error("Lỗi khi làm mới nhiệm vụ hằng ngày:", error.message);
    }
  },
  {
    timezone: "Asia/Ho_Chi_Minh", // Múi giờ Việt Nam
  }
);
