import mongoose from "mongoose";

const CompetitionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { strict: false }
);

export default mongoose.models.Competition ||
  mongoose.model("Competition", CompetitionSchema);
