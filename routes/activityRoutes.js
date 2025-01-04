const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  recordActivity,
  getActivities,
  getLeaderboard,
} = require("../controllers/activityController");

const router = express.Router();

// Ghi nhận hoạt động
router.post("/", authMiddleware, recordActivity);

// Lấy danh sách hoạt động của user
router.get("/", authMiddleware, getActivities);

// Lấy bảng xếp hạng
router.get("/leaderboard", authMiddleware, getLeaderboard);

module.exports = router;
