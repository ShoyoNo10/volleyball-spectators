import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import User from "@/src/models/User";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

type SignupBody = {
  username?: unknown;
  password?: unknown;
  deviceId?: unknown; // optional (frontend явуулвал ажиллана)
};

function getIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

async function hitLimit(key: string, limit: number, windowSec: number) {
  const k = `rl:${key}`;
  const count = await redis.incr(k);
  if (count === 1) await redis.expire(k, windowSec);
  const ttl = await redis.ttl(k);
  return { ok: count <= limit, ttl: ttl > 0 ? ttl : windowSec };
}


function pickString(x: unknown) {
  return typeof x === "string" ? x : "";
}

export async function POST(req: Request) {
  // ✅ 1) Rate limit: IP (1 минутанд 5)
  const ip = getIp(req);
  const ipRL = await hitLimit(`signup:ip:${ip}`, 5, 60);
  if (!ipRL.ok) {
    return NextResponse.json(
      {
        error: "Хэт олон оролдлого хийлээ. Түр хүлээгээд дахин оролдоно уу.",
        resetSec: ipRL.ttl,
      },
      { status: 429, headers: { "Retry-After": String(ipRL.ttl) } },
    );
  }

  // ✅ body parse (type-safe)
  const raw: SignupBody = (await req.json().catch(() => ({}))) as SignupBody;

  const username = pickString(raw.username).trim();
  const password = pickString(raw.password);
  const deviceId = pickString(raw.deviceId).trim();

  // ✅ 2) Rate limit: device (1 цагт 2) — deviceId ирсэн үед л
  if (deviceId) {
    // 🔒 device: өдөрт 3 удаа
    const devRL = await hitLimit(
      `signup:device:${deviceId}`,
      3, // max 3 signup
      60 * 60 * 24, // 24 цаг
    );
    if (!devRL.ok) {
      return NextResponse.json(
        {
          error:
            "Энэ төхөөрөмж дээр түр хязгаарлалт тавигдсан байна. Дараа оролдоно уу.",
          resetSec: devRL.ttl,
        },
        { status: 429, headers: { "Retry-After": String(devRL.ttl) } },
      );
    }
  }

  // ✅ validations (хуучныг чинь эвдэхгүй)
  if (!username || !password) {
    return NextResponse.json({ error: "Мэдээлэл дутуу" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password 8+ тэмдэгт" }, { status: 400 });
  }

  // ✅ DB
  await connectDB();

  const exists = await User.findOne({ username });
  if (exists) {
    return NextResponse.json(
      { error: "Username давхцаж байна" },
      { status: 400 },
    );
  }

  const hash = await bcrypt.hash(password, 10);

  await User.create({ username, password: hash });

  return NextResponse.json({ ok: true });
}
