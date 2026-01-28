"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

/* ================= TYPES ================= */

interface GameMini {
  _id: string;
  teamA: { name: string };
  teamB: { name: string };
}

interface Player {
  id: string;
  name: string;
  number: number;
  attack: number;
  block: number;
  serve: number;
}

interface TeamBlock {
  teamName: string;
  stats: { attack: number; block: number; serve: number };
  players: Player[];
}

interface GameStats {
  teamA: TeamBlock;
  teamB: TeamBlock;
}

/* ================= HELPERS ================= */

function calcTotal(a: number, b: number, c: number): number {
  return a + b + c;
}

/* ================= PAGE ================= */

export default function AdminGameStats() {
  const [games, setGames] = useState<GameMini[]>([]);
  const [gameId, setGameId] = useState("");

  const [teamA, setTeamA] = useState<TeamBlock | null>(null);
  const [teamB, setTeamB] = useState<TeamBlock | null>(null);

  /* LOAD GAMES */
  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((d: GameMini[]) => setGames(d));
  }, []);

  /* SELECT GAME */
  const selectGame = async (id: string) => {
    const g = games.find((x) => x._id === id);
    if (!g) return;

    setGameId(id);

    // 🔹 Try load existing stats first
    const res = await fetch(`/api/game-stats?gameId=${id}`);
    const data = (await res.json()) as GameStats | null;

    if (data && data.teamA && data.teamB) {
      setTeamA(data.teamA);
      setTeamB(data.teamB);
      return;
    }

    // 🔹 Else create fresh blocks
    setTeamA({
      teamName: g.teamA.name,
      stats: { attack: 0, block: 0, serve: 0 },
      players: [],
    });

    setTeamB({
      teamName: g.teamB.name,
      stats: { attack: 0, block: 0, serve: 0 },
      players: [],
    });
  };

  /* ADD PLAYER */
  const addPlayer = (team: "A" | "B") => {
    const p: Player = {
      id: nanoid(),
      name: "",
      number: 0,
      attack: 0,
      block: 0,
      serve: 0,
    };

    if (team === "A" && teamA) {
      setTeamA({
        ...teamA,
        players: [...teamA.players, p],
      });
    }

    if (team === "B" && teamB) {
      setTeamB({
        ...teamB,
        players: [...teamB.players, p],
      });
    }
  };

  /* SAVE / UPDATE */
  const save = async () => {
    if (!teamA || !teamB) return;

    await fetch("/api/game-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId,
        teamA,
        teamB,
      }),
    });

    alert("Stats saved / updated");
  };

  /* RENDER TEAM BLOCK */
  const renderTeam = (team: TeamBlock, setTeam: (t: TeamBlock) => void) => (
    <div className="border p-3 rounded space-y-2">
      <h2 className="font-bold">{team.teamName}</h2>

      {/* TEAM TOTAL INPUTS */}
      <div className="flex gap-2">
        {(["attack", "block", "serve"] as const).map((k) => (
          <input
            key={k}
            className="border p-1 w-1/3"
            placeholder={k}
            type="number"
            value={team.stats[k]}
            onChange={(e) =>
              setTeam({
                ...team,
                stats: {
                  ...team.stats,
                  [k]: Number(e.target.value),
                },
              })
            }
          />
        ))}
      </div>

      {/* TEAM TOTAL DISPLAY */}
      <div className="bg-gray-100 p-2 rounded text-sm font-semibold">
        ALL (TOTAL):{" "}
        {calcTotal(team.stats.attack, team.stats.block, team.stats.serve)}
      </div>

      {/* PLAYERS */}
      {team.players.map((p, i) => (
        <div key={`${p.id}-${i}`} className="flex gap-1 items-center">
          <input
            className="border p-1 w-24"
            placeholder="Name"
            value={p.name}
            onChange={(e) => {
              const arr = [...team.players];
              arr[i] = {
                ...p,
                name: e.target.value,
              };
              setTeam({
                ...team,
                players: arr,
              });
            }}
          />

          <input
            className="border p-1 w-14"
            placeholder="#"
            type="number"
            value={p.number}
            onChange={(e) => {
              const arr = [...team.players];
              arr[i] = {
                ...p,
                number: Number(e.target.value),
              };
              setTeam({
                ...team,
                players: arr,
              });
            }}
          />

          {(["attack", "block", "serve"] as const).map((k) => (
            <input
              key={k}
              className="border p-1 w-14"
              type="number"
              placeholder={k}
              value={p[k]}
              onChange={(e) => {
                const arr = [...team.players];
                arr[i] = {
                  ...p,
                  [k]: Number(e.target.value),
                };
                setTeam({
                  ...team,
                  players: arr,
                });
              }}
            />
          ))}

          {/* PLAYER TOTAL */}
          <span className="w-20 text-center font-bold">
            ALL:
            {calcTotal(p.attack, p.block, p.serve)}
          </span>

          {/* DELETE PLAYER */}
          <button
            onClick={() => {
              const arr = team.players.filter((x) => x.id !== p.id);
              setTeam({
                ...team,
                players: arr,
              });
            }}
            className="text-red-500 font-bold"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="font-bold text-xl">Admin — Game Stats</h1>

      {/* GAME SELECT */}
      <select
        className="border p-2 w-full"
        onChange={(e) => selectGame(e.target.value)}
      >
        <option>Select Game</option>
        {games.map((g) => (
          <option key={g._id} value={g._id}>
            {g.teamA.name} vs {g.teamB.name}
          </option>
        ))}
      </select>

      {teamA && renderTeam(teamA, setTeamA)}
      {teamB && renderTeam(teamB, setTeamB)}

      {/* ADD PLAYER ROW */}
      <button
        onClick={() => {
          addPlayer("A");
          addPlayer("B");
        }}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        ➕ Add Player Row
      </button>

      {/* SAVE / UPDATE */}
      <button onClick={save} className="bg-vnl text-white p-2 rounded w-full">
        💾 Save / Update Stats
      </button>
    </div>
  );
}
