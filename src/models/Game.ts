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
    date: { type: String, required: true }, // "2026-02-09" гэх мэт
    time: { type: String, required: true }, // "18:00"

    teamA: { type: TeamSchema, required: true },
    teamB: { type: TeamSchema, required: true },

    finished: { type: Boolean, default: false },
    liveUrl: { type: String, default: "" },

    // ✅ match score (sets won): 3:1 гэх мэт
    score: {
      a: { type: Number, default: 0 },
      b: { type: Number, default: 0 },
    },

    // ✅ each set score: ["25:14","25:23"]
    sets: { type: [String], default: [] },

    createdAt: { type: Date, default: Date.now },
  },
  { strict: true }
);

export default mongoose.models.Game || mongoose.model("Game", GameSchema);
