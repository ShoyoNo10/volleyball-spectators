"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (!auth) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl text-black font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
        <Link
          href="/admin/news"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage News
        </Link>
        <Link
          href="/admin/teams"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage Teams
        </Link>
        <Link
          href="/admin/players"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage teams Players
        </Link>

        <Link
          href="/admin/matches"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage Live Link
        </Link>

        <Link
          href="/admin/schedule"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage Schedule
        </Link>
        <Link
          href="/admin/game-stats"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage schedule stats
        </Link>
        <Link
          href="/admin/standings"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage standings
        </Link>
        <Link
          href="/admin/statistics"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage statistics
        </Link>
        <Link
          href="/admin/ranking"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage ranking
        </Link>
      </div>
    </div>
  );
}
