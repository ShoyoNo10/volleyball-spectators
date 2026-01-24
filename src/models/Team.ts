import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true }, // ARG, BRA, FRA
  gender: { type: String, enum: ["men", "women"], required: true },
  flagUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Team ||
  mongoose.model("Team", TeamSchema);
