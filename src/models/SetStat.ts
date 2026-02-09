import mongoose from "mongoose";
import { GenericStatSchema } from "./_genericStat";

export default mongoose.models.SetStat ||
  mongoose.model("SetStat", GenericStatSchema);
