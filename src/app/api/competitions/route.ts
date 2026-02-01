import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Competition from "@/src/models/Competition";

export async function GET() {
  await connectDB();
  const data = await Competition.find().sort({ createdAt: -1 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const created = await Competition.create(body);
  return NextResponse.json(created);
}

export async function PATCH(req: Request) {
  await connectDB();
  const { id, name, logo } = await req.json();

  await Competition.findByIdAndUpdate(id, {
    ...(name && { name }),
    ...(logo && { logo }),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();
  await Competition.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
