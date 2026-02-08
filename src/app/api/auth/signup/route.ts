import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import User from "@/src/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  await connectDB();
  const { username, password } = await req.json();

  if (!username || !password)
    return NextResponse.json({ error: "Мэдээлэл дутуу" }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: "Password 8+ тэмдэгт" }, { status: 400 });

  const exists = await User.findOne({ username });
  if (exists)
    return NextResponse.json({ error: "Username давхцаж байна" }, { status: 400 });

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    username,
    password: hash,
  });

  return NextResponse.json({ ok: true });
}
