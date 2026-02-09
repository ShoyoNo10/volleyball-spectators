"use client";

import { useEffect, useMemo, useState } from "react";

type TeamMini = { name: string; logo: string };

type Game = {
  _id: string;
  date: string;
  time: string;
  teamA: TeamMini;
  teamB: TeamMini;
  finished: boolean;
  liveUrl: string;
  score: { a: number; b: number };
  sets: string[];
};

async function upload(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
  const data: { url: string } = await res.json();
  return data.url;
}

export default function AdminSchedule() {
  // create form
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");

  const [logoA, setLogoA] = useState<File | null>(null);
  const [logoB, setLogoB] = useState<File | null>(null);

  // list + edit
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGames = async () => {
    setLoading(true);
    const res = await fetch("/api/schedule", { cache: "no-store" });
    const data: Game[] = await res.json();
    // ensure defaults
    const normalized = data.map((g) => ({
      ...g,
      finished: !!g.finished,
      liveUrl: g.liveUrl ?? "",
      score: g.score ?? { a: 0, b: 0 },
      sets: Array.isArray(g.sets) ? g.sets : [],
    }));
    setGames(normalized);
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const saveNew = async () => {
    let logoAUrl = "";
    let logoBUrl = "";

    if (logoA) logoAUrl = await upload(logoA);
    if (logoB) logoBUrl = await upload(logoB);

    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        time,
        liveUrl,
        finished: false,
        teamA: { name: teamAName, logo: logoAUrl },
        teamB: { name: teamBName, logo: logoBUrl },
        score: { a: 0, b: 0 },
        sets: [],
      }),
    });

    alert("Game created");
    await fetchGames();
  };

  const updateGame = async (g: Game) => {
    await fetch(`/api/schedule/${g._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        finished: g.finished,
        liveUrl: g.liveUrl,
        score: { a: Number(g.score.a) || 0, b: Number(g.score.b) || 0 },
        sets: (g.sets || []).filter((x) => x.trim().length > 0),
        date: g.date,
        time: g.time,
      }),
    });
  };

  const setGame = (id: string, patch: Partial<Game>) => {
    setGames((prev) =>
      prev.map((g) => (g._id === id ? { ...g, ...patch } : g)),
    );
  };

  const addSetRow = (id: string) => {
    setGames((prev) =>
      prev.map((g) =>
        g._id === id ? { ...g, sets: [...(g.sets || []), ""] } : g,
      ),
    );
  };

  const updateSetValue = (id: string, idx: number, value: string) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g._id !== id) return g;
        const next = [...(g.sets || [])];
        next[idx] = value;
        return { ...g, sets: next };
      }),
    );
  };

  const removeSetRow = (id: string, idx: number) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g._id !== id) return g;
        const next = [...(g.sets || [])];
        next.splice(idx, 1);
        return { ...g, sets: next };
      }),
    );
  };

  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      if (da !== db) return da - db;
      return (a.time || "").localeCompare(b.time || "");
    });
  }, [games]);

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Admin — Schedule</h1>

      {/* ===== CREATE (existing design) ===== */}
      <div className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Time (HH:mm)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Team A Name"
          value={teamAName}
          onChange={(e) => setTeamAName(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setLogoA(e.target.files?.[0] || null)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Team B Name"
          value={teamBName}
          onChange={(e) => setTeamBName(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setLogoB(e.target.files?.[0] || null)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Live URL"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
        />

        <button
          onClick={saveNew}
          className="bg-vnl text-white p-2 rounded w-full"
        >
          ➕ Add Game
        </button>
      </div>

      {/* ===== LIST / EDIT (added, minimal design) ===== */}
      <div className="pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Existing Games</h2>
          <button className="border px-2 py-1" onClick={fetchGames}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="space-y-3 mt-3">
          {sortedGames.map((g) => (
            <div key={g._id} className="border p-3 space-y-2">
              <div className="text-sm font-bold">
                {g.date} • {g.time} — {g.teamA?.name} vs {g.teamB?.name}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={g.finished}
                  onChange={(e) =>
                    setGame(g._id, { finished: e.target.checked })
                  }
                />
                <span className="text-sm">finished</span>
              </div>

              {/* score */}
              <div className="flex items-center gap-2">
                <input
                  className="border p-2 w-20"
                  placeholder="A"
                  value={String(g.score?.a ?? 0)}
                  onChange={(e) =>
                    setGame(g._id, {
                      score: {
                        a: Number(e.target.value) || 0,
                        b: g.score?.b ?? 0,
                      },
                    })
                  }
                />
                <span>:</span>
                <input
                  className="border p-2 w-20"
                  placeholder="B"
                  value={String(g.score?.b ?? 0)}
                  onChange={(e) =>
                    setGame(g._id, {
                      score: {
                        a: g.score?.a ?? 0,
                        b: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
                <span className="text-sm">match score</span>
              </div>

              {/* sets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">
                    Sets (25:14 гэх мэт)
                  </span>
                  <button
                    className="border px-2 py-1"
                    onClick={() => addSetRow(g._id)}
                  >
                    + set
                  </button>
                </div>

                {(g.sets || []).length === 0 && (
                  <div className="text-sm text-gray-500">Sets байхгүй</div>
                )}

                {(g.sets || []).map((s, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="border p-2 w-full"
                      placeholder="25:14"
                      value={s}
                      onChange={(e) =>
                        updateSetValue(g._id, idx, e.target.value)
                      }
                    />
                    <button
                      className="border px-2"
                      onClick={() => removeSetRow(g._id, idx)}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>

              {/* liveUrl */}
              <input
                className="border p-2 w-full"
                placeholder="Live URL"
                value={g.liveUrl || ""}
                onChange={(e) => setGame(g._id, { liveUrl: e.target.value })}
              />

              <button
                className="bg-vnl text-white p-2 rounded w-full"
                onClick={async () => {
                  await updateGame(g);
                  alert("Updated");
                  await fetchGames();
                }}
              >
                💾 Save changes
              </button>
              <button
                className="border p-2 w-full"
                onClick={async () => {
                  const ok = confirm("Энэ тоглолтыг устгах уу?");
                  if (!ok) return;

                  await fetch(`/api/schedule/${g._id}`, { method: "DELETE" });
                  alert("Deleted");
                  await fetchGames();
                }}
              >
                🗑 Delete game
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
