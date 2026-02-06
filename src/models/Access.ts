import mongoose from "mongoose";

const AccessSchema = new mongoose.Schema({
  deviceId: String,
  expiresAt: Date,
});

export default mongoose.models.Access ||
  mongoose.model("Access", AccessSchema);
