"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
};

const items: Item[] = [
  { href: "/news", label: "Мэдээ" },
  { href: "/teams", label: "Багууд" },
  { href: "/schedule", label: "Хуваарь" },
  { href: "/statistics", label: "Статистик" },
  { href: "/standings", label: "Хүснэгт" },
];

export default function Navbar2() {
  const pathname = usePathname();

  return (
    <div className="w-full flex justify-center py-3">
      <nav
        className="
          bg-black
          border border-gray-700
          rounded-full
          shadow-lg
          px-2
          py-2
          w-full
          max-w-3xl
        "
      >
        {/* MOBILE GRID 5 COLUMNS, DESKTOP FLEX */}
        <div
          className="
            grid
            grid-cols-5
            gap-1
            md:flex
            md:gap-3
            md:justify-center
          "
        >
          {items.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
    text-center
    px-1.5
    py-1.5
    rounded-full
    text-[11px]
    md:text-base
    font-medium
    transition
    truncate
    ${
      active
        ? `
            text-white
            bg-linear-to-r from-[#1e2a4a] via-[#2b3f74] to-[#3b4f9a]
            border border-white/20
            shadow-[0_0_18px_rgba(80,120,255,0.25)]
          `
        : `
            text-gray-300
            bg-transparent
            border-transparent
            hover:text-white
          `
    }
  `}
                title={item.label}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
