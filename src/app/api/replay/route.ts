import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import ReplayVideo from "@/src/models/ReplayVideo";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const competitionId = searchParams.get("competitionId");

    const query = competitionId
      ? { competitionId }
      : {};

    const videos = await ReplayVideo.find(query).sort({
      createdAt: -1,
    });

    return NextResponse.json(videos);
  } catch (err) {
    console.error("REPLAY GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load videos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    console.log("REPLAY API BODY:", body); // 🔥 debug

    const created = await ReplayVideo.create({
      title: body.title,
      thumbnail: body.thumbnail,
      videoUrl: body.videoUrl,
      competitionId: body.competitionId,
    });

    return NextResponse.json(created);
  } catch (err) {
    console.error("REPLAY POST ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create replay video" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();

    await ReplayVideo.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("REPLAY DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
