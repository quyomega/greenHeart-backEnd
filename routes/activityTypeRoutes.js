const express = require("express");
const router = express.Router();
const {
  getActivityTypes,
  addActivityType,
} = require("../controllers/activityTypeController");

// Route lấy danh sách loại hành động
router.get("/get-list", getActivityTypes);

// Route thêm loại hành động
router.post("/add", addActivityType);

module.exports = router;
