const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
} = require("../controllers/userController");

const router = express.Router();
// Đăng ký
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

// Lấy thông tin cá nhân
router.get("/profile", authMiddleware, getProfile);

// Chỉnh sửa thông tin cá nhân
router.put("/update", authMiddleware, upload.single("avatar"), updateProfile);

//Lấy thông tin của tất cả các tài khoản
router.get("/allprofile", authMiddleware, getAllUsers);

module.exports = router;
