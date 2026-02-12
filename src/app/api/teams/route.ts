import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Team from "../../../models/Team";

export async function GET() {
  await connectDB();
  const data = await Team.find().sort({ createdAt: 1 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const created = await Team.create(body);
  return NextResponse.json(created);
}

// ✅ NEW: EDIT
export async function PUT(req: Request) {
  await connectDB();
  const body = await req.json();

  const { id, update } = body as {
    id: string;
    update: Partial<{
      name: string;
      code: string;
      gender: "men" | "women";
      flagUrl: string;
    }>;
  };

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updated = await Team.findByIdAndUpdate(id, update, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();
  await Team.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
