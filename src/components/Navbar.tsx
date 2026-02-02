"use client";
import Link from "next/link";
import { useState } from "react";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-vnl text-white px-4 py-3">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-lg md:text-xl">VOLLEY LIVE</h1>
        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6">
          <Link href="/contact">Холбогдох</Link>
          <Link href="/ranking">Дэлхийн чансаа</Link>
        </div>
        {/* Mobile button */}
        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col mt-3 space-y-2 md:hidden">
          <Link href="/contact" onClick={() => setOpen(false)}>
            Холбогдох
          </Link>
          <Link href="/ranking" onClick={() => setOpen(false)}>
            Дэлхийн чансаа
          </Link>
        </div>
      )}
    </nav>
  );
}
