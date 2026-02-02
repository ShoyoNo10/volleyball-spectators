import mongoose from "mongoose";

const RankingSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ["men", "women"],
    required: true,
  },

  teamName: { type: String, required: true },
  teamCode: { type: String, required: true }, // JPN
  logo: { type: String, default: "" },

  score: { type: Number, default: 0 }, // 🔥 only score

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Ranking ||
  mongoose.model("Ranking", RankingSchema);
