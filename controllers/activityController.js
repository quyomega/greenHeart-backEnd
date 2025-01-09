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

    // Nếu điểm là dương (tăng), cập nhật tổng điểm và cấp độ
    if (points > 0) {
      user.points += points; // Tăng điểm khả dụng
      user.totalPoints += points; // Tăng tổng điểm
      user.level = Math.floor(user.totalPoints / 100) + 1; // Tính cấp độ từ tổng điểm
    } else {
      // Nếu điểm âm (giảm), chỉ giảm điểm khả dụng
      if (user.points + points < 0) {
        return res.status(400).json({ message: "Không đủ điểm để thực hiện hành động này" });
      }
      user.points += points; // Giảm điểm khả dụng
    }

    // Lưu thay đổi
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
  const { filter = "all", organizationId = null, userId = null } = req.query;

  try {
    const query = {};
    const leaderboard = await User.find(query)
      .sort({ totalPoints: -1 })
      .select("name totalPoints level email organizations")
      .limit(10);
    res.status(200).json({ leaderboard });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

