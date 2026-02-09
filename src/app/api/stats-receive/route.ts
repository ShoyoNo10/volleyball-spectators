import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import ReceiveStat from "@/src/models/ReceiveStat";

type Gender = "men" | "women";

type ReceiveStatDoc = {
  _id: string;
  gender: Gender;
  playerNumber: number;
  playerName: string;
  avatar?: string;
  teamCode: string;
  score: number;
};

type CreateBody = Omit<ReceiveStatDoc, "_id">;
type UpdateBody = Partial<Omit<ReceiveStatDoc, "_id">> & { _id: string };

function isGender(x: string | null): x is Gender {
  return x === "men" || x === "women";
}

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const genderParam = searchParams.get("gender");

  const filter: Partial<Pick<ReceiveStatDoc, "gender">> = {};
  if (isGender(genderParam)) filter.gender = genderParam;

  const data = await ReceiveStat.find(filter).sort({ score: -1 }).lean<ReceiveStatDoc[]>();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();

  const body = (await req.json()) as CreateBody;
  const created = await ReceiveStat.create(body);
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: Request) {
  await connectDB();

  const body = (await req.json()) as UpdateBody;
  const { _id, ...rest } = body;

  if (!_id) return NextResponse.json({ error: "_id required" }, { status: 400 });

  const updated = await ReceiveStat.findByIdAndUpdate(_id, rest, { new: true }).lean<ReceiveStatDoc | null>();
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await ReceiveStat.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
