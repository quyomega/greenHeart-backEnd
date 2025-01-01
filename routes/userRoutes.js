const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Đăng ký
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists!" });
      }
  
      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Tạo người dùng mới
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });
  
      await newUser.save();
      res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Error registering user!", error: err.message });
    }
  });

// Đăng nhập
router.post("/login", async (req, res) => {
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
        role: user.role,  // Trả về role
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          points: user.points, 
          level: user.level 
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server" });
    }
  });
  

// Lấy thông tin cá nhân
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // req.user.id sẽ có từ middleware auth
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      name: user.name,
      email: user.email,
      points: user.points,
      level: user.level,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
//Chỉnh sửa thông tin người dùng
router.put(
  "/update",
  authMiddleware,
  upload.single("avatar"), // Xử lý tải lên file
  async (req, res) => {
    const { name, email, phone, address } = req.body;
    let avatarPath = null;

    try {
      // Lấy thông tin người dùng hiện tại
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Nếu có file tải lên, lưu đường dẫn file mới
      if (req.file) {
        avatarPath = `http://localhost:5000/uploads/${req.file.filename}`;

        // Xóa ảnh cũ nếu có
        if (user.avatar) {
          const oldAvatarPath = path.join(
            __dirname,
            "../uploads",
            path.basename(user.avatar) // Chỉ lấy tên file từ URL lưu trong DB
          );
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath); // Xóa file cũ
          }
        }
      }

      // Chuẩn bị dữ liệu cập nhật
      const updatedData = { name, email, phone, address };
      if (avatarPath) {
        updatedData.avatar = avatarPath;
      }

      // Cập nhật thông tin người dùng
      const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, {
        new: true,
      });

      res.json({
        message: "Cập nhật thông tin thành công!",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating user", error: error.message });
    }
  }
);
module.exports = router;