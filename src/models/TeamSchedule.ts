import mongoose from "mongoose";

interface SetScore {
  teamA: number;
  teamB: number;
}

const SetSchema = new mongoose.Schema<SetScore>(
  {
    teamA: { type: Number, required: true },
    teamB: { type: Number, required: true },
  },
  { _id: false }
);

const TeamScheduleSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    teamA: { type: String, required: true },
    teamB: { type: String, required: true },

    logoA: { type: String, required: true },
    logoB: { type: String, required: true },

    gender: {
      type: String,
      enum: ["men", "women"],
      required: true,
    },

    week: { type: String, required: true },

    matchDate: { type: String, required: true },
    matchTime: { type: String, required: true },

    finished: { type: Boolean, default: false },

    finalA: { type: Number, default: 0 },
    finalB: { type: Number, default: 0 },

    sets: {
      type: [SetSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.TeamSchedule ||
  mongoose.model("TeamSchedule", TeamScheduleSchema);
