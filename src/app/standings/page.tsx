"use client";

import { useEffect, useMemo, useState } from "react";

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
  const COLS = "grid-cols-[0.55fr_2.8fr_0.8fr_0.8fr_0.8fr_1fr_0.9fr]";

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
            <span>TEAM</span>
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
              return (
                <div
                  key={t._id}
                  className="
    mx-2 my-1 rounded-xl
    border border-[#0f2747]
    bg-gradient-to-r from-[#020617] to-[#051a3a]
    hover:from-[#04122b] hover:to-[#07224d]
    transition
  "
                >
                  <div
                    className={`grid ${COLS} px-3 py-3 items-center text-sm`}
                  >
                    {/* RANK */}
                    <span className="font-extrabold text-red-500">{i + 1}</span>

                    {/* TEAM (нэр урт бол 2 мөр хүртэл) */}
                    <div className="flex items-center gap-2 min-w-0">
                      {t.logo && (
                        <img
                          src={t.logo}
                          className="w-7 h-7 object-contain shrink-0"
                        />
                      )}

                      <span className="font-extrabold text-white leading-tight line-clamp-2">
                        {t.teamName}
                      </span>
                    </div>

                    <span className="text-center">{t.played}</span>
                    <span className="text-center">{t.won}</span>
                    <span className="text-center">{t.lost}</span>

                    <span className="text-center font-bold text-cyan-400">
                      {t.setText || "-"}
                    </span>

                    <span className="text-center font-extrabold">
                      {t.points}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
