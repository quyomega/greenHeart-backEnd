const express = require("express");
const Activity = require("../models/Activity");
const User = require("../models/User");

const router = express.Router();

// Ghi nhận hoạt động
router.post("/", async (req, res) => {
  const { userId, type, points } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const newActivity = new Activity({ userId, type, points });
    await newActivity.save();

    user.points += points;
    user.level = Math.floor(user.points / 100) + 1; // Tính level
    await user.save();

    res.status(201).json({ message: "Hoạt động đã được ghi nhận", user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy bảng xếp hạng
router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await User.find().sort({ points: -1 }).limit(10);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
