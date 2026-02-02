"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Team {
  _id: string;
  name: string;
  code: string;
  gender: "men" | "women";
  flagUrl: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [gender, setGender] = useState<"men" | "women">("men");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then(setTeams);
  }, []);

  const filtered = teams.filter((t) => t.gender === gender);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* GENDER TOGGLE */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setGender("men")}
          className={`
            px-6 py-2 rounded-full text-sm font-semibold transition
            ${
              gender === "men"
                ? "bg-red-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }
          `}
        >
          Men&apos;s
        </button>
        <button
          onClick={() => setGender("women")}
          className={`
            px-6 py-2 rounded-full text-sm font-semibold transition
            ${
              gender === "women"
                ? "bg-red-500 text-white "
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }
          `}
        >
          Women&apos;s
        </button>
      </div>

      {/* TEAMS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {filtered.map((t) => (
          <div
            key={t._id}
            onClick={() => router.push(`/teams/${t._id}`)}
            className="
              group
              cursor-pointer
              bg-linear-to-b from-gray-900 to-black
              rounded-2xl
              overflow-hidden
              shadow-lg
              hover:shadow-red-500/30
              hover:-translate-y-1
              transition
            "
          >
            {/* FLAG / LOGO AREA */}
            <div className="h-20 sm:h-24 md:h-28 w-full flex items-center justify-center bg-black relative overflow-hidden">
              <Image
                src={t.flagUrl}
                alt={t.name}
                fill
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                className="object-contain transition group-hover:scale-110"
              />
            </div>

            {/* TEAM NAME */}
            <div className="py-2 text-center bg-black/80">
              <div className="text-sm font-bold tracking-wide text-white">
                {t.code}
              </div>
              {/* <div className="text-[11px] text-gray-400 truncate px-2">
                {t.name}
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
