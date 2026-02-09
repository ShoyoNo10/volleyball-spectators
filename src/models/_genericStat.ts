import mongoose, { Schema } from "mongoose";

export type Gender = "men" | "women";

export const GenericStatSchema = new Schema(
  {
    gender: { type: String, enum: ["men", "women"], required: true },
    playerNumber: { type: Number, required: true },
    playerName: { type: String, required: true },
    avatar: { type: String, default: "/user.png" },
    teamCode: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { timestamps: true }
);
