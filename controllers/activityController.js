const Activity = require("../models/Activity");
const User = require("../models/User");
const ActivityType = require("../models/ActivityType");

// Ghi nhận hoạt động
exports.recordActivity = async (req, res) => {
  const { userId, type } = req.body;

  try {
    // Kiểm tra user có tồn tại
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    // Lấy điểm từ loại hoạt động
    const activityType = await ActivityType.findOne({ type });
    if (!activityType) {
      return res.status(400).json({ message: "Loại hoạt động không hợp lệ" });
    }
    const points = activityType.points;

    // Lưu hoạt động vào database
    const newActivity = new Activity({ userId, type, points });
    await newActivity.save();

    // Cập nhật điểm và level của user
    user.points += points;
    user.level = Math.floor(user.points / 100) + 1; // Level tăng mỗi 100 điểm
    await user.save();

    res.status(201).json({ message: "Hoạt động đã được ghi nhận", user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy tất cả hoạt động của user
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy bảng xếp hạng
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find().sort({ points: -1 }).limit(10);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
