"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "@/src/lib/device";

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

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [videos, setVideos] = useState<ReplayVideo[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");

  const [isPro, setIsPro] = useState<boolean>(false);
  const [loadingAccess, setLoadingAccess] = useState(true);

  /* ================= LOAD MATCHES ================= */
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/matches");
      const data: Match[] = await res.json();
      setMatches(data);
    };
    load();

    const label = new Date().toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    setTodayLabel(label);
  }, []);

  /* ================= CHECK ACCESS ================= */
  useEffect(() => {
    const check = async () => {
      const deviceId = getDeviceId();

      const res = await fetch("/api/auth/me", {
        headers: {
          "x-device-id": deviceId,
        },
      });

      const data = await res.json();

      if (data.forceLogout) {
        window.location.href = "/login";
        return;
      }

      setIsPro(data.isPro);
      setLoadingAccess(false);
    };

    check();
  }, []);

  /* ================= REPLAY ================= */
  useEffect(() => {
    if (tab !== "replay") return;
    fetch("/api/competitions")
      .then((r) => r.json())
      .then((data: Competition[]) => setCompetitions(data));
  }, [tab]);

  useEffect(() => {
    if (!selectedCompetition) return;
    fetch(`/api/replay?competitionId=${selectedCompetition}`)
      .then((r) => r.json())
      .then((data: ReplayVideo[]) => setVideos(data));
  }, [selectedCompetition]);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#020617] via-[#020617] to-black flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-md">
        {!isPro && !loadingAccess && (
          <div className="mb-6">
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-[11px] font-semibold text-center py-2 tracking-wide">
              Зөвхөн Pro эрхтэй хэрэглэгч үзэх боломжтой
            </div>
          </div>
        )}

        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600 blur opacity-60 animate-pulseGlow" />

          <div className="relative bg-[#020617] rounded-3xl border border-white/10 p-4 text-white">
            {/* TABS */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => {
                  setTab("live");
                  setSelectedCompetition("");
                }}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition ${
                  tab === "live"
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-[#121726] text-gray-400 hover:text-white"
                }`}
              >
                LIVE
              </button>

              <button
                onClick={() => setTab("replay")}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition ${
                  tab === "replay"
                    ? "bg-cyan-600 text-white shadow-md"
                    : "bg-[#121726] text-gray-400 hover:text-white"
                }`}
              >
                REPLAY
              </button>
            </div>

            {/* HEADER */}
            {tab === "live" && (
              <div className="text-center font-bold text-sm tracking-wide mb-3 text-cyan-300">
                {todayLabel || " "} өдрийн тоглолтууд
              </div>
            )}

            {/* LIVE LIST */}
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
                    <MatchRow key={m._id} match={m} isPro={isPro} />
                  ))}
              </div>
            )}

            {/* REPLAY */}
            {tab === "replay" && (
              <div className="space-y-4">
                {!selectedCompetition && (
                  <div className="grid grid-cols-2 gap-3">
                    {competitions.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => setSelectedCompetition(c._id)}
                        className="bg-[#121726] rounded-2xl p-3 cursor-pointer transition hover:scale-[1.05] border border-white/10"
                      >
                        <img
                          src={c.logo}
                          alt={c.name}
                          className="w-14 h-14 mx-auto object-contain mb-2"
                        />
                        <div className="text-center text-xs font-bold">
                          {c.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
                          className="bg-[#121726] rounded-2xl overflow-hidden cursor-pointer transition hover:scale-[1.05] border border-white/10"
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
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= MATCH ROW ================= */

function MatchRow({ match, isPro }: { match: Match; isPro: boolean }) {
  const [popup, setPopup] = useState(false);

  const isLive = match.status === "live";
  const isUpcoming = match.status === "upcoming";
  const isFinished = match.status === "finished";

  const handleClick = () => {
    if (!isPro) {
      setPopup(true);
      return;
    }

    if (!isFinished && match.liveUrl) {
      window.open(match.liveUrl, "_blank");
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`relative rounded-2xl p-3 transition ${
          isLive
            ? "bg-linear-to-r from-red-900/40 to-red-600/20 border border-red-500/40 cursor-pointer"
            : isUpcoming
              ? "bg-linear-to-r from-yellow-900/30 to-yellow-600/10 border border-yellow-400/30 cursor-pointer"
              : "bg-linear-to-r from-gray-800/40 to-gray-700/20 border border-gray-500/30 opacity-60 cursor-not-allowed"
        } ${!isFinished ? "hover:scale-[1.02]" : ""}`}
      >
        {/* TOP ROW: STATUS LEFT + COMPETITION CENTER */}
        <div className="relative mb-2">
          {/* status left */}
          <div className="absolute left-0 top-0 text-[10px] font-bold tracking-widest">
            {isLive && (
              <span className="text-red-400 live-blink border rounded-full p-1">
                ● LIVE
              </span>
            )}
            {isUpcoming && <span className="text-yellow-400 border rounded-full p-1">UPCOMING</span>}
            {isFinished && <span className="text-gray-400 border rounded-full p-1">FINISHED</span>}
          </div>

          {/* competition center */}
          {match.competition && (
            <div className="text-center text-[10px] font-bold tracking-widest text-cyan-300">
              {match.competition}
            </div>
          )}
        </div>

        {/* TIME */}
        <div className="flex justify-between text-xs mb-2">
          <span>{match.gender}</span>
          <span className="font-bold">{match.time}</span>
        </div>

        {/* TEAMS */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-0">
            {match.logoA && (
              <img src={match.logoA} className="w-8 h-8 object-contain" />
            )}
            <span className="font-semibold text-sm truncate">
              {match.teamA}
            </span>
          </div>

          <span className="text-xs text-gray-400 font-bold">VS</span>

          <div className="flex items-center gap-2 justify-end min-w-0">
            <span className="font-semibold text-sm truncate">
              {match.teamB}
            </span>
            {match.logoB && (
              <img src={match.logoB} className="w-8 h-8 object-contain" />
            )}
          </div>
        </div>
      </div>

      {/* 🔒 POPUP */}
      {popup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="relative w-[300px]">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 blur opacity-60" />

            <div className="relative bg-[#020617] border border-white/10 rounded-3xl p-6 text-center">
              <div className="text-lg font-bold mb-2">Pro эрх шаардлагатай</div>

              <div className="text-xs text-gray-400 mb-4">
                Тоглолт үзэхийн тулд эрх сунгана уу
              </div>

              <button
                onClick={() => (window.location.href = "/packages")}
                className="w-full py-2 rounded-xl bg-cyan-600 font-bold hover:bg-cyan-500 mb-2"
              >
                Эрх сунгах
              </button>

              <button
                onClick={() => setPopup(false)}
                className="text-xs text-gray-400"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
