const mongoose = require("mongoose");

const activityTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true }, // Loại hoạt động
  points: { type: Number, required: true },             // Điểm tương ứng
});

const ActivityType = mongoose.model("ActivityType", activityTypeSchema);
module.exports = ActivityType;
