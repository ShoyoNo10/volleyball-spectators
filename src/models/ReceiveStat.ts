import mongoose from "mongoose";
import { GenericStatSchema } from "./_genericStat";

export default mongoose.models.ReceiveStat ||
  mongoose.model("ReceiveStat", GenericStatSchema);
