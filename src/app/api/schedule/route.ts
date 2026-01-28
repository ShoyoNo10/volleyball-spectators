import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Game from "../../../models/Game";

/* GET */
export async function GET() {
  await connectDB();
  const games = await Game.find().sort({ date: 1, time: 1 });

  return NextResponse.json(
    games.map((g) => ({
      _id: g._id.toString(),
      teamA: g.teamA,
      teamB: g.teamB,
      date: g.date,
      time: g.time,
      finished: g.finished,
      score: g.score,
      sets: g.sets,
      liveUrl: g.liveUrl,
    }))
  );
}

/* POST */
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  if (!body.teamA?.name || !body.teamB?.name) {
    return NextResponse.json({ error: "Teams required" }, { status: 400 });
  }

  const created = await Game.create({
    date: body.date,
    time: body.time,
    liveUrl: body.liveUrl || "",
    finished: false,
    teamA: body.teamA,
    teamB: body.teamB,
  });

  return NextResponse.json(created, { status: 201 });
}
