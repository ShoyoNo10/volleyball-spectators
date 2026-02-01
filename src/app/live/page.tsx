"use client";

import { useEffect, useState } from "react";

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

  // 🔥 NEW (style-д нөлөөлөхгүй)
  competition?: string;
}

export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [todayLabel, setTodayLabel] = useState<string>(""); // client-only date

  useEffect(() => {
    // 🔹 Load matches
    const load = async () => {
      const res = await fetch("/api/matches");
      const data: Match[] = await res.json();
      setMatches(data);
    };
    load();

    // 🔹 Set date on client only (hydration safe)
    const label = new Date().toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    setTodayLabel(label);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-black flex items-start justify-center p-4 pt-6">
      {/* GLOW CONTAINER */}
      <div className="relative w-full max-w-md mt-2">
        {/* OUTER GLOW */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 blur opacity-60 animate-pulseGlow" />

        {/* INNER BOX */}
        <div className="relative bg-[#020617] rounded-3xl border border-white/10 p-4 text-white">
          {/* HEADER */}
          <div className="text-center font-bold text-sm tracking-wide mb-4 text-cyan-300">
            {todayLabel || " "} өдрийн тоглолтууд
          </div>

          {/* MATCHES */}
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
                return toMin(a.time) - toMin(b.time); // ⏰ эрт → орой
              })
              .map((m) => (
                <MatchRow key={m._id} match={m} />
              ))}
          </div>
        </div>
      </div>

      {/* ANIMATIONS (ХЭВЭЭР) */}
      <style jsx global>{`
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
      `}</style>
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
        !isFinished &&
        match.liveUrl &&
        window.open(match.liveUrl, "_blank")
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
      {/* STATUS BADGE (ХЭВЭЭР) */}
      {isLive && (
        <div className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-blinkLive">
          🔴 LIVE
        </div>
      )}

      {isUpcoming && (
        <div className="absolute -top-2 -left-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
          ⏳ ТУН УДАХГҮЙ
        </div>
      )}

      {isFinished && (
        <div className="absolute -top-2 -left-2 bg-gray-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
          ✔ ДУУССАН
        </div>
      )}

      {/* 🔥 COMPETITION — NEW (style safe, VS дээр) */}
      {match.competition && (
        <div className="text-center text-[10px] font-bold tracking-widest text-cyan-300 mb-1">
          {match.competition}
        </div>
      )}

      {/* TOP ROW */}
      <div className="flex justify-between text-xs mb-2">
        <span className="text-gray-400">
          {match.gender}
        </span>
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
        {/* TEAM A */}
        <div className="flex items-center gap-2 min-w-0">
          {match.logoA && (
            <img
              src={match.logoA}
              alt={match.teamA}
              className="w-8 h-8 object-contain"
            />
          )}
          <span className="font-semibold text-sm truncate">
            {match.teamA}
          </span>
        </div>

        <span className="text-xs text-gray-400 font-bold">
          VS
        </span>

        {/* TEAM B */}
        <div className="flex items-center gap-2 justify-end min-w-0">
          <span className="font-semibold text-sm truncate">
            {match.teamB}
          </span>
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
