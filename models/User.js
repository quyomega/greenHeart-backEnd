const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    points: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    phone: { type: String, default: 0 },
    address: { type: String, default: 0 },
    avatar: { type: String, default: 0 },
    organizations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    ],
    diligencePoints: {
      type: Map,
      of: Number,
      default: {}, // Điểm siêng năng theo tháng (key: YYYY-MM, value: tổng điểm)
    },
    dailyMissions: [
      {
        missionId: { type: mongoose.Schema.Types.ObjectId, ref: "Mission" },
        status: { type: String, enum: ["pending", "completed"], default: "pending" },
        assignedAt: { type: Date, default: Date.now }, // Thời gian gán nhiệm vụ
        expiresAt: { type: Date }, // Thời gian hết hạn
        completedAt: { type: Date },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
``;
