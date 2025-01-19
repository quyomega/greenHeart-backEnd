const Mission = require("../models/Mission");
const User = require("../models/User");

// Tạo nhiệm vụ mẫu (sử dụng 1 lần để thêm nhiệm vụ mẫu vào DB)
exports.createSampleMissions = async (req, res) => {
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
      {
        name: "Nhiệm vụ để test 1",
        description: "đang test ",
        reward: { points: 5, diligencePoints: 4 },
        type: "daily",
      },
      {
        name: "Nhiệm vụ để test 1",
        description: "đang test ",
        reward: { points: 4, diligencePoints: 4 },
        type: "daily",
      },
      {
        name: "Nhiệm vụ để test 2",
        description: "đang test ",
        reward: { points: 2, diligencePoints: 4 },
        type: "daily",
      },
      {
        name: "Nhiệm vụ để test 3",
        description: "đang test ",
        reward: { points: 1, diligencePoints: 4 },
        type: "daily",
      },
      {
        name: "Nhiệm vụ để test 4",
        description: "đang test ",
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
exports.assignDailyMissions = async (req, res) => {
  try {
    const missions = await Mission.find({ type: "daily" });
    if (missions.length < 5) {
      return res.status(400).json({
        error: "Không đủ nhiệm vụ để gán (yêu cầu tối thiểu 5 nhiệm vụ).",
      });
    }

    const users = await User.find();
    if (users.length === 0) {
      return res
        .status(404)
        .json({ error: "Không có người dùng trong hệ thống." });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    for (const user of users) {
      const randomMissions = [];
      while (randomMissions.length < 5) {
        const randomMission =
          missions[Math.floor(Math.random() * missions.length)];
        if (!randomMissions.includes(randomMission)) {
          randomMissions.push(randomMission);
        }
      }

      user.dailyMissions = randomMissions.map((mission) => ({
        missionId: mission._id,
        status: "pending",
        assignedAt: now,
        expiresAt: expiresAt,
      }));

      await user.save();

      for (const mission of randomMissions) {
        if (!mission.assignedUsers) mission.assignedUsers = [];
        if (!mission.assignedUsers.includes(user._id)) {
          mission.assignedUsers.push(user._id);
          await mission.save();
        }
      }
    }

    res
      .status(200)
      .json({
        message: "Nhiệm vụ hằng ngày đã được gán cho tất cả người dùng.",
      });
  } catch (error) {
    console.error("Lỗi gán nhiệm vụ:", error.message);
    res.status(500).json({ error: "Có lỗi xảy ra khi gán nhiệm vụ hằng ngày." });
  }
};


// Đánh dấu nhiệm vụ hoàn thành và cộng điểm siêng năng
exports.completeMission = async (req, res) => {
  try {
    const { missionId, userId } = req.body;

    if (!missionId || !userId) {
      return res
        .status(400)
        .json({ error: "Thiếu thông tin nhiệm vụ hoặc tài khoản." });
    }

    const user = await User.findById(userId);
    if (!user || !user.dailyMissions) {
      return res.status(404).json({ error: "Không tìm thấy người dùng hoặc nhiệm vụ." });
    }

    const mission = user.dailyMissions.find(
      (m) => m.missionId.toString() === missionId && m.status === "pending"
    );

    if (!mission) {
      return res
        .status(404)
        .json({ error: "Nhiệm vụ không tồn tại hoặc đã hoàn thành." });
    }

    mission.status = "completed";
    mission.completedAt = new Date();

    const missionData = await Mission.findById(missionId);
    if (!missionData) {
      return res.status(404).json({ error: "Không tìm thấy nhiệm vụ trong hệ thống." });
    }

    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    user.diligencePoints.set(
      monthKey,
      (user.diligencePoints.get(monthKey) || 0) +
        missionData.reward.diligencePoints
    );

    await user.save();
    res.status(200).json({ message: "Nhiệm vụ đã hoàn thành.", mission });
  } catch (error) {
    console.error("Lỗi hoàn thành nhiệm vụ:", error.message);
    res.status(500).json({ error: "Không thể hoàn thành nhiệm vụ." });
  }
};

// lấy thông tin nhiệm vụ của người dùng
exports.getUserDailyMissions = async (req, res) => {
  const userId = req.user.id;  // Lấy userId từ token đã xác thực

  try {
    // Tìm người dùng và populate thông tin nhiệm vụ
    const user = await User.findById(userId)
      .populate("dailyMissions.missionId", "name description reward type")
      .exec();

    // Nếu không tìm thấy người dùng
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }

    // Trả về dữ liệu nhiệm vụ của người dùng
    if (user.dailyMissions.length === 0) {
      return res.status(404).json({ error: "Người dùng chưa có nhiệm vụ nào." });
    }

    res.status(200).json({
      message: "Lấy nhiệm vụ thành công của người dùng mã "+ req.user.id,
      dailyMissions: user.dailyMissions,
    });
  } catch (error) {
    console.error("Lỗi khi lấy nhiệm vụ của người dùng:", error.message);
    res.status(500).json({
      error: "Không thể lấy nhiệm vụ của người dùng.",
      details: error.message,
    });
  }
};

// lấy thông tin nhiệm vụ tất cả người dùng
exports.getAllUserDailyMissions = async (req, res) => {
  try {
    const users = await User.find().populate("dailyMissions.missionId");

    if (users.length === 0) {
      return res.status(404).json({ error: "Không có người dùng trong hệ thống." });
    }

    const allUserMissions = users.map(user => ({
      userId: user._id,
      dailyMissions: user.dailyMissions,
    }));

    res.status(200).json({ allUserMissions });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin nhiệm vụ người dùng:", error.message);
    res.status(500).json({ error: "Không thể lấy thông tin nhiệm vụ người dùng." });
  }
};

// Gán lại các nhiệm vụ mới nếu số lượng nhiệm vụ < 5
exports.refreshDailyMissions = async () => {
  try {
    // Lấy tất cả nhiệm vụ daily
    const dailyMissions = await Mission.find({ type: "daily" });
    if (dailyMissions.length === 0) {
      console.log("Không có nhiệm vụ daily để làm mới.");
      return;
    }

    // Lấy tất cả người dùng
    const users = await User.find();

    // Làm mới nhiệm vụ cho mỗi người dùng
    for (const user of users) {
      // Xóa nhiệm vụ cũ
      user.dailyMissions = [];

      // Gán nhiệm vụ mới (5 nhiệm vụ ngẫu nhiên)
      const randomMissions = [];
      while (randomMissions.length < 5) {
        const randomMission =
          dailyMissions[Math.floor(Math.random() * dailyMissions.length)];
        if (!randomMissions.includes(randomMission)) {
          randomMissions.push(randomMission);
        }
      }

      user.dailyMissions = randomMissions.map((mission) => ({
        missionId: mission._id,
        status: "pending",
      }));

      await user.save();
    }

    console.log("Nhiệm vụ hằng ngày đã được làm mới.");
  } catch (error) {
    console.error("Lỗi khi làm mới nhiệm vụ hằng ngày:", error.message);
  }
};
