const express = require("express");
const router = express.Router();
const {
  createSampleMissions,
  assignDailyMissions,
  completeMission,
  getUserDailyMissions,
  getAllUserDailyMissions,
} = require("../controllers/missionController");
const authMiddleware = require("../middleware/authMiddleware");

// Route để tạo nhiệm vụ mẫu (sử dụng 1 lần)
router.post("/create-sample", createSampleMissions);

// Route để gán nhiệm vụ hằng ngày cho người dùng
router.post("/assign-daily", authMiddleware, assignDailyMissions);

// Route để đánh dấu nhiệm vụ hoàn thành
router.post("/complete", authMiddleware, completeMission);

// Lấy thông tin nhiệm vụ tất cả người dùng
router.get("/daily-missions", authMiddleware, getUserDailyMissions);

// Lấy thông tin nhiệm vụ người dùng
router.get("/all-daily-missions", authMiddleware, getAllUserDailyMissions);

module.exports = router;
