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

  // Normalize teamId → always string or null
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
    return <div className="p-4 text-center text-red-500">Invalid team ID</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Team Players</h1>

      {loading && <div className="text-gray-400">Loading players...</div>}

      {!loading && players.length === 0 && (
        <div className="text-gray-400">No players found for this team</div>
      )}

      {players.length > 0 && (
        <table className="w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">No.</th>
              <th className="p-2 text-left">Player Name</th>
              <th className="p-2 text-left">Position</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr
                key={p._id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                onClick={() => (window.location.href = `/players/${p._id}`)}
               
              >
                <td className="p-2 text-red-500">{p.number}</td>
                <td className="p-2 font-semibold">{p.name}</td>
                <td className="p-2">{p.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
