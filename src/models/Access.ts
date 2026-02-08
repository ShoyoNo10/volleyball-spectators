// import mongoose from "mongoose";

// const AccessSchema = new mongoose.Schema({
//   deviceId: String,
//   expiresAt: Date,
// });

// export default mongoose.models.Access ||
//   mongoose.model("Access", AccessSchema);

import mongoose from "mongoose";

const AccessSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  expiresAt: { type: Date, required: true },

  // дараагийн алхамд ашиглана
  deviceId: { type: String, default: "" },
  switchCount: { type: Number, default: 0 },
  switchDate: { type: String, default: "" }, // YYYY-MM-DD
  isWatching: { type: Boolean, default: false },
  lastPing: { type: Number, default: 0 },
});

export default mongoose.models.Access || mongoose.model("Access", AccessSchema);
