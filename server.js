const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
// Routes
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const activityTypeRoutes = require("./routes/activityTypeRoutes");
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
