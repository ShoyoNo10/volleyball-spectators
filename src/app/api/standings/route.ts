import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Standing from "@/src/models/Standing";

export async function GET() {
  await connectDB();
  const data = await Standing.find().sort({
    points: -1,
    won: -1,
    played: 1,
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const created = await Standing.create(body);
  return NextResponse.json(created);
}

export async function PATCH(req: Request) {
  await connectDB();
  const { id, update } = await req.json();
  await Standing.findByIdAndUpdate(id, update);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();
  await Standing.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
