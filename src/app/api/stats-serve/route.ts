import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import ServeStat from "@/src/models/ServeStat";

type Gender = "men" | "women";

type ServeStatDoc = {
  _id: string;
  gender: Gender;
  playerNumber: number;
  playerName: string;
  avatar?: string;
  teamCode: string;
  score: number;
};

type CreateBody = Omit<ServeStatDoc, "_id">;
type UpdateBody = Partial<Omit<ServeStatDoc, "_id">> & { _id: string };

function isGender(x: string | null): x is Gender {
  return x === "men" || x === "women";
}

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const genderParam = searchParams.get("gender");

  const filter: Partial<Pick<ServeStatDoc, "gender">> = {};
  if (isGender(genderParam)) filter.gender = genderParam;

  const data = await ServeStat.find(filter).sort({ score: -1 }).lean<ServeStatDoc[]>();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();

  const body = (await req.json()) as CreateBody;
  const created = await ServeStat.create(body);
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: Request) {
  await connectDB();

  const body = (await req.json()) as UpdateBody;
  const { _id, ...rest } = body;

  if (!_id) return NextResponse.json({ error: "_id required" }, { status: 400 });

  const updated = await ServeStat.findByIdAndUpdate(_id, rest, { new: true }).lean<ServeStatDoc | null>();
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await ServeStat.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
