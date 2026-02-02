"use client";

import { useEffect, useState } from "react";

type Gender = "men" | "women";

interface Team {
  _id: string;
  gender: Gender;
  teamName: string;
  teamCode: string;
  logo: string;
  score: number;
}

export default function RankingPage() {
  const [data, setData] = useState<Team[]>([]);
  const [tab, setTab] = useState<Gender>("men");

  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((d) => setData(d));
  }, []);

  const filtered = data
    .filter((t) => t.gender === tab)
    .sort((a, b) => b.score - a.score); // 🔥 Rank by SCORE

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
        <div className="grid grid-cols-[0.5fr_2fr_1fr] px-3 py-2 text-xs font-bold text-gray-400 border-b border-white/10">
          <span>#</span>
          <span>TEAM</span>
          <span className="text-center">
            SCORE
          </span>
        </div>

        {filtered.map((t, i) => (
          <div
            key={t._id}
            className="grid grid-cols-[0.5fr_2fr_1fr] px-3 py-2 text-sm border-b border-white/5 hover:bg-white/5 transition"
          >
            <span className="font-bold text-yellow-400">
              {i + 1}
            </span>

            <div className="flex items-center gap-2 min-w-0">
              {t.logo && (
                <img
                  src={t.logo}
                  alt={t.teamName}
                  className="w-6 h-6 object-contain"
                />
              )}
              <span className="truncate font-semibold">
                {t.teamCode}
              </span>
            </div>

            <span className="text-center font-bold">
              {t.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
