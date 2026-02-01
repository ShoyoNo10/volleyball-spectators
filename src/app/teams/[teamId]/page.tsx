"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Player {
  _id: string;
  number: number;
  name: string;
  position: string;
}

export default function TeamPage() {
  const params = useParams();
  const teamIdRaw = params?.teamId;

  const teamId =
    typeof teamIdRaw === "string"
      ? teamIdRaw
      : Array.isArray(teamIdRaw)
        ? teamIdRaw[0]
        : null;

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;

    const load = async () => {
      try {
        const res = await fetch(
          `/api/players?teamId=${encodeURIComponent(teamId)}`,
          { cache: "no-store" },
        );

        if (!res.ok) {
          console.error("API ERROR:", res.status);
          setPlayers([]);
          return;
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setPlayers(data);
        } else {
          setPlayers([]);
        }
      } catch (err) {
        console.error("FETCH ERROR:", err);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [teamId]);

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
        <h1 className="text-2xl font-bold mb-6 text-white tracking-wide">
          Team Players
        </h1>

        {loading && (
          <div className="text-gray-500 text-center">Loading players...</div>
        )}

        {!loading && players.length === 0 && (
          <div className="text-gray-500 text-center">
            No players found for this team
          </div>
        )}

        {players.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-800 shadow-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-900 to-black">
                  <th className="p-3 text-left text-xs uppercase tracking-wider text-gray-400">
                    No.
                  </th>
                  <th className="p-3 text-left text-xs uppercase tracking-wider text-gray-400">
                    Player
                  </th>
                  <th className="p-3 text-left text-xs uppercase tracking-wider text-gray-400">
                    Position
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <tr
                    key={p._id}
                    onClick={() => (window.location.href = `/players/${p._id}`)}
                    className={`
                      cursor-pointer
                      transition
                      ${i % 2 === 0 ? "bg-gray-950" : "bg-black"}
                      hover:bg-gray-800
                    `}
                  >
                    <td className="p-3 font-bold text-red-500">{p.number}</td>
                    <td className="p-3 font-semibold text-white">{p.name}</td>
                    <td className="p-3 text-gray-400">{p.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
