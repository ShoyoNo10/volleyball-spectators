import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  fingerprint: String,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Device ||
  mongoose.model("Device", DeviceSchema);
