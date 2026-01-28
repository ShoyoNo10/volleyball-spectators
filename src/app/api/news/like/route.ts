import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import News from "@/src/models/News";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { id } = await req.json();

    // 🔥 ID шалгалт
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid news id" },
        { status: 400 }
      );
    }

    const updated = await News.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "News not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      likes: updated.likes,
    });
  } catch (err) {
    console.error("LIKE API ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
