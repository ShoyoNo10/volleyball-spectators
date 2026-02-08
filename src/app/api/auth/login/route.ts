import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import User from "@/src/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
  try {
    await connectDB();

    const { username, password, deviceId } = await req.json();

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User байхгүй" }, { status: 400 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Password буруу" }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // шинэ өдөр бол switch reset
    if (user.switchDate !== today) {
      user.switchDate = today;
      user.switchCount = 0;
    }

    // өөр device login
    if (user.activeDeviceId && user.activeDeviceId !== deviceId) {
      if (user.switchCount >= 1) {
        return NextResponse.json(
          { error: "Өдөрт 1 төхөөрөмж л ашиглаж болно" },
          { status: 400 }
        );
      }

      // 🔥 хуучин device logout
      user.activeDeviceId = deviceId;
      user.switchCount += 1;
    } else {
      user.activeDeviceId = deviceId;
    }

    await user.save();

    const token = jwt.sign(
      { userId: user._id.toString() },
      SECRET,
      { expiresIn: "30d" }
    );

    const res = NextResponse.json({ ok: true });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
