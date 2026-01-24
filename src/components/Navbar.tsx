"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-vnl text-white px-4 py-3">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-lg md:text-xl">VNL LIVE</h1>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6">
          <Link href="/news">News</Link>
          <Link href="/teams">Teams</Link>
          <Link href="/schedule">Schedule</Link>
          <Link href="/live">Live</Link>
        </div>

        {/* Mobile button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col mt-3 space-y-2 md:hidden">
          <Link href="/news" onClick={() => setOpen(false)}>News</Link>
          <Link href="/teams" onClick={() => setOpen(false)}>Teams</Link>
          <Link href="/schedule" onClick={() => setOpen(false)}>Schedule</Link>
          <Link href="/live" onClick={() => setOpen(false)}>Live</Link>
        </div>
      )}
    </nav>
  );
}
