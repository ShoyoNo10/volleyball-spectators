"use client";

import { useEffect, useMemo, useState } from "react";
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

const MN = {
  attack: "Довт",
  block: "Хаалт",
  serve: "Сервис",
  total: "Нийт",
};

/* ================= PAGE ================= */

export default function AdminGameStats() {
  const [games, setGames] = useState<GameMini[]>([]);
  const [gameId, setGameId] = useState("");

  const [teamA, setTeamA] = useState<TeamBlock | null>(null);
  const [teamB, setTeamB] = useState<TeamBlock | null>(null);

  const [saving, setSaving] = useState(false);

  /* LOAD GAMES */
  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((d: GameMini[]) => setGames(Array.isArray(d) ? d : []));
  }, []);

  /* SELECT GAME */
  const selectGame = async (id: string) => {
    const g = games.find((x) => x._id === id);
    if (!g) return;

    setGameId(id);

    const res = await fetch(`/api/game-stats?gameId=${id}`);
    const data = (await res.json()) as GameStats | null;

    if (data && data.teamA && data.teamB) {
      setTeamA(data.teamA);
      setTeamB(data.teamB);
      return;
    }

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

    if (team === "A" && teamA) setTeamA({ ...teamA, players: [...teamA.players, p] });
    if (team === "B" && teamB) setTeamB({ ...teamB, players: [...teamB.players, p] });
  };

  /* SAVE / UPDATE */
  const save = async () => {
    if (!teamA || !teamB || !gameId) return alert("Эхлээд тоглолт сонгоно уу");

    try {
      setSaving(true);
      await fetch("/api/game-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, teamA, teamB }),
      });
      alert("Амжилттай хадгаллаа ✅");
    } finally {
      setSaving(false);
    }
  };

  /* UI CLASSES */
  const card = "bg-white rounded-2xl shadow-sm border border-black/10";
  const label = "text-xs font-extrabold text-gray-700";
  const input =
    "w-full border border-black/20 bg-white text-black rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20";
  const btn =
    "w-full py-2.5 rounded-xl font-extrabold transition disabled:opacity-50";
  const btnSoft =
    "bg-gray-100 text-black border border-black/10 hover:bg-gray-200";
  const btnPrimary = "bg-black text-white hover:opacity-90";
  const pill =
    "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-gray-50 text-sm font-bold text-black";

  /* COMPUTED TOTALS */
  const teamATotal = useMemo(
    () =>
      teamA ? calcTotal(teamA.stats.attack, teamA.stats.block, teamA.stats.serve) : 0,
    [teamA]
  );
  const teamBTotal = useMemo(
    () =>
      teamB ? calcTotal(teamB.stats.attack, teamB.stats.block, teamB.stats.serve) : 0,
    [teamB]
  );

  /* RENDER TEAM BLOCK */
  const renderTeam = (team: TeamBlock, setTeam: (t: TeamBlock) => void) => {
    const sum = calcTotal(team.stats.attack, team.stats.block, team.stats.serve);

    return (
      <div className={`${card} p-4 space-y-4`}>
        {/* title */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-extrabold text-black truncate">
              {team.teamName}
            </div>
            <div className="text-sm text-gray-600">
              Багийн нийт оноо + тоглогчдын мөр
            </div>
          </div>
          <div className={pill}>
            {MN.total}: <span className="text-black">{sum}</span>
          </div>
        </div>

        {/* TEAM TOTAL INPUTS */}
        <div className="grid grid-cols-3 gap-2">
          {(["attack", "block", "serve"] as const).map((k) => (
            <div key={k} className="space-y-1">
              <div className={label}>{MN[k]}</div>
              <input
                className={input}
                type="number"
                value={team.stats[k]}
                onChange={(e) =>
                  setTeam({
                    ...team,
                    stats: { ...team.stats, [k]: Number(e.target.value) },
                  })
                }
              />
            </div>
          ))}
        </div>

        {/* PLAYERS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-black/10">
          {/* header */}
          <div className="grid grid-cols-[1.6fr_.9fr_.9fr_.9fr_.9fr_.4fr] gap-2 px-3 py-2 bg-gray-50 text-xs font-extrabold text-gray-700 border-b border-black/10">
            <span>Тоглогч</span>
            <span className="text-center">{MN.attack}</span>
            <span className="text-center">{MN.block}</span>
            <span className="text-center">{MN.serve}</span>
            <span className="text-center">{MN.total}</span>
            <span className="text-right"> </span>
          </div>

          {team.players.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-600">
              Одоогоор тоглогч алга. “➕ Player Row” дарж нэмээрэй.
            </div>
          ) : (
            team.players.map((p, i) => {
              const t = calcTotal(p.attack, p.block, p.serve);

              return (
                <div
                  key={`${p.id}-${i}`}
                  className="grid grid-cols-[1.6fr_.9fr_.9fr_.9fr_.9fr_.4fr] gap-2 px-3 py-2 items-center border-b border-black/5 hover:bg-gray-50/60 transition"
                >
                  {/* Name */}
                  <div className="flex gap-2 items-center min-w-0">
                    <input
                      className={`${input} !py-2`}
                      placeholder="Нэр"
                      value={p.name}
                      onChange={(e) => {
                        const arr = [...team.players];
                        arr[i] = { ...p, name: e.target.value };
                        setTeam({ ...team, players: arr });
                      }}
                    />
                    <input
                      className={`${input} !py-2 w-20`}
                      placeholder="#"
                      type="number"
                      value={p.number}
                      onChange={(e) => {
                        const arr = [...team.players];
                        arr[i] = { ...p, number: Number(e.target.value) };
                        setTeam({ ...team, players: arr });
                      }}
                    />
                  </div>

                  {/* attack */}
                  <input
                    className={`${input} text-center`}
                    type="number"
                    value={p.attack}
                    onChange={(e) => {
                      const arr = [...team.players];
                      arr[i] = { ...p, attack: Number(e.target.value) };
                      setTeam({ ...team, players: arr });
                    }}
                  />

                  {/* block */}
                  <input
                    className={`${input} text-center`}
                    type="number"
                    value={p.block}
                    onChange={(e) => {
                      const arr = [...team.players];
                      arr[i] = { ...p, block: Number(e.target.value) };
                      setTeam({ ...team, players: arr });
                    }}
                  />

                  {/* serve */}
                  <input
                    className={`${input} text-center`}
                    type="number"
                    value={p.serve}
                    onChange={(e) => {
                      const arr = [...team.players];
                      arr[i] = { ...p, serve: Number(e.target.value) };
                      setTeam({ ...team, players: arr });
                    }}
                  />

                  {/* total */}
                  <div className="text-center font-extrabold text-black">{t}</div>

                  {/* delete */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const arr = team.players.filter((x) => x.id !== p.id);
                        setTeam({ ...team, players: arr });
                      }}
                      className="px-3 py-2 rounded-xl bg-red-600 text-white font-extrabold hover:opacity-90"
                      aria-label="remove"
                      title="Устгах"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-black">Админ — Game Stats</h1>
          <div className="text-sm text-gray-600">
            Тоглолт сонгоод баг бүр дээр тоглогчдын оноог оруулна.
          </div>
        </div>

        {/* GAME SELECT */}
        <div className={`${card} p-4 space-y-2`}>
          <div className="text-sm font-extrabold text-black">Тоглолт сонгох</div>
          <select
            className={input}
            value={gameId}
            onChange={(e) => selectGame(e.target.value)}
          >
            <option value="">Select Game...</option>
            {games.map((g) => (
              <option key={g._id} value={g._id}>
                {g.teamA.name} vs {g.teamB.name}
              </option>
            ))}
          </select>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-1 gap-4">
          {teamA && renderTeam(teamA, setTeamA)}
          {teamB && renderTeam(teamB, setTeamB)}
        </div>

        {/* Actions */}
        {teamA && teamB && (
          <div className={`${card} p-4 space-y-3`}>
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="text-sm font-extrabold text-black">
                Нийт: <span className="text-gray-700">{teamATotal} - {teamBTotal}</span>
              </div>
              <div className="text-xs text-gray-600">
                “Player Row” дарвал 2 багт зэрэг мөр нэмнэ.
              </div>
            </div>

            <button
              onClick={() => {
                addPlayer("A");
                addPlayer("B");
              }}
              className={`${btn} ${btnSoft}`}
            >
              ➕ Player Row нэмэх
            </button>

            <button
              onClick={save}
              disabled={saving}
              className={`${btn} ${btnPrimary}`}
            >
              {saving ? "Хадгалж байна..." : "💾 Save / Update Stats"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
