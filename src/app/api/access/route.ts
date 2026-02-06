import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Payment from "@/src/models/Payment";

export async function POST(req: Request) {
  await connectDB();
  const { deviceId } = await req.json();

  const pay = await Payment.findOne({
    deviceId,
    paid: true,
    expiresAt: { $gt: new Date() },
  });

  return NextResponse.json({ access: !!pay });
}
