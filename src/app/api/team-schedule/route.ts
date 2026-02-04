import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/src/lib/mongodb";
import TeamSchedule from "@/src/models/TeamSchedule";

/* GET */
export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");

  const filter: { teamId?: mongoose.Types.ObjectId } = {};
  if (teamId) {
    filter.teamId = new mongoose.Types.ObjectId(teamId);
  }

  const data = await TeamSchedule.find(filter).sort({
    matchDate: 1,
    matchTime: 1,
  });

  return NextResponse.json(data);
}

/* POST */
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const created = await TeamSchedule.create({
    teamId: new mongoose.Types.ObjectId(body.teamId),
    teamA: body.teamA,
    teamB: body.teamB,
    logoA: body.logoA,
    logoB: body.logoB,
    gender: body.gender,
    week: body.week,
    matchDate: body.matchDate,
    matchTime: body.matchTime,
    finished: false,
    finalA: 0,
    finalB: 0,
    sets: [],
  });

  return NextResponse.json(created);
}

/* PATCH */
export async function PATCH(req: Request) {
  await connectDB();
  const body = await req.json();

  const { id, ...update } = body;

  await TeamSchedule.findByIdAndUpdate(id, update);
  return NextResponse.json({ success: true });
}

/* DELETE */
export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();

  await TeamSchedule.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
