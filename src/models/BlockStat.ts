import mongoose from "mongoose";
import { GenericStatSchema } from "./_genericStat";

export default mongoose.models.BlockStat ||
  mongoose.model("BlockStat", GenericStatSchema);
