import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Access from "@/src/models/Access";

export async function POST(req: Request) {
  await connectDB();
  const { deviceId } = await req.json();

  const access = await Access.findOne({
    deviceId,
    expiresAt: { $gt: new Date() },
  });

  return NextResponse.json({ allowed: !!access });
}
