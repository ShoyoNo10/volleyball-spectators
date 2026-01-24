import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Match from "../../../models/Match";

export async function GET() {
  await connectDB();
  const data = await Match.find().sort({ createdAt: -1 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const created = await Match.create(body);
  return NextResponse.json(created);
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();
  await Match.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  await connectDB();
  const { id, status, liveUrl } = await req.json();

  const update: { status?: string; liveUrl?: string } = {};
  if (status) update.status = status;
  if (typeof liveUrl === "string") update.liveUrl = liveUrl;

  await Match.findByIdAndUpdate(id, update);
  return NextResponse.json({ success: true });
}
