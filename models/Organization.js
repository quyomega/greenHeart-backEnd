const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ID của người tạo
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Liên kết với người dùng
}, { timestamps: true });

module.exports = mongoose.model("Organization", organizationSchema);
