import mongoose from "mongoose";

const StatisticSchema = new mongoose.Schema({
  gender: { type: String, enum: ["men", "women"], required: true },

  playerName: { type: String, required: true },
  teamCode: { type: String, required: true },

  played: { type: Number, default: 0 },

  points: { type: Number, default: 0 }, // PTS
  attackPts: { type: Number, default: 0 }, // A PTS
  blockPts: { type: Number, default: 0 }, // B PTS
  servePts: { type: Number, default: 0 }, // S PTS

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Statistic ||
  mongoose.model("Statistic", StatisticSchema);
