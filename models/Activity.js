const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true }, 
  points: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;
