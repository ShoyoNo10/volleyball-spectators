"use client";

import { useEffect, useState } from "react";

type Gender = "men" | "women";

interface Standing {
  _id: string;
  gender: Gender;
  teamName: string;
  teamCode: string;
  logo: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  setText: string;
}

export default function StandingsPage() {
  const [data, setData] = useState<Standing[]>([]);
  const [tab, setTab] = useState<Gender>("men");

  useEffect(() => {
    fetch("/api/standings")
      .then((r) => r.json())
      .then((d) => setData(d));
  }, []);

  const filtered = data
    .filter((t) => t.gender === tab)
    .sort((a, b) => {
      if (b.points !== a.points)
        return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      return a.played - b.played;
    });

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* TABS */}
      <div className="flex gap-2 mb-4 max-w-md mx-auto">
        {["men", "women"].map((g) => (
          <button
            key={g}
            onClick={() => setTab(g as Gender)}
            className={`flex-1 py-2 rounded-xl font-bold ${
              tab === g
                ? "bg-white text-black"
                : "bg-gray-800"
            }`}
          >
            {g.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="max-w-md mx-auto bg-[#020617] rounded-2xl overflow-hidden border border-white/10">
        {/* HEADER */}
        <div className="grid grid-cols-[0.5fr_2fr_0.8fr_0.8fr_0.8fr_1fr_1fr] px-3 py-2 text-xs font-bold text-gray-400 border-b border-white/10">
          <span>#</span>
          <span>TEAM</span>
          <span className="text-center">P</span>
          <span className="text-center">W</span>
          <span className="text-center">L</span>
          <span className="text-center">SET</span>
          <span className="text-center">
            PTS
          </span>
        </div>

        {filtered.map((t, i) => (
          <div
            key={t._id}
            className="grid grid-cols-[0.5fr_2fr_0.8fr_0.8fr_0.8fr_1fr_1fr] px-3 py-2 text-sm border-b border-white/5 hover:bg-white/5 transition"
          >
            <span className="font-bold text-yellow-400">
              {i + 1}
            </span>

            <div className="flex items-center gap-2 min-w-0">
              {t.logo && (
                <img
                  src={t.logo}
                  className="w-6 h-6 object-contain"
                />
              )}
              <span className="truncate font-semibold">
                {t.teamName}
              </span>
            </div>

            <span className="text-center">
              {t.played}
            </span>
            <span className="text-center">
              {t.won}
            </span>
            <span className="text-center">
              {t.lost}
            </span>

            {/* MANUAL SET */}
            <span className="text-center font-bold text-cyan-400">
              {t.setText || "-"}
            </span>

            <span className="text-center font-bold">
              {t.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
