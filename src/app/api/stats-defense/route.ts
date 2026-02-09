import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import DefenseStat from "@/src/models/DefenseStat";

type Gender = "men" | "women";

type DefenseStatDoc = {
  _id: string;
  gender: Gender;
  playerNumber: number;
  playerName: string;
  avatar?: string;
  teamCode: string;
  score: number;
};

type CreateBody = Omit<DefenseStatDoc, "_id">;
type UpdateBody = Partial<Omit<DefenseStatDoc, "_id">> & { _id: string };

function isGender(x: string | null): x is Gender {
  return x === "men" || x === "women";
}

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const genderParam = searchParams.get("gender");

  const filter: Partial<Pick<DefenseStatDoc, "gender">> = {};
  if (isGender(genderParam)) filter.gender = genderParam;

  const data = await DefenseStat.find(filter).sort({ score: -1 }).lean<DefenseStatDoc[]>();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();

  const body = (await req.json()) as CreateBody;
  const created = await DefenseStat.create(body);
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: Request) {
  await connectDB();

  const body = (await req.json()) as UpdateBody;
  const { _id, ...rest } = body;

  if (!_id) return NextResponse.json({ error: "_id required" }, { status: 400 });

  const updated = await DefenseStat.findByIdAndUpdate(_id, rest, { new: true }).lean<DefenseStatDoc | null>();
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await DefenseStat.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
