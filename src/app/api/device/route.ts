import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Device from "@/src/models/Device";

export async function POST(req: Request) {
  await connectDB();
  const { fingerprint } = await req.json();

  const device = await Device.findOne({ fingerprint });

  if (!device) {
    return NextResponse.json({ access: false });
  }

  const now = new Date();

  if (new Date(device.expiresAt) > now) {
    return NextResponse.json({ access: true });
  }

  return NextResponse.json({ access: false });
}
