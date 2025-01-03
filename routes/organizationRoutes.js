const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const authMiddleware = require("../middleware/authMiddleware"); // Import middleware

// Route tạo tổ chức
router.post("/create", authMiddleware, organizationController.createOrganization);

// Route thêm người dùng vào tổ chức
router.post("/add-user", authMiddleware, organizationController.addUserToOrganization);

// Route lấy danh sách tổ chức của người dùng
router.get("/my-organizations", authMiddleware, organizationController.getUserOrganizations);

// Route lấy thông tin chi tiết của tổ chức
router.get("/:orgId", authMiddleware, organizationController.getOrganizationDetails);

//router xóa thành viên khỏi tố chức
router.post("/remove-user", authMiddleware, organizationController.removeUserFromOrganization);

module.exports = router;
