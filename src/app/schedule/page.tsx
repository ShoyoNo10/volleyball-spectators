"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Gender = "men" | "women";

interface Game {
  _id: string;
  date: string;
  time: string;

  // ✅ NEW
  week?: string;
  description?: string;
  gender?: Gender;

  finished?: boolean;
  liveUrl?: string;
  score?: { a: number; b: number };
  sets?: string[];
  teamA: { name: string; logo: string };
  teamB: { name: string; logo: string };
}

function getMonthLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("mn-MN", { year: "numeric", month: "long" });
}
function getWeekLabelMN(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const map = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
  return map[day];
}

export default function SchedulePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((data: Game[]) => {
        setGames(data);
        if (data.length > 0) setSelectedDate(data[0].date);
      });
  }, []);

  const days = useMemo(() => {
    const map = new Map<string, Game>();
    games.forEach((g) => {
      if (!map.has(g.date)) map.set(g.date, g);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [games]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(days.length / 7));
  }, [days.length]);

  useEffect(() => {
    if (!selectedDate || days.length === 0) return;
    const idx = days.findIndex((d) => d.date === selectedDate);
    if (idx >= 0) setPage(Math.floor(idx / 5));
  }, [selectedDate, days]);

  const pageDays = useMemo(() => {
    const start = page * 5;
    return days.slice(start, start + 5);
  }, [days, page]);

  const filteredGames = useMemo(
    () => games.filter((g) => g.date === selectedDate),
    [games, selectedDate],
  );

  const monthTitle = useMemo(() => {
    if (!selectedDate) return "";
    return getMonthLabel(selectedDate);
  }, [selectedDate]);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black">
      {/* HEADER */}
      <div className="px-4 pt-4 pb-2 sticky top-0 bg-black z-10 ">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-wide">
            {monthTitle}
          </h1>
        </div>

        {/* DATE SELECTOR (7-day) */}
        <div className="flex items-center gap-1 mt-3 pb-2">
          <button
            onClick={() => canPrev && setPage((p) => Math.max(0, p - 1))}
            disabled={!canPrev}
            className={`
              border border-gray-700 rounded-md p-1.5
              ${canPrev ? "text-gray-200 hover:bg-gray-800" : "text-gray-600 opacity-50"}
              transition
            `}
            aria-label="Previous 7 days"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex flex-1 justify-between gap-1">
            {pageDays.map((d) => {
              const isSelected = d.date === selectedDate;

              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`
                    flex-1 px-1 py-1.5 rounded-lg text-center transition
                    ${
                      isSelected
                        ? `
                          text-white
                          bg-linear-to-r from-[#1e2a4a] via-[#2b3f74] to-[#3b4f9a]
                          border border-white/20
                          shadow-[0_0_18px_rgba(80,120,255,0.25)]
                        `
                        : `
                          bg-gray-900 text-gray-400
                          border border-white/10
                          hover:bg-gray-800 hover:text-white hover:border-white/20
                        `
                    }
                  `}
                >
                  <div className="text-[12px] font-bold leading-none">
                    {new Date(d.date).getDate()}
                  </div>
                  <div className="text-[10px] leading-none">
                    {getWeekLabelMN(d.date)}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              canNext && setPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={!canNext}
            className={`
              border border-gray-700 rounded-md p-1.5
              ${canNext ? "text-gray-200 hover:bg-gray-800" : "text-gray-600 opacity-50"}
              transition
            `}
            aria-label="Next 7 days"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="text-[10px] text-gray-500 text-center">
          {days.length > 0 ? `${page + 1}/${totalPages}` : ""}
        </div>
      </div>

      {/* MATCH LIST */}
      <div className="px-4 mt-4 space-y-3 pb-16">
        {filteredGames.length === 0 && (
          <div className="text-center text-sm text-gray-500 mt-10">
            Энэ өдөр тоглолт байхгүй
          </div>
        )}

        {filteredGames.map((m) => {
          const isFinished = !!m.finished;
          const scoreA = m.score?.a ?? 0;
          const scoreB = m.score?.b ?? 0;

          return (
            <Link
              key={m._id}
              href={`/games/${m._id}`}
              className="
                block rounded-2xl p-3
                bg-linear-to-b from-[#0b1220] to-black
                border border-white/10
                shadow-[0_10px_40px_rgba(0,0,0,0.6)]
                hover:border-white/20 hover:-translate-y-0.5 transition
              "
            >
              {/* TOP BAR: week + gender */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold text-cyan-300">
                  {m.week && m.week.trim().length > 0 ? m.week : "Week"}
                </div>
                <div className="text-xs font-bold text-gray-300">
                  {(m.gender ?? "men").toUpperCase()}
                </div>
              </div>

              {/* DESCRIPTION */}
              {m.description && m.description.trim().length > 0 ? (
                <div className="text-[11px] text-gray-400 mt-1">
                  {m.description}
                </div>
              ) : null}

              {/* MAIN */}
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                {/* TEAM A */}
                <div className="flex items-center gap-2 min-w-0">
                  <Image
                    src={m.teamA.logo}
                    alt={m.teamA.name}
                    width={44}
                    height={44}
                    className="rounded-xl border border-white/10 bg-black"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-white truncate">
                      {m.teamA.name}
                    </div>
                  </div>
                </div>

                {/* CENTER: VS or SCORE */}
                <div className="flex flex-col items-center justify-center">
                  {!isFinished ? (
                    <div className="text-sm font-extrabold text-gray-200">
                      VS
                    </div>
                  ) : (
                    <div className="text-3xl font-extrabold text-white tracking-wider ">
                      {scoreA} <span className="text-gray-500">-</span> {scoreB}
                    </div>
                  )}
                </div>

                {/* TEAM B */}
                <div className="flex items-center gap-2 justify-end min-w-0">
                  <div className="min-w-0 text-right">
                    <div className="text-sm font-extrabold text-white truncate">
                      {m.teamB.name}
                    </div>
                  </div>
                  <Image
                    src={m.teamB.logo}
                    alt={m.teamB.name}
                    width={44}
                    height={44}
                    className="rounded-xl border border-white/10 bg-black"
                  />
                </div>
              </div>

              {/* NOT FINISHED: date/time */}
              {!isFinished ? (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-300">
                  <span>📅 {m.date}</span>
                  <span className="text-gray-600">—</span>
                  <span>⏰ {m.time}</span>
                </div>
              ) : null}

              {/* FINISHED: sets */}
              {/* FINISHED: sets */}
              {isFinished && (m.sets?.length ?? 0) > 0 ? (
                <div className="mt-3 flex justify-center">
                  <div className="flex gap-1">
                    {m.sets!.map((s, idx) => {
                      const norm = s.replace(":", "-").replace("–", "-");
                      const [aStr, bStr] = norm
                        .split("-")
                        .map((x) => x?.trim());
                      const a = Number(aStr);
                      const b = Number(bStr);

                      const aWin =
                        Number.isFinite(a) && Number.isFinite(b)
                          ? a > b
                          : false;
                      const bWin =
                        Number.isFinite(a) && Number.isFinite(b)
                          ? b > a
                          : false;

                      return (
                        <div
                          key={idx}
                          className="
              flex items-center gap-1
              px-2.5 py-1 rounded-lg
              bg-black/40 border border-white/10
              text-xs font-bold
            "
                        >
                          <span
                            className={aWin ? "text-white" : "text-gray-400"}
                          >
                            {aStr}
                          </span>

                          <span className="text-gray-500">–</span>

                          <span
                            className={bWin ? "text-white" : "text-gray-400"}
                          >
                            {bStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
