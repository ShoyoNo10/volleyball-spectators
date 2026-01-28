"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { ArrowBigLeft } from "lucide-react";
import Image from "next/image";

/* ================= TYPES ================= */

interface Player {
  name: string;
  number: number;
  attack: number;
  block: number;
  serve: number;
}

interface TeamBlock {
  teamName: string;
  stats: {
    attack: number;
    block: number;
    serve: number;
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
  teamA: {
    name: string;
    logo: string; // Cloudinary URL
  };
  teamB: {
    name: string;
    logo: string; // Cloudinary URL
  };
}

/* ================= HELPERS ================= */

function total(p: Player) {
  return p.attack + p.block + p.serve;
}

/* ================= PAGE ================= */

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const router = useRouter();

  const [stats, setStats] =
    useState<GameStats | null>(null);

  const [gameInfo, setGameInfo] =
    useState<Game | null>(null);

  const [activeTeam, setActiveTeam] =
    useState<"A" | "B">("A");

  const [activeTab, setActiveTab] =
    useState<"general" | "players">(
      "players"
    );

  // 🔹 Fetch STATS (existing API)
  useEffect(() => {
    fetch(
      `/api/game-stats?gameId=${gameId}`
    )
      .then((r) => r.json())
      .then((d: GameStats) =>
        setStats(d)
      );
  }, [gameId]);

  // 🔹 Fetch ALL GAMES, find this game (frontend-only trick)
  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((games: Game[]) => {
        const found = games.find(
          (g) => g._id === gameId
        );
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

  const team =
    activeTeam === "A"
      ? stats.teamA
      : stats.teamB;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-[#0b0f1a] to-black text-white">

{/* ALWAYS VISIBLE — TEAM VS TEAM */}
<div className="mt-3 bg-[#121726] rounded-xl p-3 border border-white/10">
  <div className="flex items-center justify-center gap-4">
    <div className="flex items-center gap-2">
      <Image
        src={gameInfo.teamA.logo}
        alt={gameInfo.teamA.name}
        width={28}
        height={28}
        className="rounded-full bg-black border border-white/10"
      />
      <span className="font-bold text-sm tracking-wide">
        {gameInfo.teamA.name}
      </span>
    </div>

    <span className="text-gray-400 text-xs font-bold">
      VS
    </span>

    <div className="flex items-center gap-2">
      <span className="font-bold text-sm tracking-wide">
        {gameInfo.teamB.name}
      </span>
      <Image
        src={gameInfo.teamB.logo}
        alt={gameInfo.teamB.name}
        width={28}
        height={28}
        className="rounded-full bg-black border border-white/10"
      />
    </div>
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
          {["general", "players"].map(
            (t) => (
              <button
                key={t}
                onClick={() =>
                  setActiveTab(
                    t as
                      | "general"
                      | "players"
                  )
                }
                className={`
                  flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition
                  ${
                    activeTab === t
                      ? "bg-black text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }
                `}
              >
                {t === "general"
                  ? "ЕРӨНХИЙ"
                  : "ТОГЛОГЧИД"}
              </button>
            )
          )}
        </div>

        {/* TEAM SWITCH */}
        <div className="mt-2 flex gap-2">
          <button
            onClick={() =>
              setActiveTeam("A")
            }
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
            onClick={() =>
              setActiveTeam("B")
            }
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

              <span className="text-gray-400 text-xs font-bold">
                VS
              </span>

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
                  a: stats.teamA.stats
                    .attack,
                  b: stats.teamB.stats
                    .attack,
                },
                {
                  key: "block",
                  label: "ХААЛТ",
                  a: stats.teamA.stats
                    .block,
                  b: stats.teamB.stats
                    .block,
                },
                {
                  key: "serve",
                  label: "ДАВУУЛАЛТ",
                  a: stats.teamA.stats
                    .serve,
                  b: stats.teamB.stats
                    .serve,
                },
              ].map((row) => {
                const aWin =
                  row.a > row.b;
                const bWin =
                  row.b > row.a;

                return (
                  <div
                    key={row.key}
                    className="grid grid-cols-[1fr_2fr_1fr] items-center bg-black rounded-lg border border-white/10 px-3 py-2"
                  >
                    <div
                      className={`text-center font-bold ${
                        aWin
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      {row.a}
                    </div>

                    <div className="text-center text-[10px] font-bold tracking-widest text-gray-400">
                      {row.label}
                    </div>

                    <div
                      className={`text-center font-bold ${
                        bWin
                          ? "text-yellow-400"
                          : "text-gray-300"
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
                  stats.teamA.stats
                    .attack +
                  stats.teamA.stats
                    .block +
                  stats.teamA.stats
                    .serve;
                const bTotal =
                  stats.teamB.stats
                    .attack +
                  stats.teamB.stats
                    .block +
                  stats.teamB.stats
                    .serve;

                const aWin =
                  aTotal > bTotal;
                const bWin =
                  bTotal > aTotal;

                return (
                  <div className="grid grid-cols-[1fr_2fr_1fr] items-center bg-black rounded-lg border border-yellow-400/40 px-3 py-2">
                    <div
                      className={`text-center font-bold ${
                        aWin
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      {aTotal}
                    </div>

                    <div className="text-center text-[10px] font-bold tracking-widest text-yellow-400">
                      НИЙТ ОНОО
                    </div>

                    <div
                      className={`text-center font-bold ${
                        bWin
                          ? "text-yellow-400"
                          : "text-gray-300"
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
            <div className="grid grid-cols-[0.6fr_0.8fr_2fr_1fr_1fr_1fr_1fr] px-3 py-2 text-[10px] font-bold text-gray-400 border-b border-white/10 tracking-wide">
              <span className="text-center">
                БАЙР
              </span>
              <span className="text-center">
                #
              </span>
              <span>ТОГЛОГЧ</span>
              <span className="text-center">
                НИЙТ
              </span>
              <span className="text-center">
                ДОВ
              </span>
              <span className="text-center">
                ХААЛТ
              </span>
              <span className="text-center">
                ДАВ
              </span>
            </div>

            {[...team.players]
              .sort(
                (a, b) =>
                  total(b) -
                  total(a)
              )
              .map((p, i) => (
                <div
                  key={i}
                  className="
                    grid grid-cols-[0.6fr_0.8fr_2fr_1fr_1fr_1fr_1fr]
                    px-3 py-2 text-xs
                    border-b border-white/5
                    hover:bg-white/5 transition
                  "
                >
                  <div className="text-center font-bold text-yellow-400">
                    {i + 1}
                  </div>

                  <div className="text-center text-gray-400">
                    {p.number}
                  </div>

                  <div className="font-semibold truncate">
                    {p.name}
                  </div>

                  <div className="text-center font-bold">
                    {total(p)}
                  </div>

                  <div className="text-center">
                    {p.attack}
                  </div>

                  <div className="text-center">
                    {p.block}
                  </div>

                  <div className="text-center">
                    {p.serve}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
