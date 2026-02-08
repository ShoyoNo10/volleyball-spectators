// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema({
//   username: { type: String, unique: true },
//   password: String,

//   activeDeviceId: String,
//   lastLoginDate: String,

//   proExpires: Date, // 🔥 PRO эрх
// });

// export default mongoose.models.User ||
//   mongoose.model("User", UserSchema);

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,

  proExpires: Date,

  activeDeviceId: String,   // 🔥 идэвхтэй device
  switchCount: { type: Number, default: 0 },
  switchDate: String,       // YYYY-MM-DD
});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);

