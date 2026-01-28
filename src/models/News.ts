import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    title: String,
    desc: String,
    image: String,
    author: {
      type: String,
      default: "VNL Admin",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "news", // 🔥 энэ чинь яг Atlas дээрх нэртэй таарна
  }
);

export default mongoose.models.News ||
  mongoose.model("News", NewsSchema);
