import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import BlockStat from "@/src/models/BlockStat";

type Gender = "men" | "women";

type BlockStatDoc = {
  _id: string;
  gender: Gender;
  playerNumber: number;
  playerName: string;
  avatar?: string;
  teamCode: string;
  score: number;
};

type CreateBody = Omit<BlockStatDoc, "_id">;
type UpdateBody = Partial<Omit<BlockStatDoc, "_id">> & { _id: string };

function isGender(x: string | null): x is Gender {
  return x === "men" || x === "women";
}

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const genderParam = searchParams.get("gender");

  const filter: Partial<Pick<BlockStatDoc, "gender">> = {};
  if (isGender(genderParam)) filter.gender = genderParam;

  const data = await BlockStat.find(filter).sort({ score: -1 }).lean<BlockStatDoc[]>();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();

  const body = (await req.json()) as CreateBody;
  const created = await BlockStat.create(body);
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: Request) {
  await connectDB();

  const body = (await req.json()) as UpdateBody;
  const { _id, ...rest } = body;

  if (!_id) return NextResponse.json({ error: "_id required" }, { status: 400 });

  const updated = await BlockStat.findByIdAndUpdate(_id, rest, { new: true }).lean<BlockStatDoc | null>();
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await BlockStat.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
