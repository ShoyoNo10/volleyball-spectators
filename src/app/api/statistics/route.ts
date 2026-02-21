import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Statistic from "@/src/models/Statistic";
import mongoose from "mongoose";

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

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing id" },
      { status: 400 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid id" },
      { status: 400 }
    );
  }

  const deleted = await Statistic.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
