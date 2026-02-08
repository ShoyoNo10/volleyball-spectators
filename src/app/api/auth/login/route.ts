import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import User from "@/src/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  await connectDB();

  const { username, password, deviceId } = await req.json();

  const user = await User.findOne({ username });
  if (!user) return NextResponse.json({ error: "User байхгүй" }, { status: 400 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: "Password буруу" }, { status: 400 });

  // өдөрт 1 login
  const today = new Date().toDateString();
  if (user.lastLoginDate && user.lastLoginDate !== today) {
    // шинэ өдөр бол reset
    user.activeDeviceId = deviceId;
    user.lastLoginDate = today;
  }

  // өөр device login хийвэл хуучныг logout
  if (user.activeDeviceId && user.activeDeviceId !== deviceId) {
    user.activeDeviceId = deviceId;
    user.lastLoginDate = today;
  }

  await user.save();

  const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "30d" });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
  });

  return res;
}
