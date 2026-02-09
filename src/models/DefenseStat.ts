import mongoose from "mongoose";
import { GenericStatSchema } from "./_genericStat";

export default mongoose.models.DefenseStat ||
  mongoose.model("DefenseStat", GenericStatSchema);
