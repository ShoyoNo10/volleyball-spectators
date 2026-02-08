import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,

  activeDeviceId: String,
  lastLoginDate: String,

  proExpires: Date, // 🔥 PRO эрх
});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
