import mongoose from "mongoose";

type Gender = "men" | "women";

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
    // ✅ NEW
    week: { type: String, default: "" },         // "Week2" / "testnii week"
    description: { type: String, default: "" },  // optional
    gender: { type: String, enum: ["men", "women"], default: "men" },

    date: { type: String, required: true }, // "2026-02-09"
    time: { type: String, required: true }, // "18:00"

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

export default mongoose.models.Game || mongoose.model("Game", GameSchema);
