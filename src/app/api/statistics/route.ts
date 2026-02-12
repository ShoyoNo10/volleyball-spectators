import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Statistic from "@/src/models/Statistic";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const gender = searchParams.get("gender"); // men | women

  const filter: any = {};
  if (gender === "men" || gender === "women") filter.gender = gender;

  const data = await Statistic.find(filter).sort({
    score: -1,
    playerNumber: 1,
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const created = await Statistic.create(body);
  return NextResponse.json(created);
}

export async function PATCH(req: Request) {
  await connectDB();
  const { id, update } = await req.json();
  await Statistic.findByIdAndUpdate(id, update);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();
  await Statistic.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
