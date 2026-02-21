"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

/* ================= TYPES ================= */

type SetScore = { teamA: number; teamB: number };

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
  sets?: Array<string | SetScore>;

  teamA: { name: string; logo: string };
  teamB: { name: string; logo: string };
}

/* ================= HELPERS (дээшээ, total() доор нэм) ================= */

function topScorers(players: Player[], take = 2) {
  return [...(players ?? [])]
    .sort((a, b) => total(b) - total(a))
    .slice(0, take);
}

type ScoreVariant = "win" | "lose" | "tie";

function ScorePill({ value, variant }: { value: number; variant: ScoreVariant }) {
  const cls =
    variant === "win"
      ? "text-red-500"
      : variant === "tie"
        ? "text-white"
        : "text-gray-400";

  return (
    <div className="w-[50px] h-[40px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
      <span className={`text-[18px] font-extrabold tabular-nums ${cls}`}>
        {value}
      </span>
    </div>
  );
}

function compareVariant(self: number, other: number): ScoreVariant {
  if (self > other) return "win";
  if (self < other) return "lose";
  return "tie";
}

/* ================= HELPERS (GamePage дотор дээр нь) ================= */

const MN_DAYS = [
  "Ням",
  "Даваа",
  "Мягмар",
  "Лхагва",
  "Пүрэв",
  "Баасан",
  "Бямба",
];

const MN_MONTHS = [
  "1-р сар",
  "2-р сар",
  "3-р сар",
  "4-р сар",
  "5-р сар",
  "6-р сар",
  "7-р сар",
  "8-р сар",
  "9-р сар",
  "10-р сар",
  "11-р сар",
  "12-р сар",
];

function toDateSafe(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatMNDateLine(dateStr?: string) {
  const d = toDateSafe(dateStr);
  if (!d) return { full: "—", day: "—" };

  const dayName = MN_DAYS[d.getDay()];
  const dd = pad2(d.getDate());
  const mm = MN_MONTHS[d.getMonth()];
  const yyyy = d.getFullYear();

  return {
    day: dayName,
    full: ` ${mm} ${dd} ${yyyy}`,
  };
}

function normalizeSets(sets?: Array<string | SetScore>): string[] {
  if (!Array.isArray(sets)) return [];

  return sets
    .map((x) => {
      if (typeof x === "object" && x !== null) {
        return `${x.teamA}-${x.teamB}`;
      }
      return x.replace(":", "-").replace("–", "-").trim();
    })
    .filter((s) => {
      const cleaned = s.replace(/\s+/g, "");
      return /^\d+-\d+$/.test(cleaned);
    });
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
      {/* ================= SCHEDULE CARD (солих хэсэг) ================= */}
      <div className="mt-3 px-3">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0b0f1a]">
          {/* subtle background */}
          <div className="relative p-4">
            <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
            <div className="relative">
              {/* TOP TITLE */}
              <div className="text-center">
                <div className="text-[12px] font-extrabold tracking-wide text-gray-100">
                  {gameInfo.week || "—"}
                  {gameInfo.gender
                    ? ` • ${gameInfo.gender === "men" ? "ЭРЭГТЭЙ" : "ЭМЭГТЭЙ"}`
                    : ""}
                </div>

                {gameInfo.description ? (
                  <div className="mt-1 text-[11px] text-gray-400">
                    {gameInfo.description}
                  </div>
                ) : null}
              </div>

              {/* MAIN ROW */}
              <div className="mt-4">
                {(() => {
                  const sets = normalizeSets(gameInfo.sets);
                  const codeA = gameInfo.teamA.name.slice(0, 3).toUpperCase();
                  const codeB = gameInfo.teamB.name.slice(0, 3).toUpperCase();

                  return gameInfo.finished ? (
                    <>
                      {/* FINISHED LAYOUT */}
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                        {/* LEFT */}
                        <div className="flex flex-col items-center gap-2">
                          <Image
                            src={gameInfo.teamA.logo}
                            alt={gameInfo.teamA.name}
                            width={56}
                            height={40}
                            className="rounded-md border border-white/10 bg-black object-cover"
                          />
                          <div className="text-[13px] font-extrabold text-white truncate max-w-[110px] text-center">
                            {gameInfo.teamA.name}
                          </div>
                        </div>

                        {/* SCORE */}
                        <div className="px-4 py-2 rounded-xl bg-black/70 border border-white/10 flex items-center gap-3">
                          <span className="text-2xl font-extrabold text-white tabular-nums">
                            {gameInfo.score?.a ?? 0}
                          </span>
                          <span className="text-gray-300 font-extrabold text-xl">
                            :
                          </span>
                          <span className="text-2xl font-extrabold text-white tabular-nums">
                            {gameInfo.score?.b ?? 0}
                          </span>
                        </div>

                        {/* RIGHT */}
                        <div className="flex flex-col items-center gap-2">
                          <Image
                            src={gameInfo.teamB.logo}
                            alt={gameInfo.teamB.name}
                            width={56}
                            height={40}
                            className="rounded-md border border-white/10 bg-black object-cover"
                          />
                          <div className="text-[13px] font-extrabold text-white truncate max-w-[110px] text-center">
                            {gameInfo.teamB.name}
                          </div>
                        </div>
                      </div>

                      {/* SETS */}
                      {sets.length > 0 && (
                        <div className="mt-3 flex justify-center gap-6 text-[12px] font-semibold text-gray-300 tabular-nums">
                          {sets.map((s, i) => (
                            <span key={i}>{s}</span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* UPCOMING LAYOUT (LOGO буцааж орлоо) */}
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                        {/* LEFT TEAM */}
                        <div className="flex flex-col items-center gap-2">
                          <Image
                            src={gameInfo.teamA.logo}
                            alt={gameInfo.teamA.name}
                            width={56}
                            height={40}
                            className="rounded-md border border-white/10 bg-black object-cover"
                          />
                          <div className="text-[13px] font-extrabold text-white truncate max-w-[110px] text-center">
                            {gameInfo.teamA.name}
                          </div>
                        </div>

                        {/* CENTER TIME */}
                        <div className="text-center">
                          {(() => {
                            const d = formatMNDateLine(gameInfo.date);
                            return (
                              <>
                                <div className="text-[11px] font-extrabold text-white">
                                  {d.day}
                                </div>
                                <div className="text-[11px] font-extrabold text-white">
                                  {d.full}
                                </div>

                                <div className="mt-1 text-[16px] text-gray-400 tracking-widest">
                                  VS
                                </div>

                                <div className="mt-2 text-[28px] font-extrabold text-white tabular-nums">
                                  <div className="text-xs text-gray-400">
                                    Эхлэх цаг
                                  </div>
                                  {gameInfo.time}
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* RIGHT TEAM */}
                        <div className="flex flex-col items-center gap-2">
                          <Image
                            src={gameInfo.teamB.logo}
                            alt={gameInfo.teamB.name}
                            width={56}
                            height={40}
                            className="rounded-md border border-white/10 bg-black object-cover"
                          />
                          <div className="text-[13px] font-extrabold text-white truncate max-w-[110px] text-center">
                            {gameInfo.teamB.name}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
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

              <span className="text-gray-400 text-[18px] font-bold">-</span>

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
            {/* ================= BEST SCORERS (GENERAL-ийн хамгийн доор) ================= */}
            {(() => {
              const aTop = topScorers(stats.teamA.players, 2);
              const bTop = topScorers(stats.teamB.players, 2);

              const rows = Array.from(
                { length: Math.max(aTop.length, bTop.length) },
                (_, i) => ({ a: aTop[i], b: bTop[i] }),
              );

              return (
                <div className="mt-4 pt-4 border-t border-white/10 mb-15">
                  <div className="text-center text-[14px] font-extrabold tracking-wide">
                    Онооны шилдэгүүд
                  </div>

                  <div className="mt-3 space-y-3">
                    {rows.map((r, idx) => {
                      const aScore = r.a ? total(r.a) : 0;
                      const bScore = r.b ? total(r.b) : 0;

                      const aVar = compareVariant(aScore, bScore);
                      const bVar = compareVariant(bScore, aScore);

                      return (
                        <div
                          key={idx}
                          className="grid grid-cols-[1fr_auto_auto_1fr] items-center gap-3"
                        >
                          {/* LEFT player */}
                          <div className="text-center font-bold flex-col gap-1">
                            {r.a ? (
                              <>
                                {r.a.name}{" "}
                                {/* <span className="text-gray-400 font-extrabold">
                                  ({r.a.number})
                                </span> */}
                              </>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </div>

                          {/* LEFT score box */}
                          <ScorePill value={aScore} variant={aVar} />

                          {/* RIGHT score box */}
                          <ScorePill value={bScore} variant={bVar} />

                          {/* RIGHT player */}
                          <div className="text-center font-bold flex-col gap-1">
                            {r.b ? (
                              <>
                                {r.b.name}{" "}
                                {/* <span className="text-gray-400 font-extrabold">
                                  ({r.b.number})
                                </span> */}
                              </>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* PLAYERS */}
        {activeTab === "players" && (
          <div className="bg-[#121726] rounded-xl overflow-hidden border border-white/10">
            {/* HEADER */}
            <div className="grid grid-cols-[0.8fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr] px-1 py-2 text-[10px] font-bold text-gray-400 border-b border-white/10 tracking-wide">
              <span className="text-center">#</span>
              <span>ТОГЛОГЧ</span>
              <span className="text-center">ОНОО</span>
              <span className="text-center">ДОВ</span>
              <span className="text-center">ХААЛТ</span>
              <span className="text-center">ДАВ</span>
              <span className="text-center">ХАМ</span>
              <span className="text-center">ХОЛ</span>
            </div>

            {[...team.players]
              .sort((a, b) => total(b) - total(a))
              .map((p, i) => (
                <div
                  key={i}
                  className="
  grid grid-cols-[0.8fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr]
  px-1 py-2 text-xs
  bg-gradient-to-r from-[#020617] to-[#051a3a] mb-1
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
