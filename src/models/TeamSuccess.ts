import mongoose, { Schema, Types } from "mongoose";

interface BestResult {
  title: string;
  year: number;
}

interface CompetitionBlock {
  competitionName: string;
  appearances: number;
  firstYear: number;
  bestResults: BestResult[];
}

export interface TeamSuccessDoc {
  teamId: Types.ObjectId;
  competitions: CompetitionBlock[];
  createdAt: Date;
  updatedAt: Date;
}

const BestResultSchema = new Schema<BestResult>(
  {
    title: { type: String, required: true },
    year: { type: Number, required: true },
  },
  { _id: false }
);

const CompetitionSchema = new Schema<CompetitionBlock>(
  {
    competitionName: { type: String, required: true },
    appearances: { type: Number, default: 0 },
    firstYear: { type: Number, default: 0 },
    bestResults: { type: [BestResultSchema], default: [] },
  },
  { _id: true }
);

const TeamSuccessSchema = new Schema<TeamSuccessDoc>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      unique: true, // 🔥 нэг team → нэг document
    },
    competitions: {
      type: [CompetitionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.TeamSuccess ||
  mongoose.model<TeamSuccessDoc>("TeamSuccess", TeamSuccessSchema);
