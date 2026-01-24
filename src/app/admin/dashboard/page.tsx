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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/news"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          📰 Manage News
        </Link>

        <Link
          href="/admin/live"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          ▶ Manage Live Link
        </Link>

        <Link
          href="/admin/schedule"
          className="bg-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          📅 Manage Schedule
        </Link>
      </div>
    </div>
  );
}
