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

interface TeamSuccess {
  _id: string;
  teamId: string;
  competitions: string[];
  appearances: number;
  firstYear: number;
  bestResults: BestResult[];
}

interface TeamSchedule {
  _id: string;
  teamId: string;
  opponent: string;
  opponentLogo: string;
  matchDate: string;
  matchTime: string;
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
  const [successList, setSuccessList] = useState<TeamSuccess[]>([]);

  const [schedule, setSchedule] = useState<TeamSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /* ================= LOAD PLAYERS ================= */

  useEffect(() => {
    if (!teamId) return;

    const loadPlayers = async (): Promise<void> => {
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
        setLoading(false);
      }
    };

    loadPlayers();
  }, [teamId]);

  /* ================= LOAD TAB DATA ================= */

  useEffect(() => {
    if (!teamId) return;

    if (tab === "success") {
      fetch(`/api/team-success?teamId=${teamId}`)
        .then((r) => r.json())
        .then((d: TeamSuccess[]) => {
          setSuccessList(Array.isArray(d) ? d : []);
        });
    }

    if (tab === "schedule") {
      fetch(`/api/team-schedule?teamId=${teamId}`)
        .then((r) => r.json())
        .then((d: TeamSchedule[]) => {
          setSchedule(Array.isArray(d) ? d : []);
        });
    }
  }, [tab, teamId]);

  if (!teamId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
        Invalid team ID
      </div>
    );
  }

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
            {loading && (
              <div className="text-gray-500 text-center">
                Loading players...
              </div>
            )}

            {!loading && players.length === 0 && (
              <div className="text-gray-500 text-center">No players found</div>
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
                        <td className="p-3 text-gray-400">{p.position}</td>
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
          <div className="space-y-3">
            {successList.length === 0 && (
              <div className="text-gray-400 text-center">No success data</div>
            )}

            {successList.map((s) => (
              <div
                key={s._id}
                className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-white space-y-1"
              >
                <div className="text-red-400 font-bold text-sm">
                  {s.competitions.join(", ")}
                </div>

                <div className="text-gray-300 text-sm">
                  Appearances: {s.appearances}
                </div>

                <div className="text-gray-300 text-sm">
                  First Year: {s.firstYear}
                </div>

                <div className="text-gray-400 text-xs mt-1">
                  {s.bestResults.map((r, i) => (
                    <div key={i}>
                      🏆 {r.title} — {r.year}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= SCHEDULE ================= */}
        {tab === "schedule" && (
          <div className="space-y-3">
            {schedule.length === 0 && (
              <div className="text-gray-400 text-center">No matches</div>
            )}

            {schedule.map((m) => (
              <div
                key={m._id}
                className="flex justify-between items-center bg-gray-950 border border-gray-800 rounded-xl p-3 text-white"
              >
                <div className="flex items-center gap-2">
                  {m.opponentLogo && (
                    <img
                      src={m.opponentLogo}
                      className="w-8 h-8 object-contain"
                      alt=""
                    />
                  )}
                  <b>{m.opponent}</b>
                </div>

                <div className="text-right text-sm">
                  <div>{m.matchDate}</div>
                  <div className="text-red-400">{m.matchTime}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
