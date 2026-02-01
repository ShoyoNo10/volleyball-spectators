"use client";

import { useEffect, useState } from "react";

type Gender = "men" | "women";

interface Stat {
  _id: string;
  gender: Gender;
  playerName: string;
  teamCode: string;
  played: number;
  points: number;
  attackPts: number;
  blockPts: number;
  servePts: number;
}

export default function StatisticsPage() {
  const [data, setData] = useState<Stat[]>([]);
  const [tab, setTab] = useState<Gender>("men");

  useEffect(() => {
    fetch("/api/statistics")
      .then((r) => r.json())
      .then((d) => setData(d));
  }, []);

  const filtered = data
    .filter((p) => p.gender === tab)
    .sort((a, b) => {
      if (b.points !== a.points)
        return b.points - a.points;
      if (b.attackPts !== a.attackPts)
        return b.attackPts - a.attackPts;
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
        <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr_1fr] px-3 py-2 text-xs font-bold text-gray-400 border-b border-white/10">
          <span>#</span>
          <span>PLAYER</span>
          <span>TEAM</span>
          <span className="text-center">PTS</span>
          <span className="text-center">A PTS</span>
          <span className="text-center">B PTS</span>
          <span className="text-center">S PTS</span>
        </div>

        {filtered.map((p, i) => (
          <div
            key={p._id}
            className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr_1fr] px-3 py-2 text-sm border-b border-white/5 hover:bg-white/5 transition"
          >
            <span className="font-bold text-yellow-400">
              {i + 1}
            </span>

            <span className="truncate font-semibold">
              {p.playerName}
            </span>

            <span className="font-bold text-cyan-400">
              {p.teamCode}
            </span>

            <span className="text-center font-bold">
              {p.points}
            </span>

            <span className="text-center">
              {p.attackPts}
            </span>

            <span className="text-center">
              {p.blockPts}
            </span>

            <span className="text-center">
              {p.servePts}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
