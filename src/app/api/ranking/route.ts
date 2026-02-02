import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Ranking from "@/src/models/Ranking";

export async function GET() {
  await connectDB();
  const data = await Ranking.find();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const created = await Ranking.create(body);
  return NextResponse.json(created);
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();
  await Ranking.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  await connectDB();
  const { id, update } = await req.json();
  await Ranking.findByIdAndUpdate(id, update);
  return NextResponse.json({ success: true });
}
