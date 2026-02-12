import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import News from "@/src/models/News";

export async function GET() {
  await connectDB();
  const news = await News.find().sort({ createdAt: -1 });
  return NextResponse.json(news);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const created = await News.create({
    title: body.title,
    desc: body.desc,
    image: body.image,
    author: body.author || "VNL Admin",
    createdAt: body.createdAt || new Date(),
  });

  return NextResponse.json(created);
}

// ✅ NEW: EDIT
export async function PUT(req: Request) {
  await connectDB();
  const body = await req.json();

  const { id, update } = body as {
    id: string;
    update: Partial<{
      title: string;
      desc: string;
      image: string;
      author: string;
      createdAt: string | Date;
    }>;
  };

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updated = await News.findByIdAndUpdate(id, update, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();

  await News.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
