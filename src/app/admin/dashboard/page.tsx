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
          className="bg-red-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage News
        </Link>
        <Link
          href="/admin/teams"
          className="bg-blue-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage Teams
        </Link>
        <Link
          href="/admin/players"
          className="bg-blue-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage teams Players
        </Link>
        <Link
          href="/admin/team-success"
          className="bg-blue-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage teams success
        </Link>
        <Link
          href="/admin/team-schedule"
          className="bg-blue-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage teams schedule
        </Link>
        <Link
          href="/admin/matches"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage Live Link
        </Link>

        <Link
          href="/admin/schedule"
          className="bg-yellow-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage Schedule
        </Link>
        <Link
          href="/admin/game-stats"
          className="bg-yellow-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage schedule stats
        </Link>
        <Link
          href="/admin/standings"
          className="bg-purple-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage standings
        </Link>
        <Link
          href="/admin/statistics"
          className="bg-green-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage statistics
        </Link>
        <Link
          href="/admin/stats-block"
          className="bg-green-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage block stats
        </Link>
                <Link
          href="/admin/stats-serve"
          className="bg-green-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage serve stats
        </Link>
                <Link
          href="/admin/stats-set"
          className="bg-green-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage set stats
        </Link>
                <Link
          href="/admin/stats-defense"
          className="bg-green-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage defense stats
        </Link>
                <Link
          href="/admin/stats-receive"
          className="bg-green-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage receive stats
        </Link>
        <Link
          href="/admin/ranking"
          className="bg-gray-300 p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Manage ranking
        </Link>
      </div>
    </div>
  );
}
