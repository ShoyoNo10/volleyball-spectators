import mongoose from "mongoose";

const TeamStatsSchema = new mongoose.Schema(
  {
    all: { type: Number, default: 0 },
    attack: { type: Number, default: 0 },
    block: { type: Number, default: 0 },
    serve: { type: Number, default: 0 },
    error: { type: Number, default: 0 }, // ✅ NEW: алдаагаар авсан
  },
  { _id: false },
);

const PlayerStatsSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // frontend uuid
    name: { type: String, required: true },
    number: { type: Number, required: true },
    all: { type: Number, default: 0 },
    attack: { type: Number, default: 0 },
    block: { type: Number, default: 0 },
    serve: { type: Number, default: 0 },
    defense: { type: Number, default: 0 }, // ✅ NEW: хамгаалалт
    set: { type: Number, default: 0 },
  },
  { _id: false },
);

const TeamBlockSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true },
    stats: { type: TeamStatsSchema, default: () => ({}) },
    players: { type: [PlayerStatsSchema], default: [] },
  },
  { _id: false },
);

const GameStatsSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      unique: true,
    },
    teamA: { type: TeamBlockSchema, required: true },
    teamB: { type: TeamBlockSchema, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { strict: true },
);

export default mongoose.models.GameStats ||
  mongoose.model("GameStats", GameStatsSchema);
