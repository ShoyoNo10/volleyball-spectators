import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import User from "@/src/models/User";
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
}

const SECRET = process.env.JWT_SECRET as string;

export async function GET(req: Request) {
  await connectDB();

  const cookie = req.headers.get("cookie");
  if (!cookie) {
    return NextResponse.json({ user: null, isPro: false });
  }

  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) {
    return NextResponse.json({ user: null, isPro: false });
  }

  const token = tokenMatch[1];

  try {
    const decoded = jwt.verify(token, SECRET) as TokenPayload;

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ user: null, isPro: false });
    }

    // 🔥 CLIENT deviceId
    const deviceId = req.headers.get("x-device-id");

    // 🔥 Хэрвээ өөр device бол → logout
    if (user.activeDeviceId && user.activeDeviceId !== deviceId) {
      return NextResponse.json({
        user: null,
        isPro: false,
        forceLogout: true,
      });
    }

    const isPro =
      user.proExpires &&
      new Date(user.proExpires).getTime() > Date.now();

    return NextResponse.json({
      user: user.username,
      isPro: !!isPro,
    });
  } catch {
    return NextResponse.json({ user: null, isPro: false });
  }
}
