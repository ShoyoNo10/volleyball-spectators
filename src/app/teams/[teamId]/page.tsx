"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
          const res = await fetch(
            `/api/team-success?teamId=${teamId}`,
            { cache: "no-store" }
          );

          const data: unknown = await res.json();

          if (data && typeof data === "object") {
            setSuccess(data as TeamSuccess);
          } else {
            setSuccess(null);
          }
        }

        if (tab === "schedule") {
          const res = await fetch(
            `/api/team-schedule?teamId=${teamId}`,
            { cache: "no-store" }
          );

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
          Team
        </h1>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          {(["players", "success", "schedule"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`
                flex-1 py-2 rounded-xl text-xs font-bold tracking-widest transition
                ${
                  tab === t
                    ? "bg-red-600 text-white shadow"
                    : "bg-gray-900 text-gray-400 hover:text-white"
                }
              `}
            >
              {t.toUpperCase()}
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
              <div className="text-gray-500 text-center">
                No players found
              </div>
            )}

            {players.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-800 shadow-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-900 to-black">
                      <th className="p-3 text-left text-xs text-gray-400">
                        No.
                      </th>
                      <th className="p-3 text-left text-xs text-gray-400">
                        Player
                      </th>
                      <th className="p-3 text-left text-xs text-gray-400">
                        Position
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
                        <td className="p-3 font-bold text-red-500">
                          {p.number}
                        </td>
                        <td className="p-3 font-semibold text-white">
                          {p.name}
                        </td>
                        <td className="p-3 text-gray-400">
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
        {tab === "success" && (
          <div className="space-y-4">
            {loadingTab && (
              <div className="text-gray-500 text-center">
                Loading success...
              </div>
            )}

            {!loadingTab &&
              (!success ||
                !Array.isArray(success.competitions) ||
                success.competitions.length === 0) && (
                <div className="text-gray-400 text-center">
                  No success data
                </div>
              )}

            {success?.competitions.map((c) => (
              <div
                key={c._id}
                className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden"
              >
                {/* HEADER */}
                <div className="bg-gray-900 text-center py-2 font-bold text-cyan-300">
                  {c.competitionName}
                </div>

                {/* BODY */}
                <div className="p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Appearances
                    </span>
                    <span className="text-white">
                      {c.appearances} (First in{" "}
                      {c.firstYear || "—"})
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Best result
                    </span>
                    <span className="text-white">
                      {Array.isArray(c.bestResults) &&
                      c.bestResults.length > 0
                        ? c.bestResults
                            .map(
                              (r) =>
                                `${r.title} (${r.year})`
                            )
                            .join(", ")
                        : "—"}
                    </span>
                  </div>
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
              <div className="text-gray-400 text-center">
                No matches
              </div>
            )}

            {schedule.map((m) => (
              <div
                key={m._id}
                className="
                  bg-gradient-to-r from-gray-950 to-black
                  border border-gray-800
                  rounded-2xl
                  overflow-hidden
                  shadow-lg
                "
              >
                {/* HEADER */}
                <div className="flex justify-between items-center px-3 py-2 bg-gray-900">
                  <span className="text-xs text-cyan-400 font-bold tracking-widest">
                    {m.week}
                  </span>

                  <span
                    className={`text-xs font-bold tracking-widest ${
                      m.gender === "men"
                        ? "text-blue-400"
                        : "text-pink-400"
                    }`}
                  >
                    {m.gender.toUpperCase()}
                  </span>
                </div>

                {/* BODY */}
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    {/* TEAM A */}
                    <div className="flex items-center gap-2 min-w-0">
                      {m.logoA && (
                        <img
                          src={m.logoA}
                          className="w-10 h-10 object-contain"
                          alt=""
                        />
                      )}
                      <span className="font-bold text-white truncate">
                        {m.teamA}
                      </span>
                    </div>

                    <div className="text-gray-400 font-bold text-sm">
                      VS
                    </div>

                    {/* TEAM B */}
                    <div className="flex items-center gap-2 justify-end min-w-0">
                      <span className="font-bold text-white truncate">
                        {m.teamB}
                      </span>
                      {m.logoB && (
                        <img
                          src={m.logoB}
                          className="w-10 h-10 object-contain"
                          alt=""
                        />
                      )}
                    </div>
                  </div>

                  {/* UPCOMING */}
                  {!m.finished && (
                    <div className="text-center mt-3 text-sm text-gray-400">
                      🗓 {m.matchDate} — ⏰ {m.matchTime}
                    </div>
                  )}

                  {/* FINAL */}
                  {m.finished && (
                    <>
                      <div className="text-center mt-3">
                        <span className="text-3xl font-extrabold text-white">
                          {m.finalA}
                        </span>
                        <span className="mx-3 text-gray-400 text-xl">
                          :
                        </span>
                        <span className="text-3xl font-extrabold text-white">
                          {m.finalB}
                        </span>
                      </div>

                      {/* SETS */}
                      {Array.isArray(m.sets) &&
                        m.sets.length > 0 && (
                          <div className="flex justify-center gap-2 mt-3">
                            {m.sets.map((s, i) => (
                              <div
                                key={i}
                                className="
                                  bg-gray-900
                                  border border-gray-700
                                  rounded-lg
                                  px-2 py-1
                                  text-xs
                                  text-white
                                  font-bold
                                "
                              >
                                {s.teamA}–{s.teamB}
                              </div>
                            ))}
                          </div>
                        )}
                    </>
                  )}
                </div>

                {/* FOOTER */}
                  {/* <div className="text-center py-1 bg-gray-950 text-[10px] tracking-widest text-gray-500">
                    {m.finished ? "FINAL" : "UPCOMING"}
                  </div> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
