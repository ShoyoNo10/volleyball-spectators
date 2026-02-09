"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowBigLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Game {
  _id: string;
  date: string;
  time: string;
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
  const day = d.getDay(); // 0=Sunday

  const map = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
  return map[day];
}

export default function SchedulePage() {
  const router = useRouter();

  const [games, setGames] = useState<Game[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // ✅ 7 хоногоор хуудаслах index (0 -> эхний 7 өдөр, 1 -> дараагийн 7 өдөр ...)
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((data: Game[]) => {
        // date/time өсөхөөр чинь байгаа
        setGames(data);
        if (data.length > 0) {
          setSelectedDate(data[0].date);
        }
      });
  }, []);

  // ✅ Unique days list
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

  // ✅ сонгосон өдөр аль page дээр байгааг олж, page-ийг автоматаар тааруулна
  useEffect(() => {
    if (!selectedDate || days.length === 0) return;
    const idx = days.findIndex((d) => d.date === selectedDate);
    if (idx >= 0) setPage(Math.floor(idx / 7));
  }, [selectedDate, days]);

  const pageDays = useMemo(() => {
    const start = page * 7;
    return days.slice(start, start + 7);
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
          {/* PREV 7 */}
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

          {/* DAYS */}
          <div className="flex flex-1 justify-between gap-1">
            {pageDays.map((d) => {
              const isSelected = d.date === selectedDate;

              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`
            flex-1
            px-1 py-1.5
            rounded-lg
            text-center
            transition
            ${
              isSelected
                ? "bg-red-700 text-white shadow-md shadow-red-500/20"
                : "bg-gray-900 text-gray-400 border border-gray-700 hover:bg-gray-800 hover:text-white"
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

          {/* NEXT 7 */}
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

        {/* жижиг: page indicator (optional) */}
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
          const scoreText = `${m.score?.a ?? 0}:${m.score?.b ?? 0}`;
          const setsText = (m.sets ?? []).join("  ");

          return (
            <Link
              key={m._id}
              href={`/games/${m._id}`}
              className="
                block
                bg-gradient-to-b from-gray-900 to-black
                border border-gray-800
                rounded-xl
                p-3
                shadow-lg
                hover:shadow-red-500/30
                hover:-translate-y-0.5
                transition
              "
            >
              {/* TIME */}
              <div className="text-xs font-semibold text-gray-400 mb-2">
                {m.time}
              </div>

              {/* MATCH ROW */}
              <div className="grid grid-cols-[2fr_auto_2fr] items-center gap-2">
                {/* TEAM A */}
                <div className="flex items-center gap-2 min-w-0">
                  <Image
                    src={m.teamA.logo}
                    alt={m.teamA.name}
                    width={45}
                    height={45}
                    className="rounded-full border border-gray-700 bg-black"
                  />
                  <span className="text-sm font-semibold line-clamp-2 text-white">
                    {m.teamA.name}
                  </span>
                </div>

                {/* CENTER: VS or SCORE */}
                <div className="flex items-center justify-center">
                  <div className="bg-black border border-gray-700 text-white px-2 py-1 rounded-md font-bold text-sm">
                    {isFinished ? scoreText : "VS"}
                  </div>
                </div>

                {/* TEAM B */}
                <div className="flex items-center gap-2 justify-end min-w-0">
                  <span className="text-sm font-semibold line-clamp-2 text-white text-right">
                    {m.teamB.name}
                  </span>
                  <Image
                    src={m.teamB.logo}
                    alt={m.teamB.name}
                    width={45}
                    height={45}
                    className="rounded-full border border-gray-700 bg-black"
                  />
                </div>
              </div>

              {/* SETS */}
              {isFinished && (m.sets?.length ?? 0) > 0 && (
                <div className="mt-2 text-xs text-center text-gray-400 font-semibold">
                  {setsText}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
