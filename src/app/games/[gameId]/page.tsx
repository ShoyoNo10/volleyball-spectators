"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

/* ================= TYPES ================= */

interface Player {
  name: string;
  number: number;
  attack: number;
  block: number;
  serve: number;
  defense: number; // ✅ NEW
  set: number; // ✅ NEW
}

interface TeamBlock {
  teamName: string;
  stats: {
    attack: number;
    block: number;
    serve: number;
    error?: number;
  };
  players: Player[];
}

interface GameStats {
  teamA: TeamBlock;
  teamB: TeamBlock;
}

interface Game {
  _id: string;
  date: string;
  time: string;

  week?: string;
  description?: string;
  gender?: "men" | "women";

  finished?: boolean;
  score?: { a: number; b: number };
  sets?: string[];

  teamA: { name: string; logo: string };
  teamB: { name: string; logo: string };
}

/* ================= HELPERS ================= */

function total(p: Player) {
  return p.attack + p.block + p.serve + (p.defense ?? 0) + (p.set ?? 0);
}

// function total(p: Player) {
//   return p.attack + p.block + p.serve + (p.error ?? 0);
// }
/* ================= PAGE ================= */

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [stats, setStats] = useState<GameStats | null>(null);

  const [gameInfo, setGameInfo] = useState<Game | null>(null);

  const [activeTeam, setActiveTeam] = useState<"A" | "B">("A");

  const [activeTab, setActiveTab] = useState<"general" | "players">("players");

  // 🔹 Fetch STATS (existing API)
  useEffect(() => {
    fetch(`/api/game-stats?gameId=${gameId}`)
      .then((r) => r.json())
      .then((d: GameStats) => setStats(d));
  }, [gameId]);

  // 🔹 Fetch ALL GAMES, find this game (frontend-only trick)
  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((games: Game[]) => {
        const found = games.find((g) => g._id === gameId);
        setGameInfo(found || null);
      });
  }, [gameId]);

  if (!stats || !gameInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-black">
        Loading...
      </div>
    );
  }

  const team = activeTeam === "A" ? stats.teamA : stats.teamB;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-linear-to-b from-[#0b0f1a] to-black text-white">
      {/* SCHEDULE CARD */}
      <div className="mt-3 px-3">
        <div
          className="
    rounded-2xl p-3
    bg-linear-to-b from-[#0b1220] to-black
    border border-white/10
  "
        >
          {/* week + gender */}
          <div className="flex justify-between text-xs">
            <span className="text-cyan-300 font-bold">{gameInfo.week}</span>
            <span className="text-gray-400">
              {gameInfo.gender?.toUpperCase()}
            </span>
          </div>

          {/* description */}
          <div className="text-[11px] text-gray-400">
            {gameInfo.description}
          </div>

          {/* teams */}
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center">
            <div className="flex items-center gap-2">
              <Image src={gameInfo.teamA.logo} alt="" width={40} height={40} />
              <span className="font-bold text-white">
                {gameInfo.teamA.name}
              </span>
            </div>

            <div className="text-center">
              {!gameInfo.finished ? (
                <div className="text-white font-bold">VS</div>
              ) : (
                <div className="text-2xl font-bold text-white">
                  {gameInfo.score?.a}:{gameInfo.score?.b}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end">
              <span className="font-bold text-white">
                {gameInfo.teamB.name}
              </span>
              <Image src={gameInfo.teamB.logo} alt="" width={40} height={40} />
            </div>
          </div>

          {/* time */}
          {!gameInfo.finished && (
            <div className="text-center text-xs text-gray-400 mt-2">
              {gameInfo.date} — {gameInfo.time}
            </div>
          )}

          {/* sets */}
          {gameInfo.finished && (
            <div className="flex gap-2 justify-center mt-2">
              {gameInfo.sets?.map((s, i) => (
                <div key={i} className="px-2 py-1 bg-black border text-xs">
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HEADER */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3 bg-[#0b0f1a]/95 backdrop-blur border-b border-white/10">
        {/* <div className="flex items-center justify-between">
          <h1 className="text-sm font-bold tracking-wide">
            {gameInfo.teamA.name}
            <span className="mx-2 text-gray-400">
              vs
            </span>
            {gameInfo.teamB.name}
          </h1>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-xs font-semibold border border-white/20 rounded-md px-2 py-1 hover:bg-white/10 transition"
          >
            <ArrowBigLeft size={14} />
            Буцах
          </button>
        </div> */}

        {/* TOP TABS */}
        <div className="mt-3 flex bg-[#121726] rounded-xl p-1">
          {["general", "players"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as "general" | "players")}
              className={`
                  flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition
                  ${
                    activeTab === t
                      ? "bg-black text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }
                `}
            >
              {t === "general" ? "ЕРӨНХИЙ" : "ТОГЛОГЧИД"}
            </button>
          ))}
        </div>

        {/* TEAM SWITCH */}
        {/* TEAM SWITCH (Зөвхөн TOGLOGCHID дээр) */}
        {activeTab === "players" && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setActiveTeam("A")}
              className={`
        flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition
        ${
          activeTeam === "A"
            ? "bg-[#1c2338] text-white"
            : "bg-[#121726] text-gray-400 hover:text-white"
        }
      `}
            >
              {gameInfo.teamA.name}
            </button>

            <button
              onClick={() => setActiveTeam("B")}
              className={`
        flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition
        ${
          activeTeam === "B"
            ? "bg-[#1c2338] text-white"
            : "bg-[#121726] text-gray-400 hover:text-white"
        }
      `}
            >
              {gameInfo.teamB.name}
            </button>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-3 py-3 space-y-3">
        {/* GENERAL */}
        {activeTab === "general" && (
          <div className="bg-[#121726] rounded-xl p-4 border border-white/10">
            {/* MATCH HEADER */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Image
                  src={gameInfo.teamA.logo}
                  alt={gameInfo.teamA.name}
                  width={32}
                  height={32}
                  className="rounded-full bg-black border border-white/10"
                />
                <span className="font-bold text-sm tracking-wide">
                  {gameInfo.teamA.name}
                </span>
              </div>

              <span className="text-gray-400 text-xs font-bold">VS</span>

              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide">
                  {gameInfo.teamB.name}
                </span>
                <Image
                  src={gameInfo.teamB.logo}
                  alt={gameInfo.teamB.name}
                  width={32}
                  height={32}
                  className="rounded-full bg-black border border-white/10"
                />
              </div>
            </div>

            {/* STATS TABLE */}
            <div className="space-y-2">
              {[
                {
                  key: "attack",
                  label: "ДОВТОЛГОО",
                  a: stats.teamA.stats.attack,
                  b: stats.teamB.stats.attack,
                },
                {
                  key: "block",
                  label: "ХААЛТ",
                  a: stats.teamA.stats.block,
                  b: stats.teamB.stats.block,
                },
                {
                  key: "serve",
                  label: "ДАВУУЛАЛТ",
                  a: stats.teamA.stats.serve,
                  b: stats.teamB.stats.serve,
                },
                {
                  key: "error",
                  label: "АЛДАА",
                  a: stats.teamA.stats.error ?? 0,
                  b: stats.teamB.stats.error ?? 0,
                },
              ].map((row) => {
                const aWin = row.a > row.b;
                const bWin = row.b > row.a;

                return (
                  <div
                    key={row.key}
                    className="grid grid-cols-[1fr_2fr_1fr] items-center bg-black rounded-lg border border-white/10 px-3 py-2"
                  >
                    <div
                      className={`text-center font-bold ${
                        aWin ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      {row.a}
                    </div>

                    <div className="text-center text-[10px] font-bold tracking-widest text-gray-400">
                      {row.label}
                    </div>

                    <div
                      className={`text-center font-bold ${
                        bWin ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      {row.b}
                    </div>
                  </div>
                );
              })}

              {/* TOTAL */}
              {(() => {
                const aTotal =
                  stats.teamA.stats.attack +
                  stats.teamA.stats.block +
                  stats.teamA.stats.serve;
                const bTotal =
                  stats.teamB.stats.attack +
                  stats.teamB.stats.block +
                  stats.teamB.stats.serve;

                const aWin = aTotal > bTotal;
                const bWin = bTotal > aTotal;

                return (
                  <div className="grid grid-cols-[1fr_2fr_1fr] items-center bg-black rounded-lg border border-yellow-400/40 px-3 py-2">
                    <div
                      className={`text-center font-bold ${
                        aWin ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      {aTotal}
                    </div>

                    <div className="text-center text-[10px] font-bold tracking-widest text-yellow-400">
                      НИЙТ ОНОО
                    </div>

                    <div
                      className={`text-center font-bold ${
                        bWin ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      {bTotal}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* PLAYERS */}
        {activeTab === "players" && (
          <div className="bg-[#121726] rounded-xl overflow-hidden border border-white/10">
            {/* HEADER */}
            <div className="grid grid-cols-[0.8fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr] px-1 py-2 text-[10px] font-bold text-gray-400 border-b border-white/10 tracking-wide">
              <span className="text-center">#</span>
              <span>ТОГЛОГЧ</span>
              <span className="text-center">НИЙТ</span>
              <span className="text-center">ДОВ</span>
              <span className="text-center">ХААЛТ</span>
              <span className="text-center">ДАВ</span>
              <span className="text-center">ХАМ</span>
              <span className="text-center">SET</span>
            </div>

            {[...team.players]
              .sort((a, b) => total(b) - total(a))
              .map((p, i) => (
                <div
                  key={i}
                  className="
  grid grid-cols-[0.8fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr]
  px-1 py-2 text-xs
  border-b border-white/5
  hover:bg-white/5 transition
"
                >
                  <div className="text-center text-gray-400">{p.number}</div>
                  <div className="font-semibold truncate">{p.name}</div>

                  <div className="text-center font-bold">{total(p)}</div>

                  <div className="text-center">{p.attack}</div>
                  <div className="text-center">{p.block}</div>
                  <div className="text-center">{p.serve}</div>

                  <div className="text-center">{p.defense ?? 0}</div>
                  <div className="text-center">{p.set ?? 0}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
