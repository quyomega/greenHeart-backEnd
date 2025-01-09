const ActivityType = require("../models/ActivityType");

// Thêm một loại hành động mới
exports.addActivityType = async (req, res) => {
    try {
      const { type, points } = req.body;
  
      // Kiểm tra xem loại hành động đã tồn tại chưa
      const existingActivityType = await ActivityType.findOne({ type });
      if (existingActivityType) {
        return res.status(400).json({ success: false, message: "Loại hành động đã tồn tại." });
      }
  
      // Tạo mới loại hành động
      const newActivityType = new ActivityType({ type, points });
      await newActivityType.save();
  
      res.status(201).json({ success: true, data: newActivityType });
    } catch (error) {
      console.error("Lỗi khi thêm loại hành động:", error);
      res.status(500).json({ success: false, message: "Lỗi khi thêm loại hành động." });
    }
  };
// Lấy danh sách các loại hành động và điểm tương ứng
exports.getActivityTypes = async (req, res) => {
  try {
    // Truy vấn danh sách loại hành động từ cơ sở dữ liệu
    const activityTypes = await ActivityType.find().select("type points");

    // Trả về kết quả
    res.status(200).json({
      success: true,
      data: activityTypes,
    });
  } catch (error) {
    // Xử lý lỗi
    console.error("Lỗi khi lấy danh sách loại hành động:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách loại hành động.",
      error: error.message,
    });
  }
};
