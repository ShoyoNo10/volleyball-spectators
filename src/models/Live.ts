import mongoose from "mongoose";

const LiveSchema = new mongoose.Schema({
  url: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Live ||
  mongoose.model("Live", LiveSchema);
