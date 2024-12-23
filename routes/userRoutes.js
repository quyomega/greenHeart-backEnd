const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

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
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
