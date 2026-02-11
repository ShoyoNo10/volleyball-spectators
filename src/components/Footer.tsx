"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, TvMinimalPlay, Gem } from "lucide-react";

const items = [
  { href: "/news", label: "Нүүр", Icon: Newspaper },
  { href: "/live", label: "Шууд үзэх", Icon: TvMinimalPlay },
  { href: "/packages", label: "Pro эрх", Icon: Gem },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        bg-black
        border-t
        border-gray-700
      "
    >
      <div className="max-w-md mx-auto flex justify-around py-2">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center
                gap-0.5
                px-3 py-1
                text-xs
                transition
                ${
                  active
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
