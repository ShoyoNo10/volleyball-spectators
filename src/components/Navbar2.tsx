"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
};

const items: Item[] = [
  { href: "/news", label: "News" },
  { href: "/teams", label: "Teams" },
  { href: "/schedule", label: "Schedule" },
  { href: "/stats", label: "Stats" },
  { href: "/standings", label: "Standings" },
];

export default function Navbar2() {
  const pathname = usePathname();

  return (
    <div className="w-full flex justify-center py-3">
      <nav
        className="
          bg-black
          border border-gray-700
          rounded-xl
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
                  rounded-lg
                  text-[11px]
                  md:text-base
                  font-medium
                  transition
                  truncate
                  ${
                    active
                      ? "bg-vnl text-white shadow"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
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
