"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-vnl text-white px-4 py-3">
      <div className="flex justify-between items-center">
        {/* LOGO */}
        <h1 className="font-bold text-lg md:text-xl">
          VOLLEY LIVE
        </h1>

        {/* MENU — ALWAYS HORIZONTAL */}
        <div className="flex space-x-3 md:space-x-6 text-sm md:text-base">
          <Link
            href="/news"
            className="hover:text-gray-200 transition"
          >
            News
          </Link>

          <Link
            href="/teams"
            className="hover:text-gray-200 transition"
          >
            Teams
          </Link>

          <Link
            href="/schedule"
            className="hover:text-gray-200 transition"
          >
            Schedule
          </Link>

          <Link
            href="/live"
            className="hover:text-gray-200 transition"
          >
            Live
          </Link>
        </div>
      </div>
    </nav>
  );
}
