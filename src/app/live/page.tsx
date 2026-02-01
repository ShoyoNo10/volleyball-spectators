"use client";

import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type MatchStatus = "live" | "upcoming" | "finished";

interface Match {
  _id: string;
  date: string;
  teamA: string;
  teamB: string;
  logoA: string;
  logoB: string;
  gender: string;
  time: string;
  status: MatchStatus;
  liveUrl: string;
  competition?: string;
}

interface Competition {
  _id: string;
  name: string;
  logo: string;
}

interface ReplayVideo {
  _id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  competitionId: string;
}

/* ================= PAGE ================= */

export default function LivePage() {
  const [tab, setTab] = useState<"live" | "replay">("live");

  const [matches, setMatches] = useState<Match[]>([]);
  const [todayLabel, setTodayLabel] = useState<string>("");

  // Replay state
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [videos, setVideos] = useState<ReplayVideo[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");

  /* ================= EFFECTS ================= */

  useEffect(() => {
    // 🔹 Load matches
    const load = async () => {
      const res = await fetch("/api/matches");
      const data: Match[] = await res.json();
      setMatches(data);
    };
    load();

    // 🔹 Client-only date (hydration safe)
    const label = new Date().toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    setTodayLabel(label);
  }, []);

  // 🔹 Load competitions for replay
  useEffect(() => {
    if (tab !== "replay") return;

    fetch("/api/competitions")
      .then((r) => r.json())
      .then((data: Competition[]) => setCompetitions(data));
  }, [tab]);

  // 🔹 Load videos for selected competition
  useEffect(() => {
    if (!selectedCompetition) return;

    fetch(`/api/replay?competitionId=${selectedCompetition}`)
      .then((r) => r.json())
      .then((data: ReplayVideo[]) => setVideos(data));
  }, [selectedCompetition]);

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-black flex items-start justify-center p-4 pt-6">
      {/* GLOW CONTAINER */}
      <div className="relative w-full max-w-md mt-2">
        {/* OUTER GLOW */}
        {/* OUTER GLOW */}
        <div
          className="absolute -inset-1 rounded-3xl 
  bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 
  blur opacity-60 animate-pulseGlow"
        />

        {/* INNER BOX */}
        <div className="relative bg-[#020617] rounded-3xl border border-white/10 p-4 text-white">
          {/* HEADER */}
          <div className="text-center font-bold text-sm tracking-wide mb-3 text-cyan-300">
            {todayLabel || " "} өдрийн тоглолтууд
          </div>

          {/* TABS */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setTab("live");
                setSelectedCompetition("");
              }}
              className={`
                flex-1 py-2 rounded-xl text-xs font-bold tracking-widest transition
                ${
                  tab === "live"
                    ? "bg-red-600 text-white shadow"
                    : "bg-[#121726] text-gray-400 hover:text-white"
                }
              `}
            >
              🔴 LIVE
            </button>

            <button
              onClick={() => setTab("replay")}
              className={`
                flex-1 py-2 rounded-xl text-xs font-bold tracking-widest transition
                ${
                  tab === "replay"
                    ? "bg-cyan-600 text-white shadow"
                    : "bg-[#121726] text-gray-400 hover:text-white"
                }
              `}
            >
              ▶ REPLAY
            </button>
          </div>

          {/* ================= LIVE ================= */}
          {tab === "live" && (
            <div className="space-y-4">
              {matches.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-8">
                  Одоогоор тоглолт байхгүй
                </div>
              )}

              {[...matches]
                .sort((a, b) => {
                  const toMin = (t: string) => {
                    const [h, m] = t.split(":").map(Number);
                    return h * 60 + m;
                  };
                  return toMin(a.time) - toMin(b.time);
                })
                .map((m) => (
                  <MatchRow key={m._id} match={m} />
                ))}
            </div>
          )}

          {/* ================= REPLAY ================= */}
          {tab === "replay" && (
            <div className="space-y-4">
              {/* COMPETITIONS GRID */}
              {!selectedCompetition && (
                <div className="grid grid-cols-2 gap-3">
                  {competitions.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => setSelectedCompetition(c._id)}
                      className="
                        bg-[#121726] rounded-2xl p-3
                        cursor-pointer transition
                        hover:scale-[1.05] hover:shadow-lg
                        border border-white/10
                      "
                    >
                      <img
                        src={c.logo}
                        alt={c.name}
                        className="w-14 h-14 mx-auto object-contain mb-2"
                      />
                      <div className="text-center text-xs font-bold tracking-wide">
                        {c.name}
                      </div>
                    </div>
                  ))}

                  {competitions.length === 0 && (
                    <div className="col-span-2 text-center text-sm text-gray-400 py-6">
                      Одоогоор тэмцээн алга
                    </div>
                  )}
                </div>
              )}

              {/* VIDEOS GRID */}
              {selectedCompetition && (
                <>
                  <button
                    onClick={() => {
                      setSelectedCompetition("");
                      setVideos([]);
                    }}
                    className="text-xs text-cyan-400 mb-2"
                  >
                    ← Буцах
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    {videos.map((v) => (
                      <div
                        key={v._id}
                        onClick={() => window.open(v.videoUrl, "_blank")}
                        className="
                          bg-[#121726] rounded-2xl overflow-hidden
                          cursor-pointer transition
                          hover:scale-[1.05] hover:shadow-lg
                          border border-white/10
                        "
                      >
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="h-28 w-full object-cover"
                        />
                        <div className="p-2 text-xs font-semibold line-clamp-2">
                          {v.title}
                        </div>
                      </div>
                    ))}

                    {videos.length === 0 && (
                      <div className="col-span-2 text-center text-sm text-gray-400 py-6">
                        Энэ тэмцээнд видео алга
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ANIMATIONS (ХЭВЭЭР) */}
      {/* <style jsx global>{`
        @keyframes pulseGlow {
          0% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.4;
          }
        }

        .animate-pulseGlow {
          animation: pulseGlow 3s ease-in-out infinite;
        }

        @keyframes blinkLive {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-blinkLive {
          animation: blinkLive 1.2s infinite;
        }
      `}</style> */}
    </div>
  );
}

/* ================= MATCH ROW ================= */

function MatchRow({ match }: { match: Match }) {
  const isLive = match.status === "live";
  const isUpcoming = match.status === "upcoming";
  const isFinished = match.status === "finished";

  return (
    <div
      onClick={() =>
        !isFinished && match.liveUrl && window.open(match.liveUrl, "_blank")
      }
      className={`
        relative rounded-2xl p-3 transition
        ${
          isLive
            ? "bg-gradient-to-r from-red-900/40 to-red-600/20 border border-red-500/40 cursor-pointer"
            : isUpcoming
              ? "bg-gradient-to-r from-yellow-900/30 to-yellow-600/10 border border-yellow-400/30 cursor-pointer"
              : "bg-gradient-to-r from-gray-800/40 to-gray-700/20 border border-gray-500/30 opacity-60 cursor-not-allowed"
        }
        ${!isFinished ? "hover:scale-[1.02]" : ""}
      `}
    >
      {/* STATUS BADGE */}
      {isLive && (
        <div
          className="
    absolute -top-2 -left-2 
    bg-red-600 text-white text-[10px] font-bold 
    px-2 py-0.5 rounded-full 
    animate-blinkLive
  "
        >
          🔴 LIVE
        </div>
      )}

      {isUpcoming && (
        <div className="absolute -top-2 -left-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
           ТУН УДАХГҮЙ
        </div>
      )}

      {isFinished && (
        <div className="absolute -top-2 -left-2 bg-gray-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
           ДУУССАН
        </div>
      )}

      {/* COMPETITION */}
      {match.competition && (
        <div className="text-center text-[10px] font-bold tracking-widest text-cyan-300 mb-1">
          {match.competition}
        </div>
      )}

      {/* TOP ROW */}
      <div className="flex justify-between text-xs mb-2">
        <span className="text-gray-400">{match.gender}</span>
        <span
          className={`font-bold ${
            isLive
              ? "text-red-400"
              : isUpcoming
                ? "text-yellow-400"
                : "text-gray-400"
          }`}
        >
          {match.time}
        </span>
      </div>

      {/* TEAMS */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 min-w-0">
          {match.logoA && (
            <img
              src={match.logoA}
              alt={match.teamA}
              className="w-8 h-8 object-contain"
            />
          )}
          <span className="font-semibold text-sm truncate">{match.teamA}</span>
        </div>

        <span className="text-xs text-gray-400 font-bold">VS</span>

        <div className="flex items-center gap-2 justify-end min-w-0">
          <span className="font-semibold text-sm truncate">{match.teamB}</span>
          {match.logoB && (
            <img
              src={match.logoB}
              alt={match.teamB}
              className="w-8 h-8 object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
