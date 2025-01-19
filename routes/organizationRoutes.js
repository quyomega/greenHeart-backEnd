const express = require("express");
const router = express.Router();
const {
  createOrganization,
  addUserToOrganization,
  getUserOrganizations,
  getOrganizationDetails,
  removeUserFromOrganization,
} = require("../controllers/organizationController");
const authMiddleware = require("../middleware/authMiddleware"); // Import middleware

// Route tạo tổ chức
router.post("/create", authMiddleware, createOrganization);

// Route thêm người dùng vào tổ chức
router.post("/add-user", authMiddleware, addUserToOrganization);

// Route lấy danh sách tổ chức của người dùng
router.get("/my-organizations", authMiddleware, getUserOrganizations);

// Route lấy thông tin chi tiết của tổ chức
router.get("/:orgId", authMiddleware, getOrganizationDetails);

//router xóa thành viên khỏi tố chức
router.post("/remove-user", authMiddleware, removeUserFromOrganization);

module.exports = router;
