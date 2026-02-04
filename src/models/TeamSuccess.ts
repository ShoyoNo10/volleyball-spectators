import mongoose from "mongoose";

const BestResultSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    year: { type: Number, required: true },
  },
  { _id: false }
);

const TeamSuccessSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
    unique: true, // 🔥 1 team = 1 success profile
  },
  competitions: {
    type: [String],
    default: [],
  },
  appearances: {
    type: Number,
    default: 0,
  },
  firstYear: {
    type: Number,
    default: 0,
  },
  bestResults: {
    type: [BestResultSchema], // 🔥 array of results
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TeamSuccess ||
  mongoose.model("TeamSuccess", TeamSuccessSchema);
