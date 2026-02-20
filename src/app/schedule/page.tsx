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

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function getMonthLabelMN(dateStr: string) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1; // 1-12
  return `${y} оны ${m} сар`;
}

// Хэрвээ өдөр дээрээ ч гэсэн дан монголоор форматлах бол:
function getDateLabelMN(dateStr: string) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${pad2(m)}-${pad2(day)}`; // эсвэл `${y} оны ${m} сарын ${day}`
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
    return Math.max(1, Math.ceil(days.length / 4));
  }, [days.length]);

  useEffect(() => {
    if (!selectedDate || days.length === 0) return;
    const idx = days.findIndex((d) => d.date === selectedDate);
    if (idx >= 0) setPage(Math.floor(idx / 4));
  }, [selectedDate, days]);

  const pageDays = useMemo(() => {
    const start = page * 4;
    return days.slice(start, start + 4);
  }, [days, page]);

  const filteredGames = useMemo(
    () => games.filter((g) => g.date === selectedDate),
    [games, selectedDate],
  );

  const monthTitle = useMemo(() => {
    if (!selectedDate) return "";
    return getMonthLabelMN(selectedDate);
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
        bg-linear-to-r from-[#1b3a6b] via-[#2563eb] to-[#3b82f6]
        border border-blue-300/40
        shadow-[0_0_20px_rgba(59,130,246,0.35)]
      `
    : `
        bg-gray-900
        text-gray-400
        border border-white/10
        hover:bg-gray-800
        hover:text-white
        hover:border-white/20
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
          return (
            <Link
              key={m._id}
              href={`/games/${m._id}`}
              className=" block  bg-linear-to-b from-[#0b1220] to-black text-white border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:border-white/15 hover:-translate-y-0.5 transition active:scale-[0.995]"
            >
              <div className="p-4">
                {/* TOP LINE */}
                {/* TOP LINE */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 w-full">
                    {/* GENDER (left) + WEEK (right) */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-white/10 text-gray-100 border border-white/10">
                        {(() => {
                          const g = (m.gender ?? "men").toLowerCase();
                          return g === "women" ? "ЭМЭГТЭЙ" : "ЭРЭГТЭЙ";
                        })()}
                      </span>

                      <span className="text-[12px] font-semibold text-gray-100 truncate ">
                        {m.week && m.week.trim().length > 0 ? m.week : "Week"}
                      </span>
                    </div>

                    {m.description ? (
                      <div className="mt-1 text-xs font-bold text-gray-400 line-clamp-1">
                        {m.description}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* MAIN GRID */}
                <div className="mt-4 grid grid-cols-[1fr_auto] gap-4 items-start">
                  {/* LEFT: 2 TEAMS */}
                  <div className="relative space-y-3 min-w-0 pr-14 ">
                    {/* TIME on the right empty space (upcoming only) */}
                    {!m.finished ? (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[25px] font-extrabold text-gray-200 tabular-nums">
                        {m.time}
                      </div>
                    ) : null}

                    {/* Team A row */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src={m.teamA.logo}
                        alt={m.teamA.name}
                        width={34}
                        height={24}
                        className="rounded border border-white/10 object-cover bg-black"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-100 ">
                          {m.teamA.name}
                        </div>
                      </div>
                    </div>

                    {/* Team B row */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src={m.teamB.logo}
                        alt={m.teamB.name}
                        width={34}
                        height={24}
                        className="rounded border border-white/10 object-cover bg-black"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-100  ">
                          {m.teamB.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: SETS first, SCORE after (finished only) */}
                  {m.finished ? (
                    <div className="shrink-0 flex items-center gap-3">
                      {/* sets row (left) */}
                      {(m.sets?.length ?? 0) > 0 ? (
                        <div className="flex flex-col justify-between h-[56px]">
                          {/* Set A points (row) */}
                          <div className="flex justify-end gap-2 text-[12px] tabular-nums font-normal">
                            {m.sets!.map((s, i) => {
                              const norm = String(s)
                                .replace(":", "-")
                                .replace("–", "-");
                              const [aStr, bStr] = norm
                                .split("-")
                                .map((x) => x?.trim());
                              const a = Number(aStr);
                              const b = Number(bStr);

                              const aWin =
                                Number.isFinite(a) && Number.isFinite(b)
                                  ? a > b
                                  : false;

                              return (
                                <span
                                  key={i}
                                  className={
                                    aWin ? "text-gray-100" : "text-gray-500"
                                  }
                                >
                                  {aStr}
                                </span>
                              );
                            })}
                          </div>

                          {/* Set B points (row) */}
                          <div className=" flex justify-end gap-2 text-[12px] tabular-nums font-semibold">
                            {m.sets!.map((s, i) => {
                              const norm = String(s)
                                .replace(":", "-")
                                .replace("–", "-");
                              const [aStr, bStr] = norm
                                .split("-")
                                .map((x) => x?.trim());
                              const a = Number(aStr);
                              const b = Number(bStr);

                              const bWin =
                                Number.isFinite(a) && Number.isFinite(b)
                                  ? b > a
                                  : false;

                              return (
                                <span
                                  key={i}
                                  className={
                                    bWin ? "text-gray-100" : "text-gray-500"
                                  }
                                >
                                  {bStr}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 text-sm text-gray-500"> </div>
                      )}

                      {/* big score column (right) */}
                      <div className="text-right flex flex-col justify-center h-[56px]">
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-3xl font-extrabold leading-none tabular-nums text-gray-100">
                            {m.score?.a ?? 0}
                          </div>
                          <div className="text-3xl font-extrabold leading-none tabular-nums text-gray-500">
                            {m.score?.b ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // UPCOMING: no sets/score (like screenshot)
                    <div className="shrink-0 text-right">
                      {/* (optional) if you still want date under time, uncomment */}
                      {/* <div className="text-xs text-gray-400 tabular-nums">{m.date}</div> */}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
