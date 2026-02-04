import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/src/lib/mongodb";
import TeamSuccess from "@/src/models/TeamSuccess";

/* ================= GET ================= */
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json([], { status: 200 });
  }

  const doc = await TeamSuccess.findOne({
    teamId: new mongoose.Types.ObjectId(teamId),
  });

  return NextResponse.json(doc);
}

/* ================= POST (ADD COMPETITION) ================= */
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const teamId = new mongoose.Types.ObjectId(body.teamId);

  const competitionBlock = {
    competitionName: String(body.competitionName),
    appearances: Number(body.appearances || 0),
    firstYear: Number(body.firstYear || 0),
    bestResults: Array.isArray(body.bestResults)
      ? body.bestResults.map((r: { title: string; year: number }) => ({
          title: r.title,
          year: Number(r.year),
        }))
      : [],
  };

  const doc = await TeamSuccess.findOneAndUpdate(
    { teamId },
    {
      $push: { competitions: competitionBlock },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json(doc);
}

/* ================= PATCH (UPDATE COMPETITION) ================= */
export async function PATCH(req: Request) {
  await connectDB();
  const body = await req.json();

  const { teamId, competitionId, competitionName, appearances, firstYear, bestResults } = body;

  const updated = await TeamSuccess.findOneAndUpdate(
    {
      teamId: new mongoose.Types.ObjectId(teamId),
      "competitions._id": new mongoose.Types.ObjectId(competitionId),
    },
    {
      $set: {
        "competitions.$.competitionName": competitionName,
        "competitions.$.appearances": Number(appearances),
        "competitions.$.firstYear": Number(firstYear),
        "competitions.$.bestResults": Array.isArray(bestResults)
          ? bestResults.map((r: { title: string; year: number }) => ({
              title: r.title,
              year: Number(r.year),
            }))
          : [],
      },
    },
    { new: true }
  );

  return NextResponse.json(updated);
}

/* ================= DELETE (REMOVE COMPETITION) ================= */
export async function DELETE(req: Request) {
  await connectDB();
  const body = await req.json();

  const { teamId, competitionId } = body;

  const updated = await TeamSuccess.findOneAndUpdate(
    { teamId: new mongoose.Types.ObjectId(teamId) },
    {
      $pull: {
        competitions: { _id: new mongoose.Types.ObjectId(competitionId) },
      },
    },
    { new: true }
  );

  return NextResponse.json(updated);
}
