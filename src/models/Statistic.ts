import mongoose from "mongoose";

const StatisticSchema = new mongoose.Schema(
  {
    gender: { type: String, enum: ["men", "women"], required: true },

    playerNumber: { type: Number, required: true },
    playerName: { type: String, required: true },
    avatar: { type: String, default: "/user.png" },
    teamCode: { type: String, required: true },

    score: { type: Number, required: true }, // 👈 PTS гэж ойлго
  },
  { timestamps: true }
);

export default mongoose.models.Statistic ||
  mongoose.model("Statistic", StatisticSchema);
