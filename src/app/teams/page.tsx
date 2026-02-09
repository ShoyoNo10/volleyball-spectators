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
    border
    ${
      gender === "men"
        ? `
          text-white
          bg-gradient-to-r from-[#1e2a4a] via-[#2b3f74] to-[#3b4f9a]
          border-white/20
          shadow-[0_0_18px_rgba(80,120,255,0.25)]
        `
        : `
          bg-gray-900 text-gray-300
          border-white/10
          hover:bg-gray-800 hover:border-white/20
        `
    }
  `}
        >
          Эрэгтэй
        </button>

        <button
          onClick={() => setGender("women")}
          className={`
    px-6 py-2 rounded-full text-sm font-semibold transition
    border
    ${
      gender === "women"
        ? `
          text-white
          bg-gradient-to-r from-[#1e2a4a] via-[#2b3f74] to-[#3b4f9a]
          border-white/20
          shadow-[0_0_18px_rgba(80,120,255,0.25)]
        `
        : `
          bg-gray-900 text-gray-300
          border-white/10
          hover:bg-gray-800 hover:border-white/20
        `
    }
  `}
        >
          Эмэгтэй
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
            <div className="h-16 sm:h-20 md:h-24 w-full flex items-center justify-center bg-black relative overflow-hidden">
              {/* bigger logo box */}
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20">
                <Image
                  src={t.flagUrl}
                  alt={t.name}
                  width={100}
                  height={100}
                  sizes="80px"
                  className="object-contain w-full h-full transition group-hover:scale-110"
                />
              </div>
            </div>

            {/* TEAM NAME */}
            <div className=" text-center bg-black/80">
              <div className="text-[12px] font-bold tracking-wide text-white">
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
