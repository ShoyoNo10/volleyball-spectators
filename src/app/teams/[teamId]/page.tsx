"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

/* ================= TYPES ================= */

interface Player {
  _id: string;
  number: number;
  name: string;
  position: string;
}

interface BestResult {
  title: string;
  year: number;
}

interface CompetitionBlock {
  _id: string;
  competitionName: string;
  appearances: number;
  firstYear: number;
  bestResults: BestResult[];
}

interface TeamSuccess {
  _id: string;
  teamId: string;
  competitions: CompetitionBlock[];
}

interface SetScore {
  teamA: number;
  teamB: number;
}

interface TeamSchedule {
  _id: string;
  teamId: string;
  teamA: string;
  teamB: string;
  logoA: string;
  logoB: string;
  gender: "men" | "women";
  week: string;
  matchDate: string;
  matchTime: string;
  finished: boolean;
  finalA: number;
  finalB: number;
  sets: SetScore[];
}

/* ================= PAGE ================= */

export default function TeamPage() {
  const params = useParams();
  const sp = useSearchParams();
  const teamNameFromQuery = sp.get("name");
  const teamIdRaw = params?.teamId;
  const teamId =
    typeof teamIdRaw === "string"
      ? teamIdRaw
      : Array.isArray(teamIdRaw)
        ? teamIdRaw[0]
        : null;

  const [tab, setTab] = useState<"players" | "success" | "schedule">("players");

  const [players, setPlayers] = useState<Player[]>([]);
  const [success, setSuccess] = useState<TeamSuccess | null>(null);
  const [schedule, setSchedule] = useState<TeamSchedule[]>([]);

  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(false);
  const [loadingTab, setLoadingTab] = useState<boolean>(false);

  const tabs = [
    { key: "players", label: "Тоглогчид" },
    { key: "success", label: "Амжилт" },
    { key: "schedule", label: "Хуваарь" },
  ] as const;

  /* ================= LOAD PLAYERS ================= */

  useEffect(() => {
    if (!teamId) return;

    const loadPlayers = async (): Promise<void> => {
      setLoadingPlayers(true);
      try {
        const res = await fetch(`/api/players?teamId=${teamId}`, {
          cache: "no-store",
        });

        const data: unknown = await res.json();

        if (Array.isArray(data)) {
          setPlayers(data as Player[]);
        } else {
          setPlayers([]);
        }
      } catch {
        setPlayers([]);
      } finally {
        setLoadingPlayers(false);
      }
    };

    loadPlayers();
  }, [teamId]);

  /* ================= LOAD SUCCESS / SCHEDULE ================= */

  useEffect(() => {
    if (!teamId) return;

    const loadTabData = async (): Promise<void> => {
      setLoadingTab(true);

      try {
        if (tab === "success") {
          const res = await fetch(`/api/team-success?teamId=${teamId}`, {
            cache: "no-store",
          });

          const data: unknown = await res.json();

          if (data && typeof data === "object") {
            setSuccess(data as TeamSuccess);
          } else {
            setSuccess(null);
          }
        }

        if (tab === "schedule") {
          const res = await fetch(`/api/team-schedule?teamId=${teamId}`, {
            cache: "no-store",
          });

          const data: unknown = await res.json();

          if (Array.isArray(data)) {
            setSchedule(data as TeamSchedule[]);
          } else {
            setSchedule([]);
          }
        }
      } catch {
        if (tab === "success") setSuccess(null);
        if (tab === "schedule") setSchedule([]);
      } finally {
        setLoadingTab(false);
      }
    };

    loadTabData();
  }, [tab, teamId]);

  /* ================= GUARD ================= */

  if (!teamId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
        Invalid team ID
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-black px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <h1 className="text-2xl font-bold mb-4 text-white tracking-wide">
          {teamNameFromQuery || "Team"}
        </h1>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
        flex-1 py-2 rounded-xl text-xs font-bold tracking-widest transition
        ${
          tab === t.key
            ? "bg-red-600 text-white shadow"
            : "bg-gray-900 text-gray-400 hover:text-white"
        }
      `}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ================= PLAYERS ================= */}
        {tab === "players" && (
          <>
            {loadingPlayers && (
              <div className="text-gray-500 text-center">
                Loading players...
              </div>
            )}

            {!loadingPlayers && players.length === 0 && (
              <div className="text-gray-500 text-center">No players found</div>
            )}

            {players.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-800 shadow-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-linear-to-r from-gray-900 to-black">
                      {/* ✅ header жижиг */}
                      <th className="p-2 text-left text-[10px] text-gray-400">
                        No.
                      </th>
                      <th className="p-2 text-left text-[10px] text-gray-400">
                        Тоглогч
                      </th>
                      <th className="p-2 text-left text-[10px] text-gray-400">
                        Байрлал
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {players.map((p, i) => (
                      <tr
                        key={p._id}
                        onClick={() =>
                          (window.location.href = `/players/${p._id}`)
                        }
                        className={`
                          cursor-pointer transition
                          ${i % 2 === 0 ? "bg-gray-950" : "bg-black"}
                          hover:bg-gray-800
                        `}
                      >
                        {/* ✅ padding + font жижиг */}
                        <td className="p-2 font-bold text-red-500 text-xs w-12">
                          {p.number}
                        </td>

                        <td className="p-2 font-semibold text-white text-[13px]">
                          {p.name}
                        </td>

                        <td className="p-2 text-gray-400 text-[12px]">
                          {p.position}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ================= SUCCESS ================= */}
        {/* ================= SUCCESS ================= */}
        {tab === "success" && (
          <div className="space-y-4 mb-15">
            {loadingTab && (
              <div className="text-gray-500 text-center">
                Loading success...
              </div>
            )}

            {!loadingTab &&
              (!success ||
                !Array.isArray(success.competitions) ||
                success.competitions.length === 0) && (
                <div className="text-gray-400 text-center">No success data</div>
              )}

            {success?.competitions.map((c) => (
              <div
                key={c._id}
                className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden"
              >
                {/* Competition title */}
                <div className="bg-gray-900 text-center py-2 font-bold text-white">
                  {c.competitionName}
                </div>

                {/* Best results list (no labels) */}
                <div className="p-3">
                  {Array.isArray(c.bestResults) && c.bestResults.length > 0 ? (
                    <div className="divide-y divide-white/10">
                      {c.bestResults
                        // optional: year-ээр эрэмбэлж болно (шинээс нь)
                        .slice()
                        .sort((a, b) => b.year - a.year)
                        .map((r, idx) => (
                          <div
                            key={`${r.title}-${r.year}-${idx}`}
                            className="py-2 flex items-center justify-between"
                          >
                            <div className="text-[13px] font-semibold text-white">
                              {r.year}
                            </div>

                            <div className="text-[13px] text-gray-300 text-right">
                              {r.title}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm text-center py-2">
                      —
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= SCHEDULE ================= */}
        {tab === "schedule" && (
          <div className="space-y-4">
            {loadingTab && (
              <div className="text-gray-500 text-center">
                Loading schedule...
              </div>
            )}

            {!loadingTab && schedule.length === 0 && (
              <div className="text-gray-400 text-center">No matches</div>
            )}

            {schedule.map((m) => (
              <div
                key={m._id}
                className="
          block
          bg-linear-to-b from-[#0b1220] to-black
          text-white
          border border-white/10
          rounded-2xl
          shadow-[0_10px_40px_rgba(0,0,0,0.6)]
          hover:border-white/15
          hover:-translate-y-0.5
          transition
          active:scale-[0.995]
        "
              >
                <div className="p-4">
                  {/* TOP LINE */}
                  <div className="flex items-center justify-between gap-3">
                    {/* WEEK badge (gender style) */}
                    <span
                      className="
              px-2 py-0.5
              text-[11px]
              font-extrabold
              rounded
              bg-white/10
              text-gray-100
              border border-white/10
            "
                    >
                      {m.week}
                    </span>

                    {/* DATE */}
                    <span className="text-[12px] font-semibold text-gray-400">
                      {m.matchDate}
                    </span>
                  </div>

                  {/* MAIN GRID */}
                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-4 items-start">
                    {/* LEFT */}
                    <div className="relative space-y-3 min-w-0 pr-14">
                      {!m.finished && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[25px] font-extrabold text-gray-200">
                          {m.matchTime}
                        </div>
                      )}

                      {/* TEAM A */}
                      <div className="flex items-center gap-3 min-w-0">
                        {m.logoA && (
                          <img
                            src={m.logoA}
                            className="w-9 h-6 rounded border border-white/10 object-cover bg-black"
                          />
                        )}
                        <div className="text-sm font-semibold text-gray-100 truncate">
                          {m.teamA}
                        </div>
                      </div>

                      {/* TEAM B */}
                      <div className="flex items-center gap-3 min-w-0">
                        {m.logoB && (
                          <img
                            src={m.logoB}
                            className="w-9 h-6 rounded border border-white/10 object-cover bg-black"
                          />
                        )}
                        <div className="text-sm font-semibold text-gray-100 truncate">
                          {m.teamB}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    {m.finished ? (
                      <div className="shrink-0 flex items-center gap-3">
                        {/* SETS */}
                        {m.sets?.length > 0 && (
                          <div className="flex flex-col justify-between h-[56px]">
                            <div className="flex justify-end gap-2 text-[12px] font-normal">
                              {m.sets.map((s, i) => {
                                const a = s.teamA;
                                const b = s.teamB;
                                return (
                                  <span
                                    key={i}
                                    className={
                                      a > b ? "text-white" : "text-gray-500"
                                    }
                                  >
                                    {a}
                                  </span>
                                );
                              })}
                            </div>

                            <div className="flex justify-end gap-2 text-[12px] font-semibold">
                              {m.sets.map((s, i) => {
                                const a = s.teamA;
                                const b = s.teamB;
                                return (
                                  <span
                                    key={i}
                                    className={
                                      b > a ? "text-white" : "text-gray-500"
                                    }
                                  >
                                    {b}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* BIG SCORE */}
                        <div className="text-right flex flex-col justify-center h-[56px]">
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-3xl font-extrabold text-gray-100">
                              {m.finalA}
                            </div>
                            <div className="text-3xl font-extrabold text-gray-500">
                              {m.finalB}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
