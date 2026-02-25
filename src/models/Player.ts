import mongoose from "mongoose";

const StatsSchema = new mongoose.Schema({
  totalPoints: { type: Number, default: 0 },
  avgByMatch: { type: Number, default: 0 },
  attackPoints: { type: Number, default: 0 },
  attackEfficiency: { type: Number, default: 0 },
  blockPoints: { type: Number, default: 0 },
  blockSuccess: { type: Number, default: 0 },
  servePoints: { type: Number, default: 0 },
});

const PlayerSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  number: { type: Number, required: true },
  name: { type: String, required: true },
  position: { type: String, required: true },
  nationality: { type: String, default: "" },
  birthDate: { type: String, default: "" },
  height: { type: Number, default: 0 },
  avatarUrl: { type: String, default: "" },
  stats: { type: StatsSchema, default: () => ({}) },
  likes: { type: Number, default: 0 },
likedBy: { type: [String], default: [] }, // deviceId эсвэл userId
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Player ||
  mongoose.model("Player", PlayerSchema);
