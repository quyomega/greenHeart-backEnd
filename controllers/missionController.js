const Mission = require("../models/Mission");
const User = require("../models/User");

// Tạo nhiệm vụ mẫu (sử dụng 1 lần để thêm nhiệm vụ mẫu vào DB)
const createSampleMissions = async (req, res) => {
  try {
    const missions = [
      {
        name: "Thu gom 1kg rác tái chế",
        description: "Hoàn thành việc thu gom rác tái chế.",
        reward: { points: 10, diligencePoints: 5 },
        type: "daily",
      },
      {
        name: "Tắt điện 1 giờ",
        description: "Tắt các thiết bị điện trong 1 giờ.",
        reward: { points: 5, diligencePoints: 3 },
        type: "daily",
      },
      {
        name: "Tưới cây",
        description: "Tưới cây trong vườn.",
        reward: { points: 8, diligencePoints: 4 },
        type: "daily",
      },
      {
        name: "Đi bộ 30 phút",
        description: "Đi bộ ít nhất 30 phút mỗi ngày.",
        reward: { points: 6, diligencePoints: 3 },
        type: "daily",
      },
      {
        name: "Sử dụng xe đạp thay vì xe máy",
        description: "Đi xe đạp thay vì xe máy.",
        reward: { points: 7, diligencePoints: 4 },
        type: "daily",
      },
      // Thêm các nhiệm vụ khác
    ];

    await Mission.insertMany(missions);
    res.status(201).json({ message: "Nhiệm vụ mẫu đã được tạo thành công." });
  } catch (error) {
    res.status(500).json({ error: "Không thể tạo nhiệm vụ mẫu." });
  }
};

// Gắn nhiệm vụ hằng ngày
const assignDailyMissions = async (req, res) => {
  try {
    // Lấy tất cả các nhiệm vụ hằng ngày từ DB
    const missions = await Mission.find({ type: "daily" });
    // Kiểm tra nếu không có nhiệm vụ nào
    if (missions.length === 0) {
      return res
        .status(404)
        .json({ error: "Không có nhiệm vụ hằng ngày nào trong hệ thống." });
    }
    // Lấy danh sách tất cả người dùng
    const users = await User.find();

    if (users.length === 0) {
      return res
        .status(404)
        .json({ error: "Không có người dùng trong hệ thống." });
    }

    // Gán nhiệm vụ ngẫu nhiên cho từng người dùng
    for (const user of users) {
      // Lấy ngẫu nhiên 5 nhiệm vụ từ danh sách nhiệm vụ hằng ngày
    //   console.log("Xử lý người dùng:", user.name);
      const randomMissions = [];
      while (randomMissions.length < 5) {
        const randomMission =
          missions[Math.floor(Math.random() * missions.length)];
        if (!randomMissions.includes(randomMission)) {
          randomMissions.push(randomMission);
        }
      }
   
      // Gán nhiệm vụ cho người dùng
      user.dailyMissions = randomMissions.map((mission) => ({
        missionId: mission._id,
        status: "pending", // Trạng thái bắt đầu là pending
      }));

      // Lưu lại người dùng
      await user.save();

      // Cập nhật mỗi nhiệm vụ với người dùng mới
      for (const mission of randomMissions) {
        if (!mission.assignedUsers.includes(user._id)) {
          mission.assignedUsers.push(user._id); // Thêm ID người dùng vào mảng assignedUsers
          await mission.save(); // Lưu nhiệm vụ
        }
      }
    }

    res.status(200).json({
      message: "Nhiệm vụ hằng ngày đã được gán cho tất cả người dùng.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Có lỗi xảy ra khi gán nhiệm vụ hằng ngày." });
  }
};

// Đánh dấu nhiệm vụ hoàn thành và cộng điểm siêng năng
const completeMission = async (req, res) => {
    try {
      const { missionId, userId } = req.body;
      
      if (!missionId || !userId) {
        return res.status(400).json({ error: "Thiếu thông tin nhiệm vụ hoặc tài khoản." });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy người dùng." });
      }
  
      const mission = user.dailyMissions.find(
        (m) => m.missionId.toString() === missionId && m.status === "pending"
      );
  
      if (!mission) {
        return res.status(404).json({ error: "Nhiệm vụ không tồn tại hoặc đã hoàn thành." });
      }
  
      mission.status = "completed";
      mission.completedAt = new Date();
  
      const missionData = await Mission.findById(missionId);
      const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
      user.diligencePoints.set(
        monthKey,
        (user.diligencePoints.get(monthKey) || 0) + missionData.reward.diligencePoints
      );
  
      await user.save();
      res.status(200).json({ message: "Nhiệm vụ đã hoàn thành.", mission });
    } catch (error) {
      console.error("Lỗi hoàn thành nhiệm vụ:", error.message);
      res.status(500).json({ error: "Không thể hoàn thành nhiệm vụ." });
    }
  };
  

// lấy thông tin nhiệm vụ người dùng
const getUserDailyMissions = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ token đã xác thực

    const user = await User.findById(userId).populate(
      "dailyMissions.missionId"
    );
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng." });

    const dailyMissions = user.dailyMissions;
    res.status(200).json({ dailyMissions });
  } catch (error) {
    res.status(500).json({ error: "Không thể lấy thông tin nhiệm vụ." });
  }
};

module.exports = {
  createSampleMissions,
  assignDailyMissions,
  completeMission,
  getUserDailyMissions,
};
