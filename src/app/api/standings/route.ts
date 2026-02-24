import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Standing from "@/src/models/Standing";

type StandingDoc = {
  _id: string;
  gender: "men" | "women";
  teamName: string;
  teamCode: string;
  logo: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  setText: string;
};

export async function GET() {
  await connectDB();

  // 1️⃣ Mongo хадгалсан дарааллаар авна
  const data: StandingDoc[] = await Standing.find().sort({ _id: 1 }).lean();

  // 2️⃣ Бүгд 0 эсэх
  const allZero =
    data.length > 0 &&
    data.every((t) => (t.points ?? 0) === 0);

  if (allZero) {
    return NextResponse.json(data); // mongo order
  }

  // 3️⃣ Оноо орсон үед ranking sort
  const ranked = [...data].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.won !== a.won) return b.won - a.won;
    return a.played - b.played;
  });

  return NextResponse.json(ranked);
}

// export async function GET() {
//   await connectDB();
//   const data = await Standing.find().sort({
//     points: -1,
//     won: -1,
//     played: 1,
//   });
//   return NextResponse.json(data);
// }

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const created = await Standing.create(body);
  return NextResponse.json(created);
}

export async function PATCH(req: Request) {
  await connectDB();
  const { id, update } = await req.json();
  await Standing.findByIdAndUpdate(id, update);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();
  await Standing.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
