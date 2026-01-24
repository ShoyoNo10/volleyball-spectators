import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Live from "@/src/models/Live";

export async function GET() {
  await connectDB();
  const live = await Live.findOne().sort({ updatedAt: -1 });
  return NextResponse.json(live);
}

export async function POST(req: Request) {
  await connectDB();
  const { url } = await req.json();

  const created = await Live.create({ url });
  return NextResponse.json(created);
}
