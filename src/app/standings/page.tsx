"use client";

import { useEffect, useMemo, useState } from "react";
import { Info } from 'lucide-react';

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
  const COLS = "grid-cols-[0.55fr_2.7fr_0.8fr_0.8fr_0.8fr_1.5fr_0.9fr]";
  const [showInfo, setShowInfo] = useState(false);
  const [data, setData] = useState<Standing[]>([]);
  const [tab, setTab] = useState<Gender>("men");

  useEffect(() => {
    fetch("/api/standings")
      .then((r) => r.json())
      .then((d) => setData(d));
  }, []);

  const filtered = useMemo(() => {
    return data
      .filter((t) => t.gender === tab)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.won !== a.won) return b.won - a.won;
        return a.played - b.played;
      });
  }, [data, tab]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* TOP */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-gray-400 tracking-widest">
                STANDINGS
              </div>
              <div className="text-lg font-extrabold">Хүснэгт</div>
            </div>
            {/* Segmented toggle */}
            <div className="flex bg-black border border-white/10 rounded-full p-1 w-[220px]">
              {(["men", "women"] as const).map((g) => {
                const active = tab === g;
                return (
                  <button
                    key={g}
                    onClick={() => setTab(g)}
                    className={`
                      flex-1 py-2 rounded-full text-xs font-extrabold transition-all
                      ${active ? "bg-white text-black" : "bg-transparent text-gray-400"}
                    `}
                  >
                    {g === "men" ? "ЭРЭГТЭЙ" : "ЭМЭГТЭЙ"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-3">
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center justify-center gap-1 text-xs text-purple-400 font-bold"
          >
            <Info size={14} /> Тайлбар
          </button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="px-4 pb-16 pt-4">
        <div className="max-w-md mx-auto bg-[#020617] overflow-hidden ">
          {/* HEADER */}
          <div
            className={`
    grid ${COLS}
    px-3 py-2 text-[11px] font-extrabold text-gray-400
    border-b border-white/10 bg-[#030817]
  `}
          >
            <span>#</span>
            <span>Улс</span>
            <span className="text-center">P</span>
            <span className="text-center">W</span>
            <span className="text-center">L</span>
            <span className="text-center">SET</span>
            <span className="text-center">PTS</span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Мэдээлэл алга</div>
          ) : (
            filtered.map((t, i) => {
              const isLast = i === filtered.length - 1;

              return (
                <div
                  key={t._id}
                  className={`
        mx-2 my-1 rounded-xl
        border ${isLast ? "border-red-500/50" : "border-[#0f2747]"}
        ${isLast ? "bg-gradient-to-r from-red-950/40 to-[#051a3a]" : "bg-gradient-to-r from-[#020617] to-[#051a3a]"}
        ${isLast ? "hover:from-red-900/40 hover:to-[#07224d]" : "hover:from-[#04122b] hover:to-[#07224d]"}
        transition
      `}
                >
                  <div
                    className={`grid ${COLS} px-3 py-3 items-center text-sm`}
                  >
                    {/* RANK */}
                    <span
                      className={`font-extrabold ${isLast ? "text-red-400" : "text-red-500"}`}
                    >
                      {i + 1}
                    </span>

                    {/* TEAM */}
                    <div className="flex items-center gap-2 min-w-0">
                      {t.logo && (
                        <img
                          src={t.logo}
                          className="w-7 h-7 object-contain shrink-0"
                        />
                      )}

                      <span
                        className={`font-extrabold leading-tight line-clamp-2 ${isLast ? "text-red-100" : "text-white"}`}
                      >
                        {t.teamName}
                      </span>
                    </div>
                    <span className="text-center">{t.played}</span>
                    <span className="text-center">{t.won}</span>
                    <span className="text-center">{t.lost}</span>
                    {/* SET (white) */}
                    <span className="text-center font-bold text-white">
                      {t.setText || "-"}
                    </span>

                    {/* PTS (cyan) */}
                    <span className="text-center font-extrabold text-cyan-400">
                      {t.points}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-end justify-center pb-[60px]">
          <div className="w-full max-w-md bg-[#020617] rounded-t-2xl p-5 border border-white/10">
            <div className="text-lg font-extrabold mb-3">Тайлбар</div>

            <div className="text-sm text-gray-300 space-y-1">
              <div>P - Тоглолт </div>
              <div>W - Хожил </div>
              <div>L - Хожигдол </div>
              <div>Set - Сетийн харьцаа </div>
              <div>PTS - Оноо</div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-4 text-sm text-purple-400 font-bold"
            >
              Хаах
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
