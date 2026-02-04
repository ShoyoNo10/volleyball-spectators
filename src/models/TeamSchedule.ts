import mongoose from "mongoose";

const TeamScheduleSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  opponent: {
    type: String,
    required: true,
  },
  opponentLogo: {
    type: String,
    default: "",
  },
  matchDate: {
    type: String,
    required: true,
  },
  matchTime: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TeamSchedule ||
  mongoose.model("TeamSchedule", TeamScheduleSchema);
