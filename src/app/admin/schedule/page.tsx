"use client";

import { useEffect, useMemo, useState } from "react";

type Gender = "men" | "women";
type TeamMini = { name: string; logo: string };
type Score = { a: number; b: number };

type Game = {
  _id: string;

  week: string;
  description: string;
  gender: Gender;

  date: string;
  time: string;

  teamA: TeamMini;
  teamB: TeamMini;

  finished: boolean;
  liveUrl: string;

  score: Score;
  sets: string[];
};

type UploadResponse = { secure_url?: string; url?: string; secureUrl?: string };

function isGender(x: unknown): x is Gender {
  return x === "men" || x === "women";
}

function normalizeGame(x: unknown): Game | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;

  const _id = typeof o._id === "string" ? o._id : null;
  if (!_id) return null;

  const teamAObj = (o.teamA && typeof o.teamA === "object") ? (o.teamA as Record<string, unknown>) : null;
  const teamBObj = (o.teamB && typeof o.teamB === "object") ? (o.teamB as Record<string, unknown>) : null;

  const teamA: TeamMini = {
    name: typeof teamAObj?.name === "string" ? teamAObj.name : "",
    logo: typeof teamAObj?.logo === "string" ? teamAObj.logo : "",
  };
  const teamB: TeamMini = {
    name: typeof teamBObj?.name === "string" ? teamBObj.name : "",
    logo: typeof teamBObj?.logo === "string" ? teamBObj.logo : "",
  };

  const scoreObj = (o.score && typeof o.score === "object") ? (o.score as Record<string, unknown>) : null;
  const score: Score = {
    a: typeof scoreObj?.a === "number" && Number.isFinite(scoreObj.a) ? scoreObj.a : 0,
    b: typeof scoreObj?.b === "number" && Number.isFinite(scoreObj.b) ? scoreObj.b : 0,
  };

  const sets = Array.isArray(o.sets)
    ? o.sets.filter((v): v is string => typeof v === "string").map((s) => s.trim()).filter(Boolean)
    : [];

  const gender: Gender = isGender(o.gender) ? o.gender : "men";

  return {
    _id,

    week: typeof o.week === "string" ? o.week : "",
    description: typeof o.description === "string" ? o.description : "",
    gender,

    date: typeof o.date === "string" ? o.date : "",
    time: typeof o.time === "string" ? o.time : "",

    teamA,
    teamB,

    finished: typeof o.finished === "boolean" ? o.finished : false,
    liveUrl: typeof o.liveUrl === "string" ? o.liveUrl : "",

    score,
    sets,
  };
}

async function uploadLogo(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
  const data: UploadResponse = await res.json();

  const url = data.secure_url ?? data.url ?? data.secureUrl;
  if (!url) throw new Error("Upload response дээр url/secure_url алга");

  return url;
}

export default function AdminSchedule() {
  // ===== Create form =====
  const [week, setWeek] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState<Gender>("men");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");

  const [logoAFile, setLogoAFile] = useState<File | null>(null);
  const [logoBFile, setLogoBFile] = useState<File | null>(null);

  const [creating, setCreating] = useState(false);

  // ===== List =====
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/schedule", { cache: "no-store" });
      const data: unknown = await res.json();

      if (Array.isArray(data)) {
        const norm = data
          .map(normalizeGame)
          .filter((g): g is Game => g !== null);
        setGames(norm);
      } else {
        setGames([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const clearCreate = () => {
    setWeek("");
    setDescription("");
    setGender("men");
    setDate("");
    setTime("");
    setLiveUrl("");
    setTeamAName("");
    setTeamBName("");
    setLogoAFile(null);
    setLogoBFile(null);
  };

  const createGame = async () => {
    if (!date || !time) return alert("Date/Time хоосон байна");
    if (!teamAName || !teamBName) return alert("2 багийн нэр хоосон байна");
    if (!logoAFile || !logoBFile) return alert("2 багийн logo upload хийнэ үү");

    setCreating(true);
    try {
      const logoAUrl = await uploadLogo(logoAFile);
      const logoBUrl = await uploadLogo(logoBFile);

      const payload = {
        week,
        description,
        gender,

        date,
        time,
        liveUrl,

        finished: false,
        teamA: { name: teamAName, logo: logoAUrl },
        teamB: { name: teamBName, logo: logoBUrl },

        score: { a: 0, b: 0 },
        sets: [],
      };

      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({ error: "Create failed" }) as { error: string });
        alert(msg.error ?? "Create failed");
        return;
      }

      alert("✅ Created");
      clearCreate();
      await fetchGames();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  // ===== Edit helpers =====
  const patchGame = (id: string, patch: Partial<Game>) => {
    setGames((prev) => prev.map((g) => (g._id === id ? { ...g, ...patch } : g)));
  };

  const patchTeam = (id: string, side: "A" | "B", patch: Partial<TeamMini>) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g._id !== id) return g;
        const nextTeam = side === "A" ? { ...g.teamA, ...patch } : { ...g.teamB, ...patch };
        return side === "A" ? { ...g, teamA: nextTeam } : { ...g, teamB: nextTeam };
      })
    );
  };

  const addSet = (id: string) => {
    setGames((prev) =>
      prev.map((g) => (g._id === id ? { ...g, sets: [...g.sets, ""] } : g))
    );
  };

  const updateSet = (id: string, idx: number, value: string) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g._id !== id) return g;
        const next = [...g.sets];
        next[idx] = value;
        return { ...g, sets: next };
      })
    );
  };

  const removeSet = (id: string, idx: number) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g._id !== id) return g;
        const next = [...g.sets];
        next.splice(idx, 1);
        return { ...g, sets: next };
      })
    );
  };

  const saveGame = async (g: Game) => {
    const payload = {
      _id: g._id,

      week: g.week,
      description: g.description,
      gender: g.gender,

      date: g.date,
      time: g.time,
      liveUrl: g.liveUrl,

      teamA: g.teamA,
      teamB: g.teamB,

      finished: g.finished,
      score: g.finished ? { a: Number(g.score.a) || 0, b: Number(g.score.b) || 0 } : { a: 0, b: 0 },
      sets: g.finished ? g.sets.map((s) => s.trim()).filter(Boolean) : [],
    };

    const res = await fetch("/api/schedule", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.json().catch(() => ({ error: "Update failed" }) as { error: string });
      alert(msg.error ?? "Update failed");
      return;
    }

    alert("✅ Updated");
    await fetchGames();
  };

  const deleteGame = async (id: string) => {
    const ok = confirm("Энэ тоглолтыг устгах уу?");
    if (!ok) return;

    const res = await fetch(`/api/schedule?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    alert("🗑 Deleted");
    await fetchGames();
  };

  const uploadAndSetTeamLogo = async (id: string, side: "A" | "B", file: File) => {
    try {
      const url = await uploadLogo(file);
      patchTeam(id, side, { logo: url });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    }
  };

  const sorted = useMemo(() => {
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

      {/* CREATE */}
      <div className="border rounded-lg p-3 space-y-2">
        <div className="font-bold">➕ Add Game</div>

        <input className="border p-2 w-full" placeholder="Week (Week2)" value={week} onChange={(e) => setWeek(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <select className="border p-2 w-full" value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
          <option value="men">MEN</option>
          <option value="women">WOMEN</option>
        </select>

        <input className="border p-2 w-full" placeholder="Date (YYYY-MM-DD)" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Time (HH:mm)" value={time} onChange={(e) => setTime(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Live URL" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />

        <input className="border p-2 w-full" placeholder="Team A Name" value={teamAName} onChange={(e) => setTeamAName(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setLogoAFile(e.target.files?.[0] || null)} />

        <input className="border p-2 w-full" placeholder="Team B Name" value={teamBName} onChange={(e) => setTeamBName(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setLogoBFile(e.target.files?.[0] || null)} />

        <button
          onClick={createGame}
          disabled={creating}
          className="bg-vnl text-white p-2 rounded w-full disabled:opacity-60"
        >
          {creating ? "Uploading..." : "➕ Add Game"}
        </button>
      </div>

      {/* LIST */}
      <div className="pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Existing Games</h2>
          <button className="border px-2 py-1" onClick={fetchGames}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="space-y-3 mt-3">
          {sorted.map((g) => (
            <div key={g._id} className="border p-3 rounded-lg space-y-2">
              <div className="text-sm font-bold">
                {g.date} • {g.time} — {g.teamA.name} vs {g.teamB.name}
              </div>

              {/* meta */}
              <input className="border p-2 w-full" placeholder="Week" value={g.week} onChange={(e) => patchGame(g._id, { week: e.target.value })} />
              <input className="border p-2 w-full" placeholder="Description" value={g.description} onChange={(e) => patchGame(g._id, { description: e.target.value })} />
              <select className="border p-2 w-full" value={g.gender} onChange={(e) => patchGame(g._id, { gender: e.target.value as Gender })}>
                <option value="men">MEN</option>
                <option value="women">WOMEN</option>
              </select>

              {/* date time */}
              <div className="grid grid-cols-2 gap-2">
                <input className="border p-2 w-full" placeholder="date" value={g.date} onChange={(e) => patchGame(g._id, { date: e.target.value })} />
                <input className="border p-2 w-full" placeholder="time" value={g.time} onChange={(e) => patchGame(g._id, { time: e.target.value })} />
              </div>

              {/* teams + logo upload */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <div className="text-xs font-bold">TEAM A</div>
                  <input className="border p-2 w-full" value={g.teamA.name} onChange={(e) => patchTeam(g._id, "A", { name: e.target.value })} />
                  <div className="flex items-center gap-2">
                    {g.teamA.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.teamA.logo} alt="" className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadAndSetTeamLogo(g._id, "A", f);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold">TEAM B</div>
                  <input className="border p-2 w-full" value={g.teamB.name} onChange={(e) => patchTeam(g._id, "B", { name: e.target.value })} />
                  <div className="flex items-center gap-2">
                    {g.teamB.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.teamB.logo} alt="" className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadAndSetTeamLogo(g._id, "B", f);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* finished */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={g.finished}
                  onChange={(e) => {
                    const fin = e.target.checked;
                    patchGame(g._id, {
                      finished: fin,
                      score: fin ? g.score : { a: 0, b: 0 },
                      sets: fin ? g.sets : [],
                    });
                  }}
                />
                <span className="text-sm">finished</span>
              </div>

              {/* score + sets only when finished */}
              {g.finished && (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      className="border p-2 w-20"
                      placeholder="A"
                      value={String(g.score.a)}
                      onChange={(e) =>
                        patchGame(g._id, { score: { a: Number(e.target.value) || 0, b: g.score.b } })
                      }
                    />
                    <span>:</span>
                    <input
                      className="border p-2 w-20"
                      placeholder="B"
                      value={String(g.score.b)}
                      onChange={(e) =>
                        patchGame(g._id, { score: { a: g.score.a, b: Number(e.target.value) || 0 } })
                      }
                    />
                    <span className="text-sm">match score</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Sets (25:14)</span>
                      <button className="border px-2 py-1" onClick={() => addSet(g._id)}>
                        + set
                      </button>
                    </div>

                    {g.sets.length === 0 && (
                      <div className="text-sm text-gray-500">Sets байхгүй</div>
                    )}

                    {g.sets.map((s, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          className="border p-2 w-full"
                          placeholder="25:14"
                          value={s}
                          onChange={(e) => updateSet(g._id, idx, e.target.value)}
                        />
                        <button className="border px-2" onClick={() => removeSet(g._id, idx)}>
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* liveUrl */}
              <input
                className="border p-2 w-full"
                placeholder="Live URL"
                value={g.liveUrl}
                onChange={(e) => patchGame(g._id, { liveUrl: e.target.value })}
              />

              <button className="bg-vnl text-white p-2 rounded w-full" onClick={() => saveGame(g)}>
                💾 Save changes
              </button>

              <button className="border p-2 w-full" onClick={() => deleteGame(g._id)}>
                🗑 Delete game
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
