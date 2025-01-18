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
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Đang reset nhiệm vụ hằng ngày...");
    const users = await User.find();

    for (const user of users) {
      // Reset trạng thái các nhiệm vụ về "pending"
      user.dailyMissions = user.dailyMissions.map((mission) => ({
        ...mission,
        status: "pending",
        completedAt: null,
      }));

      await user.save();
    }
    console.log("Nhiệm vụ hằng ngày đã được reset thành công!");
  } catch (error) {
    console.error("Lỗi khi reset nhiệm vụ hằng ngày:", error);
  }
});