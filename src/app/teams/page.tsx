"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
                ? "bg-red-500 text-white shadow-lg shadow-red-300"
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
                ? "bg-red-500 text-white shadow-lg shadow-red-300"
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
              bg-gradient-to-b from-gray-900 to-black
              rounded-2xl
              overflow-hidden
              shadow-lg
              hover:shadow-red-500/30
              hover:-translate-y-1
              transition
            "
          >
            {/* FLAG / LOGO AREA */}
            <div className="h-28 sm:h-32 md:h-36 w-full flex items-center justify-center bg-black">
              <img
                src={t.flagUrl}
                alt={t.name}
                className="
                  max-h-full
                  max-w-full
                  object-contain
                  transition
                  group-hover:scale-110
                "
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
