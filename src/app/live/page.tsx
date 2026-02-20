"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "@/src/lib/device";
import { Play } from "lucide-react";

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
  const [proPopup, setProPopup] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("");

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

  const openReplay = (url: string) => {
    if (loadingAccess) return; // хүсвэл loading үед дарж болохгүй болгоно

    if (!isPro) {
      setProPopup(true);
      return;
    }

    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#020617] via-[#020617] to-black flex items-start justify-center p-4 pt-8 mb-15">
      <div className="w-full max-w-md">
        {!isPro && !loadingAccess && (
          <div className="mb-6">
            <div
              className="
      relative overflow-hidden
      rounded-2xl
      border border-violet-400/40
      bg-gradient-to-r from-[#12071f] via-[#1a0d2e] to-[#0b0617]
      text-violet-200
      text-[11px] font-bold tracking-wider
      text-center py-3
      shadow-[0_0_25px_rgba(168,85,247,0.25)]
    "
            >
              {/* subtle glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_60%)]" />

              <span className="relative">
                🔒 Зөвхөн Pro эрхтэй хэрэглэгч үзэх боломжтой
              </span>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-purple-600 via-purple-600 to-purple-600 blur opacity-60 animate-pulseGlow" />

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
                Шууд
              </button>

              <button
                onClick={() => {
                  setTab("replay");
                }}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition ${
                  tab === "replay"
                    ? "bg-cyan-600 text-white shadow-md"
                    : "bg-[#121726] text-gray-400 hover:text-white"
                }`}
              >
                <Play className="inline mr-1" size={12} /> Нөхөж үзэх
              </button>
            </div>

            {/* HEADER */}
            {tab === "live" && (
              <div className="text-center font-bold text-sm tracking-wide mb-3 text-white">
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
                {!isPro && !loadingAccess && (
                  <div className="text-center text-[11px] text-gray-400"></div>
                )}

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
      onClick={() => openReplay(v.videoUrl)}
      className="bg-[#121726] rounded-2xl overflow-hidden cursor-pointer transition hover:scale-[1.03] border border-white/10"
    >
      {/* ✅ 16:9 thumbnail area */}
      <div className="relative w-full aspect-video bg-black">
        <img
          src={v.thumbnail}
          alt={v.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

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
      {proPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
          <div className="relative w-[320px]">
            {/* outer glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600 blur opacity-70" />

            {/* card */}
            <div className="relative bg-[#05010b] border border-violet-400/30 rounded-3xl p-6 text-center overflow-hidden">
              {/* subtle glow overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_60%)]" />

              {/* title */}
              <div className="relative text-xl font-extrabold mb-2 text-white">
                Pro эрх шаардлагатай
              </div>

              {/* subtitle */}
              <div className="relative text-xs text-violet-200/80 mb-5">
                Нөхөж үзэхийн тулд эрх сунгана уу
              </div>

              {/* button */}
              <button
                onClick={() => (window.location.href = "/packages")}
                className="
            relative w-full py-2.5 rounded-xl font-bold
            bg-gradient-to-r from-violet-600 to-fuchsia-600
            hover:from-violet-500 hover:to-fuchsia-500
            transition-all duration-300
            shadow-[0_0_25px_rgba(168,85,247,0.5)]
            active:scale-95
            mb-2
          "
              >
                Pro авах
              </button>

              {/* close */}
              <button
                onClick={() => setProPopup(false)}
                className="relative text-xs text-gray-400 hover:text-white"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= MATCH ROW ================= */

function MatchRow({ match, isPro }: { match: Match; isPro: boolean }) {
  const [popup, setPopup] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("");

  const isLive = match.status === "live";
  const isUpcoming = match.status === "upcoming";
  const isFinished = match.status === "finished";

  const handleClick = () => {
    if (!isPro) {
      setPopup(true);
      return;
    }

    if (isFinished) return;

    if (match.liveUrl) {
      setPlayerUrl(match.liveUrl); // embed link-ээ шууд ашиглана
      setPlayerOpen(true);
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
            {isUpcoming && (
              <span className="text-yellow-400 border rounded-full p-1">
                UPCOMING
              </span>
            )}
            {isFinished && (
              <span className="text-gray-400 border rounded-full p-1">
                FINISHED
              </span>
            )}
          </div>

          {/* competition center */}
          {match.competition && (
            <div className="text-center text-[10px] font-bold tracking-widest text-blue-400">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
          <div className="relative w-[320px]">
            {/* glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600 blur opacity-70" />

            {/* card */}
            <div className="relative bg-[#05010b] border border-violet-400/30 rounded-3xl p-6 text-center overflow-hidden">
              {/* radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_60%)]" />

              {/* title */}
              <div className="relative text-xl font-extrabold mb-2 text-white">
                Pro эрх шаардлагатай
              </div>

              {/* desc */}
              <div className="relative text-xs text-violet-200/80 mb-5">
                Тоглолт үзэхийн тулд эрх сунгана уу
              </div>

              {/* button */}
              <button
                onClick={() => (window.location.href = "/packages")}
                className="
            relative w-full py-2.5 rounded-xl font-bold
            bg-gradient-to-r from-violet-600 to-fuchsia-600
            hover:from-violet-500 hover:to-fuchsia-500
            transition-all duration-300
            shadow-[0_0_25px_rgba(168,85,247,0.5)]
            active:scale-95
            mb-2
          "
              >
                Эрх сунгах
              </button>

              {/* close */}
              <button
                onClick={() => setPopup(false)}
                className="relative text-xs text-gray-400 hover:text-white"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
      {playerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop (CLICK хийхэд хаагдахгүй) */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

          {/* modal */}
          <div
            className="relative w-full max-w-3xl border border-purple-400 rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div />

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#050812] shadow-[0_0_40px_rgba(0,0,0,0.6)]">
              {/* top bar */}
              <div className="relative px-4 py-3 border-b border-white/10 bg-linear-to-r from-white/5 via-white/0 to-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_60%)]" />

                <div className="relative flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80 font-bold">
                      Volley live
                    </div>
                    <div className="text-sm font-extrabold text-white truncate">
                      {match.teamA} <span className="text-gray-400">vs</span>{" "}
                      {match.teamB}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPlayerOpen(false);
                      setPlayerUrl("");
                    }}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold
                bg-red-600/90 text-white
                hover:bg-red-500 active:scale-95 transition"
                  >
                    Хаах
                  </button>
                </div>
              </div>

              {/* player area */}
              <div className="p-3 sm:p-4">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_55%)]" />
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_55%)]" />

                  <iframe
                    src={playerUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Live Player"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 border ${
                        match.status === "live"
                          ? "border-red-500/40 text-red-300 bg-red-500/10"
                          : "border-yellow-500/40 text-yellow-200 bg-yellow-500/10"
                      }`}
                    >
                      <span
                        className={`text-xs ${
                          match.status === "live" ? "live-blink" : ""
                        }`}
                      >
                        ●
                      </span>
                      {match.status === "live" ? "LIVE" : "UPCOMING"}
                    </span>
                  </div>

                  <div className="font-mono text-gray-300/80">{match.time}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
