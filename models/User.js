const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Chỉ cho phép 2 giá trị
      default: "user", // Mặc định là "user"
    },
    points: { type: Number, default: 0 }, // Thêm trường points
    level: { type: String, default: "Tân Binh" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
