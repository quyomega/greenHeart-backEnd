const mongoose = require("mongoose");

const MissionSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      reward: {
        points: { type: Number, default: 0 },
        diligencePoints: { type: Number, default: 0 }
      },
      assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Mảng người dùng đã nhận nhiệm vụ
      type: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Mission", MissionSchema);
  