import mongoose from "mongoose";

const StandingSchema = new mongoose.Schema({
  gender: { type: String, enum: ["men", "women"], required: true },

  teamName: { type: String, required: true },
  teamCode: { type: String, required: true },
  logo: { type: String, default: "" },

  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },

  // 🔥 LOSE (шинэ)
  lost: { type: Number, default: 0 },

  points: { type: Number, default: 0 },

  // 🔥 MANUAL SET (NaN-гүй)
  setText: { type: String, default: "0-0" },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Standing ||
  mongoose.model("Standing", StandingSchema);
