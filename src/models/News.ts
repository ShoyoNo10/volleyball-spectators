import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  title: String,
  desc: String,
  image: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.News ||
  mongoose.model("News", NewsSchema);
