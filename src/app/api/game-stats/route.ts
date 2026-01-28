import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../lib/mongodb";
import GameStats from "../../../models/GameStats";

function isValidId(v: unknown): v is string {
  return typeof v === "string" && mongoose.Types.ObjectId.isValid(v);
}

/* GET */
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");

  if (!isValidId(gameId)) {
    return NextResponse.json({ error: "Invalid gameId" }, { status: 400 });
  }

  const stats = await GameStats.findOne({
    gameId: new mongoose.Types.ObjectId(gameId),
  });

  return NextResponse.json(stats);
}

/* UPSERT */
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  if (!isValidId(body.gameId)) {
    return NextResponse.json({ error: "Invalid gameId" }, { status: 400 });
  }

  const payload = {
    gameId: new mongoose.Types.ObjectId(body.gameId),
    teamA: body.teamA,
    teamB: body.teamB,
  };

  const existing = await GameStats.findOne({
    gameId: payload.gameId,
  });

  if (existing) {
    await GameStats.findByIdAndUpdate(existing._id, payload);
    return NextResponse.json({ success: true, updated: true });
  }

  const created = await GameStats.create(payload);
  return NextResponse.json(created, { status: 201 });
}
