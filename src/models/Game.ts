import mongoose from "mongoose";

interface TeamMini {
  name: string;
  logo: string;
}

const TeamSchema = new mongoose.Schema<TeamMini>(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
  },
  { _id: false }
);

const GameSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },

    teamA: { type: TeamSchema, required: true },
    teamB: { type: TeamSchema, required: true },

    finished: { type: Boolean, default: false },
    liveUrl: { type: String, default: "" },

    score: {
      a: { type: Number, default: 0 },
      b: { type: Number, default: 0 },
    },

    sets: { type: [String], default: [] },

    createdAt: { type: Date, default: Date.now },
  },
  { strict: true }
);

export default mongoose.models.Game ||
  mongoose.model("Game", GameSchema);
