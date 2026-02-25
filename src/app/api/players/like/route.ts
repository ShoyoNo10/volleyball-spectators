import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Player from "@/src/models/Player";

export async function POST(req: Request) {
  await connectDB();

  const { playerId, deviceId } = (await req.json()) as {
    playerId: string;
    deviceId: string;
  };

  if (!playerId || !deviceId) {
    return NextResponse.json({ error: "Missing playerId/deviceId" }, { status: 400 });
  }

  const p = await Player.findById(playerId);
  if (!p) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const liked = (p.likedBy || []).includes(deviceId);

  if (liked) {
    p.likedBy = (p.likedBy || []).filter((x: string) => x !== deviceId);
    p.likes = Math.max(0, (p.likes || 0) - 1);
  } else {
    p.likedBy = [...(p.likedBy || []), deviceId];
    p.likes = (p.likes || 0) + 1;
  }

  await p.save();

  return NextResponse.json({
    likes: p.likes,
    liked: !liked,
  });
}