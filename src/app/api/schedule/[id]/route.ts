import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Game from "../../../../models/Game";

type TeamMini = { name: string; logo: string };
type Score = { a: number; b: number };

type PatchBody = Partial<{
  date: string;
  time: string;
  finished: boolean;
  liveUrl: string;
  teamA: TeamMini;
  teamB: TeamMini;
  score: Score;
  sets: string[];
}>;

type GameUpdate = Partial<{
  date: string;
  time: string;
  finished: boolean;
  liveUrl: string;
  teamA: TeamMini;
  teamB: TeamMini;
  score: Score;
  sets: string[];
}>;

// ✅ Next.js-ийн params Promise кейсийг зөв барина
type Context = { params: Promise<{ id: string }> };

const isTeamMini = (v: unknown): v is TeamMini => {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return typeof obj.name === "string" && typeof obj.logo === "string";
};

const isScore = (v: unknown): v is Score => {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return typeof obj.a === "number" && typeof obj.b === "number";
};

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

export async function PATCH(req: Request, ctx: Context) {
  await connectDB();

  // ✅ params promise -> await
  const { id } = await ctx.params;

  const body = (await req.json()) as PatchBody;

  const update: GameUpdate = {};

  if (typeof body.date === "string") update.date = body.date;
  if (typeof body.time === "string") update.time = body.time;

  if (typeof body.finished === "boolean") update.finished = body.finished;

  if (typeof body.liveUrl === "string") update.liveUrl = body.liveUrl;

  if (isTeamMini(body.teamA)) update.teamA = body.teamA;
  if (isTeamMini(body.teamB)) update.teamB = body.teamB;

  if (isScore(body.score)) update.score = body.score;

  if (isStringArray(body.sets)) update.sets = body.sets;

  const updated = await Game.findByIdAndUpdate(id, update, { new: true });

  if (!updated) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json({
    _id: updated._id.toString(),
    teamA: updated.teamA,
    teamB: updated.teamB,
    date: updated.date,
    time: updated.time,
    finished: updated.finished,
    score: updated.score,
    sets: updated.sets,
    liveUrl: updated.liveUrl,
  });
}

export async function DELETE(req: Request, ctx: Context) {
  await connectDB();

  const { id } = await ctx.params;

  const deleted = await Game.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

