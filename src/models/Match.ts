import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
  date: { type: String, required: true },
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  logoA: { type: String, default: "" },
  logoB: { type: String, default: "" },
  gender: { type: String, required: true },
  time: { type: String, required: true },

  status: {
    type: String,
    enum: ["live", "upcoming", "finished"],
    default: "upcoming",
  },

  liveUrl: { type: String, default: "" },

  // 🔥 NEW — ТЭМЦЭЭНИЙ НЭР
  competition: {
    type: String,
    default: "VNL",
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Match ||
  mongoose.model("Match", MatchSchema);
