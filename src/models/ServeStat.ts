import mongoose from "mongoose";
import { GenericStatSchema } from "./_genericStat";

export default mongoose.models.ServeStat ||
  mongoose.model("ServeStat", GenericStatSchema);
