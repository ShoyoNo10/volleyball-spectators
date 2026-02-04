import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import TeamSchedule from "@/src/models/TeamSchedule";
import mongoose from "mongoose";

/* GET */
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) return NextResponse.json([]);

  const data = await TeamSchedule.find({
    teamId: new mongoose.Types.ObjectId(teamId),
  }).sort({ matchDate: 1, matchTime: 1 });

  return NextResponse.json(data);
}

/* CREATE */
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const created = await TeamSchedule.create(body);
  return NextResponse.json(created);
}

/* UPDATE */
export async function PATCH(req: Request) {
  await connectDB();
  const { id, ...update } = await req.json();

  const updated = await TeamSchedule.findByIdAndUpdate(
    id,
    update,
    { new: true }
  );

  return NextResponse.json(updated);
}

/* DELETE */
export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();

  await TeamSchedule.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
