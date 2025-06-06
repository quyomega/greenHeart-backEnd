const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

// Đăng ký
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user!", error: err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        points: user.points,
        level: user.level,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy thông tin cá nhân
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: req.user.id,
      name: user.name,
      email: user.email,
      points: user.points,
      totalPoints: user.totalPoints,
      level: user.level,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Chỉnh sửa thông tin người dùng
exports.updateProfile = async (req, res) => {
  const { name, email, phone, address } = req.body;
  let avatarPath = null;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.file) {
      avatarPath = `http://localhost:5000/uploads/${req.file.filename}`;
      if (user.avatar) {
        const oldAvatarPath = path.join(
          __dirname,
          "../uploads",
          path.basename(user.avatar)
        );
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
    }

    const updatedData = { name, email, phone, address };
    if (avatarPath) {
      updatedData.avatar = avatarPath;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });

    res.json({
      message: "Cập nhật thông tin thành công!",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};
// Lấy thông tin tất cả tài khoản
exports.getAllUsers = async (req, res) => {
  try {
    // Tìm tất cả người dùng trong cơ sở dữ liệu
    const users = await User.find({}, "name email points totalPoints level phone address avatar role");

    // Kiểm tra nếu không có tài khoản nào
    if (users.length === 0) {
      return res.status(404).json({ message: "Không có tài khoản nào trong hệ thống." });
    }

    res.status(200).json({
      message: "Lấy thông tin tất cả tài khoản thành công!",
      users,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tài khoản:", error.message);
    res.status(500).json({
      message: "Có lỗi xảy ra khi lấy thông tin tài khoản.",
      error: error.message,
    });
  }
};
// Xóa người dùng
exports.deleteUser = async (req, res) => {
  const userId = req.params.userId; 
  try {
    // Kiểm tra xem người dùng có tồn tại không
    const _id = await User.findById(userId);
    if (!_id) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Xóa người dùng
    await User.findByIdAndDelete(_id);

    res.status(200).json({
      message: "Xóa người dùng thành công",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi xóa người dùng", error: err.message });
  }
};