import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Game from "@/src/models/Game";

type Gender = "men" | "women";

type TeamMini = { name: string; logo: string };

type GameDTO = {
  _id: string;
  week: string;
  description: string;
  gender: Gender;
  date: string;
  time: string;
  teamA: TeamMini;
  teamB: TeamMini;
  finished: boolean;
  liveUrl: string;
  score: { a: number; b: number };
  sets: string[];
};

type CreateBody = Omit<GameDTO, "_id">;
type UpdateBody = Partial<Omit<GameDTO, "_id">> & { _id: string };

function isGender(x: unknown): x is Gender {
  return x === "men" || x === "women";
}

function isTeamMini(x: unknown): x is TeamMini {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.name === "string" && typeof o.logo === "string";
}

function toStr(x: unknown, fallback = ""): string {
  return typeof x === "string" ? x : fallback;
}

function toBool(x: unknown, fallback = false): boolean {
  return typeof x === "boolean" ? x : fallback;
}

function toNum(x: unknown, fallback = 0): number {
  return typeof x === "number" && Number.isFinite(x) ? x : fallback;
}

function toScore(x: unknown): { a: number; b: number } {
  if (!x || typeof x !== "object") return { a: 0, b: 0 };
  const o = x as Record<string, unknown>;
  return { a: toNum(o.a, 0), b: toNum(o.b, 0) };
}

function toStringArray(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return x.filter((v): v is string => typeof v === "string").map((s) => s.trim()).filter(Boolean);
}

function mapGameDocToDTO(g: unknown): GameDTO {
  const o = g as {
    _id: { toString(): string };
    week?: unknown;
    description?: unknown;
    gender?: unknown;
    date?: unknown;
    time?: unknown;
    teamA?: unknown;
    teamB?: unknown;
    finished?: unknown;
    liveUrl?: unknown;
    score?: unknown;
    sets?: unknown;
  };

  const teamA = isTeamMini(o.teamA) ? o.teamA : { name: "", logo: "" };
  const teamB = isTeamMini(o.teamB) ? o.teamB : { name: "", logo: "" };

  return {
    _id: o._id.toString(),
    week: toStr(o.week, ""),
    description: toStr(o.description, ""),
    gender: isGender(o.gender) ? o.gender : "men",
    date: toStr(o.date, ""),
    time: toStr(o.time, ""),
    teamA,
    teamB,
    finished: toBool(o.finished, false),
    liveUrl: toStr(o.liveUrl, ""),
    score: toScore(o.score),
    sets: toStringArray(o.sets),
  };
}

/* GET */
export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const genderParam = searchParams.get("gender");
  const filter: Partial<{ gender: Gender }> = {};

  if (isGender(genderParam)) filter.gender = genderParam;

  const games = await Game.find(filter).sort({ date: 1, time: 1 }).lean();

  const dto = (Array.isArray(games) ? games : []).map(mapGameDocToDTO);
  return NextResponse.json(dto);
}

/* POST */
export async function POST(req: Request) {
  await connectDB();

  const body: unknown = await req.json();
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;

  const teamA = o.teamA;
  const teamB = o.teamB;

  if (!isTeamMini(teamA) || !isTeamMini(teamB)) {
    return NextResponse.json({ error: "Teams required" }, { status: 400 });
  }

  const date = toStr(o.date);
  const time = toStr(o.time);
  if (!date || !time) {
    return NextResponse.json({ error: "date/time required" }, { status: 400 });
  }

  const finished = toBool(o.finished, false);

  const create: Omit<GameDTO, "_id"> = {
    week: toStr(o.week, ""),
    description: toStr(o.description, ""),
    gender: isGender(o.gender) ? o.gender : "men",

    date,
    time,

    teamA,
    teamB,

    liveUrl: toStr(o.liveUrl, ""),
    finished,

    score: finished ? toScore(o.score) : { a: 0, b: 0 },
    sets: finished ? toStringArray(o.sets) : [],
  };

  const created = await Game.create(create);
  return NextResponse.json({ ok: true, _id: created._id.toString() }, { status: 201 });
}

/* PUT */
export async function PUT(req: Request) {
  await connectDB();

  const body: unknown = await req.json();
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const id = o._id;

  if (typeof id !== "string" || id.length === 0) {
    return NextResponse.json({ error: "_id required" }, { status: 400 });
  }

  const update: Partial<Omit<GameDTO, "_id">> = {};

  if (typeof o.week === "string") update.week = o.week;
  if (typeof o.description === "string") update.description = o.description;
  if (isGender(o.gender)) update.gender = o.gender;

  if (typeof o.date === "string") update.date = o.date;
  if (typeof o.time === "string") update.time = o.time;

  if (typeof o.liveUrl === "string") update.liveUrl = o.liveUrl;
  if (typeof o.finished === "boolean") update.finished = o.finished;

  if (isTeamMini(o.teamA)) update.teamA = o.teamA;
  if (isTeamMini(o.teamB)) update.teamB = o.teamB;

  // finished toggle logic
  if (o.finished === true) {
    update.score = toScore(o.score);
    update.sets = toStringArray(o.sets);
  } else if (o.finished === false) {
    update.score = { a: 0, b: 0 };
    update.sets = [];
  }

  const updated = await Game.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

/* DELETE */
export async function DELETE(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await Game.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
