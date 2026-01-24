import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../lib/mongodb";
import Player from "../../../models/Player";

/* ================= TYPES ================= */

interface PlayerStats {
  totalPoints: number;
  avgByMatch: number;
  attackPoints: number;
  attackEfficiency: number;
  blockPoints: number;
  blockSuccess: number;
  servePoints: number;
}

interface PlayerPayload {
  teamId: string;
  number: number;
  name: string;
  position: string;
  nationality?: string;
  birthDate?: string;
  height?: number;
  avatarUrl?: string;
  stats?: Partial<PlayerStats>;
}

/* ================= HELPERS ================= */

function normalizeStats(
  raw?: Partial<PlayerStats>
): PlayerStats {
  return {
    totalPoints: Number(raw?.totalPoints ?? 0),
    avgByMatch: Number(raw?.avgByMatch ?? 0),
    attackPoints: Number(raw?.attackPoints ?? 0),
    attackEfficiency: Number(
      raw?.attackEfficiency ?? 0
    ),
    blockPoints: Number(raw?.blockPoints ?? 0),
    blockSuccess: Number(
      raw?.blockSuccess ?? 0
    ),
    servePoints: Number(raw?.servePoints ?? 0),
  };
}

/* ================= ROUTES ================= */

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const playerId = searchParams.get("playerId");

  if (playerId) {
    const player = await Player.findById(playerId);
    return NextResponse.json(player);
  }

  const query = teamId
    ? { teamId: new mongoose.Types.ObjectId(teamId) }
    : {};

  const players = await Player.find(query).sort({
    number: 1,
  });
  return NextResponse.json(players);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  console.log("RAW BODY:", body);
  console.log("RAW STATS:", body.stats);

  const stats = normalizeStats(body.stats);

  const created = await Player.create({
    teamId: body.teamId,
    number: Number(body.number),
    name: body.name,
    position: body.position,
    nationality: body.nationality || "",
    birthDate: body.birthDate || "",
    height: Number(body.height || 0),
    avatarUrl: body.avatarUrl || "",
    stats,
  });

  return NextResponse.json(created);
}


export async function PATCH(req: Request) {
  await connectDB();
  const {
    id,
    ...body
  }: { id: string } & PlayerPayload =
    (await req.json()) as {
      id: string;
    } & PlayerPayload;

  const stats = normalizeStats(body.stats);

  await Player.findByIdAndUpdate(id, {
    teamId: body.teamId,
    number: body.number,
    name: body.name,
    position: body.position,
    nationality: body.nationality,
    birthDate: body.birthDate,
    height: body.height,
    avatarUrl: body.avatarUrl,
    stats,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  await connectDB();
  const body: { id: string } =
    (await req.json()) as { id: string };

  await Player.findByIdAndDelete(body.id);
  return NextResponse.json({ success: true });
}
