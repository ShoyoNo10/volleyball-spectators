"use client";

import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";

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
  const COLS_MOBILE = "grid-cols-[0.55fr_2.7fr_0.8fr_0.8fr_0.8fr_1.5fr_0.9fr]";
  const COLS_DESKTOP = "grid-cols-[0.5fr_3.2fr_0.8fr_0.8fr_0.8fr_1.4fr_0.9fr]";

  const [showInfo, setShowInfo] = useState(false);
  const [data, setData] = useState<Standing[]>([]);
  const [tab, setTab] = useState<Gender>("men");

  useEffect(() => {
    fetch("/api/standings")
      .then((r) => r.json())
      .then((d) => setData(d));
  }, []);

  // const filtered = useMemo(() => {
  //   return data
  //     .filter((t) => t.gender === tab)
  //     .sort((a, b) => {
  //       if (b.points !== a.points) return b.points - a.points;
  //       if (b.won !== a.won) return b.won - a.won;
  //       return a.played - b.played;
  //     });
  // }, [data, tab]);

  const filtered = useMemo(() => {
  const arr = data.filter((t) => t.gender === tab);

  // ✅ Бүх багийн points = 0 бол mongo дарааллаар нь харуулна
  const allZero = arr.length > 0 && arr.every((x) => (x.points ?? 0) === 0);
  if (allZero) return arr;

  // ✅ Оноо орсон үед л ranking sort
  return [...arr].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.won !== a.won) return b.won - a.won;
    return a.played - b.played;
  });
}, [data, tab]);

  const leader = filtered[0];
  const avgPts =
    filtered.length > 0
      ? Math.round(
          (filtered.reduce((s, x) => s + (x.points || 0), 0) / filtered.length) * 10,
        ) / 10
      : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* TOP */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-md lg:max-w-6xl mx-auto px-4 py-4 space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-gray-400 tracking-widest">STANDINGS</div>
              <div className="text-lg font-extrabold">Хүснэгт</div>
            </div>

            {/* Segmented toggle */}
            <div className="flex bg-black border border-white/10 rounded-full p-1 w-[220px] shrink-0">
              {(["men", "women"] as const).map((g) => {
                const active = tab === g;
                return (
                  <button
                    key={g}
                    onClick={() => setTab(g)}
                    className={`
                      flex-1 py-2 rounded-full text-xs font-extrabold transition-all
                      ${active ? "bg-white text-black" : "bg-transparent text-gray-400 hover:text-white"}
                    `}
                  >
                    {g === "men" ? "ЭРЭГТЭЙ" : "ЭМЭГТЭЙ"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* mobile: info btn under header (your original) */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setShowInfo(true)}
              className="flex items-center justify-center gap-1 text-xs text-purple-400 font-bold"
            >
              <Info size={14} /> Тайлбар
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT WRAP */}
      <div className="px-4 pb-16 pt-4">
        <div className="max-w-md lg:max-w-6xl mx-auto">
          {/* Desktop layout: 2 columns */}
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
            {/* LEFT: TABLE */}
            <div className="bg-[#020617] overflow-hidden lg:rounded-2xl lg:border lg:border-white/10 lg:shadow-[0_0_40px_rgba(0,0,0,0.45)]">
              {/* Desktop header bar */}
              {/* HEADER ROW */}
              <div
                className={`
                  grid ${COLS_MOBILE} lg:${COLS_DESKTOP}
                  px-3 lg:px-5 py-2 text-[11px] font-extrabold text-gray-400
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
                <div className="lg:divide-y lg:divide-white/10">
                  {filtered.map((t, i) => {
                    const isLast = i === filtered.length - 1;
                    const isTop = i === 0;

                    return (
                      <div
                        key={t._id}
                        className={`
                          my-1 lg:my-0 rounded-xl lg:rounded-none
                          border lg:border-0
                          ${isLast ? "border-red-500/50" : "border-[#0f2747]"}
                          ${isLast
                            ? "bg-gradient-to-r from-red-950/40 to-[#051a3a]"
                            : "bg-gradient-to-r from-[#020617] to-[#051a3a]"}
                          ${isLast
                            ? "hover:from-red-900/40 hover:to-[#07224d]"
                            : "hover:from-[#04122b] hover:to-[#07224d]"}
                          transition
                          lg:hover:bg-white/[0.03]
                        `}
                      >
                        <div
                          className={`
                            grid ${COLS_MOBILE} lg:${COLS_DESKTOP}
                            px-3 lg:px-5 py-3 items-center text-sm
                          `}
                        >
                          {/* RANK */}
                          <span
                            className={`
                              font-extrabold
                              ${isLast ? "text-red-400" : "text-red-500"}
                              ${isTop ? "lg:text-emerald-300" : ""}
                            `}
                          >
                            {i + 1}
                          </span>

                          {/* TEAM */}
                          <div className="flex items-center gap-2 min-w-0">
                            {t.logo && (
                              <img
                                src={t.logo}
                                alt={t.teamName}
                                className={`
                                  w-7 h-7 lg:w-8 lg:h-8 object-contain shrink-0
                                  rounded-md bg-black/30 border border-white/10
                                `}
                              />
                            )}

                            <div className="min-w-0">
                              <div
                                className={`
                                  font-extrabold leading-tight line-clamp-2
                                  ${isLast ? "text-red-100" : "text-white"}
                                `}
                              >
                                {t.teamName}
                              </div>
                              {/* desktop subline */}
                              <div className="hidden lg:block text-xs text-gray-400 truncate">
                                {t.teamCode ? t.teamCode : " "}
                              </div>
                            </div>

                            {/* desktop badge */}
                          </div>

                          <span className="text-center tabular-nums">{t.played}</span>
                          <span className="text-center tabular-nums">{t.won}</span>
                          <span className="text-center tabular-nums">{t.lost}</span>

                          {/* SET */}
                          <span className="text-center font-bold text-white tabular-nums">
                            {t.setText || "-"}
                          </span>

                          {/* PTS */}
                          <span className="text-center font-extrabold text-cyan-400 tabular-nums">
                            {t.points}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: DESKTOP SIDE PANEL */}
            <aside className="hidden lg:block">
              <div className="bg-[#020617] rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.45)] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 bg-[#030817]">
                  <div className="text-sm font-extrabold">Тайлбар</div>
                  <div className="text-xs text-gray-400">Баганын утгууд</div>
                </div>

                <div className="p-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-3 text-gray-200">
                    <span className="text-gray-400">P</span>
                    <span>Тоглолт</span>
                  </div>
                  <div className="flex justify-between gap-3 text-gray-200">
                    <span className="text-gray-400">W</span>
                    <span>Хожил</span>
                  </div>
                  <div className="flex justify-between gap-3 text-gray-200">
                    <span className="text-gray-400">L</span>
                    <span>Хожигдол</span>
                  </div>
                  <div className="flex justify-between gap-3 text-gray-200">
                    <span className="text-gray-400">SET</span>
                    <span>Сетийн харьцаа</span>
                  </div>
                  <div className="flex justify-between gap-3 text-gray-200">
                    <span className="text-gray-400">PTS</span>
                    <span>Оноо</span>
                  </div>

                  <div className="h-px bg-white/10 my-2" />




                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* MOBILE INFO MODAL (unchanged) */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-end justify-center pb-[60px]">
          <div className="w-full max-w-md bg-[#020617] rounded-t-2xl p-5 border border-white/10">
            <div className="text-lg font-extrabold mb-3">Тайлбар</div>

            <div className="text-sm text-gray-300 space-y-1">
              <div>P - Тоглолт</div>
              <div>W - Хожил</div>
              <div>L - Хожигдол</div>
              <div>Set - Сетийн харьцаа</div>
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