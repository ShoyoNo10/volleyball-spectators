import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/src/lib/mongodb";
import TeamSuccess from "@/src/models/TeamSuccess";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) return NextResponse.json(null);

  const data = await TeamSuccess.findOne({
    teamId: new mongoose.Types.ObjectId(teamId),
  });

  return NextResponse.json(data);
}

// 🔥 ADD BEST RESULT OR CREATE PROFILE
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const teamObjectId = new mongoose.Types.ObjectId(body.teamId);

  const updated = await TeamSuccess.findOneAndUpdate(
    { teamId: teamObjectId },
    {
      $setOnInsert: {
        teamId: teamObjectId,
        competitions: body.competitions || [],
        appearances: body.appearances || 0,
        firstYear: body.firstYear || 0,
      },
      ...(body.bestResult && {
        $push: {
          bestResults: body.bestResult, // 🔥 push new result
        },
      }),
    },
    { upsert: true, new: true }
  );

  return NextResponse.json(updated);
}

// 🔥 UPDATE MAIN PROFILE
export async function PATCH(req: Request) {
  await connectDB();
  const body = await req.json();

  await TeamSuccess.findByIdAndUpdate(body.id, {
    competitions: body.competitions,
    appearances: body.appearances,
    firstYear: body.firstYear,
  });

  return NextResponse.json({ success: true });
}

// 🔥 DELETE PROFILE
export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();

  await TeamSuccess.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
