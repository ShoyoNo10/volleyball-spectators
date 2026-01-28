"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowBigLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Game {
  _id: string;
  date: string; // "2021-03-03"
  time: string;
  teamA: {
    name: string;
    logo: string;
  };
  teamB: {
    name: string;
    logo: string;
  };
}

function getMonthLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
  });
}

function getWeekLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
  });
}

export default function SchedulePage() {
  const router = useRouter();

  const [games, setGames] = useState<Game[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((data: Game[]) => {
        setGames(data);
        if (data.length > 0) {
          setSelectedDate(data[0].date);
        }
      });
  }, []);

  // 🔹 Days for selector (unique, sorted)
  const days = useMemo(() => {
    const map = new Map<string, Game>();
    games.forEach((g) => {
      if (!map.has(g.date)) {
        map.set(g.date, g);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );
  }, [games]);

  // 🔹 Games for selected day
  const filteredGames = useMemo(
    () =>
      games.filter(
        (g) => g.date === selectedDate
      ),
    [games, selectedDate]
  );

  // 🔹 Auto scroll selected day into view
  useEffect(() => {
    const el = dayRefs.current[selectedDate];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedDate]);

  const monthTitle = useMemo(() => {
    if (!selectedDate) return "";
    return getMonthLabel(selectedDate);
  }, [selectedDate]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="px-4 pt-4 pb-2 sticky top-0 bg-gray-50 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">
            {monthTitle}
          </h1>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-medium text-black border rounded-md px-2 py-1"
          >
            <ArrowBigLeft size={18} />
            Буцах
          </button>
        </div>

        {/* DATE SELECTOR */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mt-3 pb-2">
          {days.map((d) => {
            const isSelected =
              d.date === selectedDate;

            return (
              <button
                key={d.date}
                ref={(el) => {
                  dayRefs.current[d.date] = el;
                }}
                onClick={() =>
                  setSelectedDate(d.date)
                }
                className={`
                  min-w-[64px] px-3 py-2 rounded-xl text-center transition
                  ${
                    isSelected
                      ? "bg-black text-white scale-105 shadow-md"
                      : "bg-white text-gray-700 border hover:bg-gray-100"
                  }
                `}
              >
                <div className="text-sm font-bold">
                  {new Date(
                    d.date
                  ).getDate()}
                </div>
                <div className="text-xs">
                  {getWeekLabel(d.date)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MATCH LIST */}
      <div className="px-4 mt-4 space-y-3">
        {filteredGames.length === 0 && (
          <div className="text-center text-sm text-gray-400 mt-10">
            Энэ өдөр тоглолт байхгүй
          </div>
        )}

        {filteredGames.map((m) => (
          <Link
            key={m._id}
            href={`/games/${m._id}`}
            className="
              block bg-white rounded-xl p-3 shadow-sm
              hover:shadow-lg hover:scale-[1.02] transition
            "
          >
            {/* TIME */}
            <div className="text-xs font-semibold text-gray-500 mb-2">
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
                  className="rounded-full border bg-white"
                />
                <span className="text-sm font-semibold line-clamp-2">
                  {m.teamA.name}
                </span>
              </div>

              {/* VS */}
              <div className="flex items-center">
                <div className="bg-black text-white px-2 py-1 rounded-md font-bold text-sm">
                  VS
                </div>
              </div>

              {/* TEAM B */}
              <div className="flex items-center gap-2 justify-end min-w-0">
                <span className="text-sm font-semibold line-clamp-2 text-right">
                  {m.teamB.name}
                </span>
                <Image
                  src={m.teamB.logo}
                  alt={m.teamB.name}
                  width={45}
                  height={45}
                  className="rounded-full border bg-white"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
