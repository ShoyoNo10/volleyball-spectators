"use client";

import { useEffect, useState } from "react";

/* ================= TYPES ================= */

interface Team {
  _id: string;
  name: string;
  logo: string;
}

interface SetScore {
  teamA: number;
  teamB: number;
}

interface Match {
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

export default function AdminTeamSchedule() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [editing, setEditing] = useState<Match | null>(null);

  const [form, setForm] = useState({
    teamId: "",
    teamA: "",
    teamB: "",
    logoA: "",
    logoB: "",
    gender: "men" as "men" | "women",
    week: "Week 1",
    matchDate: "",
    matchTime: "",
  });

  /* ================= LOAD ================= */

  const loadTeams = async (): Promise<void> => {
    const res = await fetch("/api/teams");
    const data: unknown = await res.json();
    if (Array.isArray(data)) setTeams(data as Team[]);
  };

  const loadMatches = async (): Promise<void> => {
    const res = await fetch("/api/team-schedule");
    const data: unknown = await res.json();
    if (Array.isArray(data)) setMatches(data as Match[]);
  };

  useEffect(() => {
    loadTeams();
    loadMatches();
  }, []);

  /* ================= UPLOAD ================= */

  const uploadLogo = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
    const data: unknown = await res.json();

    if (!data || typeof data !== "object") throw new Error("Upload response invalid");
    const obj = data as { url?: unknown; secure_url?: unknown; secureUrl?: unknown };

    const url =
      (typeof obj.url === "string" && obj.url) ||
      (typeof obj.secure_url === "string" && obj.secure_url) ||
      (typeof obj.secureUrl === "string" && obj.secureUrl);

    if (!url) throw new Error("Upload url not found");
    return url;
  };

  /* ================= CRUD ================= */

  const addMatch = async (): Promise<void> => {
    if (!form.teamId) return alert("Эхлээд баг сонгоно уу");
    if (!form.teamB.trim()) return alert("Өрсөлдөгч багийн нэр хоосон байна");
    if (!form.matchDate) return alert("Огноо сонгоно уу");
    if (!form.matchTime) return alert("Цаг сонгоно уу");

    await fetch("/api/team-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        finished: false,
        finalA: 0,
        finalB: 0,
        sets: [],
      }),
    });

    setForm({
      teamId: "",
      teamA: "",
      teamB: "",
      logoA: "",
      logoB: "",
      gender: "men",
      week: "Week 1",
      matchDate: "",
      matchTime: "",
    });

    loadMatches();
  };

  const removeMatch = async (id: string): Promise<void> => {
    if (!confirm("Устгах уу?")) return;

    await fetch("/api/team-schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadMatches();
  };

  const saveEdit = async (): Promise<void> => {
    if (!editing) return;

    await fetch("/api/team-schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing._id,
        finished: editing.finished,
        finalA: editing.finalA,
        finalB: editing.finalB,
        sets: editing.sets,
      }),
    });

    setEditing(null);
    loadMatches();
  };

  /* ================= UI CLASSES ================= */

  const card = "bg-white rounded-2xl shadow-sm border border-black/10";
  const label = "block text-sm font-bold text-black mb-1";
  const input =
    "w-full border border-black/20 bg-white text-black placeholder:text-gray-500 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-black/20";
  const btn = "px-4 py-2 rounded-xl font-bold transition disabled:opacity-50";
  const btnPrimary = `${btn} bg-black text-white hover:opacity-90`;
  const btnSoft = `${btn} bg-gray-100 text-black border border-black/10 hover:bg-gray-200`;
  const btnDanger = `${btn} bg-red-600 text-white hover:opacity-90`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-black">Админ — Хуваарь</h1>
          <div className="text-sm text-gray-600">
            Баг сонгоод тоглолт нэмнэ. Дууссан бол “Edit” дээр оноо, сет оруулна.
          </div>
        </div>

        {/* FORM */}
        <div className={`${card} p-4 space-y-3`}>
          <div className="text-lg font-extrabold text-black">➕ Тоглолт нэмэх</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* MAIN TEAM */}
            <div className="md:col-span-2">
              <label className={label}>Үндсэн баг</label>
              <select
                className={input}
                value={form.teamId}
                onChange={(e) => {
                  const team = teams.find((t) => t._id === e.target.value);
                  setForm((p) => ({
                    ...p,
                    teamId: e.target.value,
                    teamA: team?.name || "",
                    logoA: team?.logo || "",
                  }));
                }}
              >
                <option value="">Баг сонгох...</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-600 mt-1">
                Сонгосон баг автоматаар Team A болно.
              </div>
            </div>

            {/* GENDER */}
            <div>
              <label className={label}>Төрөл</label>
              <select
                className={input}
                value={form.gender}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    gender: e.target.value as "men" | "women",
                  }))
                }
              >
                <option value="men">ЭРЭГТЭЙ</option>
                <option value="women">ЭМЭГТЭЙ</option>
              </select>
            </div>

            {/* OPPONENT */}
            <div className="md:col-span-2">
              <label className={label}>Өрсөлдөгч баг (Team B)</label>
              <input
                className={input}
                placeholder="Ж: Japan"
                value={form.teamB}
                onChange={(e) => setForm((p) => ({ ...p, teamB: e.target.value }))}
              />
              <div className="text-xs text-gray-600 mt-1">
                Өрсөлдөгч баг чинь Teams дээр байгаа бол дараа нь хүсвэл dropdown болгож өгч болно.
              </div>
            </div>

            {/* WEEK */}
            <div>
              <label className={label}>Долоо хоног</label>
              <input
                className={input}
                placeholder="Week 1"
                value={form.week}
                onChange={(e) => setForm((p) => ({ ...p, week: e.target.value }))}
              />
            </div>

            {/* DATE */}
            <div>
              <label className={label}>Огноо</label>
              <input
                type="date"
                className={input}
                value={form.matchDate}
                onChange={(e) => setForm((p) => ({ ...p, matchDate: e.target.value }))}
              />
            </div>

            {/* TIME */}
            <div>
              <label className={label}>Цаг</label>
              <input
                type="time"
                className={input}
                value={form.matchTime}
                onChange={(e) => setForm((p) => ({ ...p, matchTime: e.target.value }))}
              />
            </div>

            {/* LOGO UPLOADS */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`${card} p-3`}>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.logoA || "/logo.png"}
                    alt="logoA"
                    className="w-12 h-12 rounded-2xl object-cover border border-black/10 bg-white"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-extrabold text-black">Team A лого</div>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm mt-2"
                      onChange={async (e) => {
                        if (!e.target.files?.[0]) return;
                        const url = await uploadLogo(e.target.files[0]);
                        setForm((p) => ({ ...p, logoA: url }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className={`${card} p-3`}>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.logoB || "/logo.png"}
                    alt="logoB"
                    className="w-12 h-12 rounded-2xl object-cover border border-black/10 bg-white"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-extrabold text-black">Team B лого</div>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm mt-2"
                      onChange={async (e) => {
                        if (!e.target.files?.[0]) return;
                        const url = await uploadLogo(e.target.files[0]);
                        setForm((p) => ({ ...p, logoB: url }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={addMatch} className={btnPrimary}>
            ➕ Тоглолт нэмэх
          </button>
        </div>

        {/* LIST */}
        <div className={`${card} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
            <div className="text-lg font-extrabold text-black">Тоглолтын жагсаалт</div>
            <div className="text-sm text-gray-600">{matches.length} тоглолт</div>
          </div>

          <div className="divide-y divide-black/10">
            {matches.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-600">Одоогоор тоглолт алга.</div>
            ) : (
              matches.map((m) => (
                <div key={m._id} className="px-4 py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex items-start gap-3">
                    {/* logos */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.logoA || "/logo.png"}
                        alt="A"
                        className="w-10 h-10 rounded-xl object-cover border border-black/10 bg-white"
                      />
                      <span className="text-gray-400 font-bold">vs</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.logoB || "/logo.png"}
                        alt="B"
                        className="w-10 h-10 rounded-xl object-cover border border-black/10 bg-white"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="font-extrabold text-black truncate">
                        {m.teamA} <span className="text-gray-400">vs</span> {m.teamB}
                      </div>

                      <div className="text-sm text-gray-700">
                        <b>{m.week}</b> •{" "}
                        {m.gender === "men" ? "ЭРЭГТЭЙ" : "ЭМЭГТЭЙ"}
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        {m.finished ? (
                          <>
                            Дууссан • <b>Final:</b> {m.finalA} - {m.finalB}
                          </>
                        ) : (
                          <>
                            {m.matchDate} • {m.matchTime}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditing(m)} className={btnSoft}>
                      ✏️ Засах
                    </button>
                    <button onClick={() => removeMatch(m._id)} className={btnDanger}>
                      🗑 Устгах
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= EDIT MODAL ================= */}
        {editing && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <div className="text-lg font-extrabold text-black">
                  Засах — {editing.teamA} vs {editing.teamB}
                </div>
                <div className="text-sm text-gray-600">
                  Дууссан эсэх, финал оноо, сет оноог энд тохируулна.
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* FINISHED */}
                <label className="flex items-center gap-2 text-sm font-bold text-black">
                  <input
                    type="checkbox"
                    checked={editing.finished}
                    onChange={(e) =>
                      setEditing((p) => (p ? { ...p, finished: e.target.checked } : null))
                    }
                  />
                  Тоглолт дууссан
                </label>

                {/* FINAL SCORE */}
                <div>
                  <div className="text-sm font-extrabold text-black mb-2">Final оноо</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      className={input}
                      placeholder="Team A"
                      value={editing.finalA}
                      onChange={(e) =>
                        setEditing((p) => (p ? { ...p, finalA: Number(e.target.value) } : null))
                      }
                    />
                    <input
                      type="number"
                      className={input}
                      placeholder="Team B"
                      value={editing.finalB}
                      onChange={(e) =>
                        setEditing((p) => (p ? { ...p, finalB: Number(e.target.value) } : null))
                      }
                    />
                  </div>
                </div>

                {/* SETS */}
                <div className="space-y-2">
                  <div className="text-sm font-extrabold text-black">Сетүүд</div>

                  {editing.sets.map((s, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        className={input}
                        placeholder="A"
                        value={s.teamA}
                        onChange={(e) => {
                          const copy = [...editing.sets];
                          copy[i] = { ...copy[i], teamA: Number(e.target.value) };
                          setEditing((p) => (p ? { ...p, sets: copy } : null));
                        }}
                      />
                      <input
                        type="number"
                        className={input}
                        placeholder="B"
                        value={s.teamB}
                        onChange={(e) => {
                          const copy = [...editing.sets];
                          copy[i] = { ...copy[i], teamB: Number(e.target.value) };
                          setEditing((p) => (p ? { ...p, sets: copy } : null));
                        }}
                      />
                      <button
                        className={btnDanger}
                        onClick={() => {
                          const copy = [...editing.sets];
                          copy.splice(i, 1);
                          setEditing((p) => (p ? { ...p, sets: copy } : null));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    className={btnSoft}
                    onClick={() =>
                      setEditing((p) =>
                        p ? { ...p, sets: [...p.sets, { teamA: 0, teamB: 0 }] } : null
                      )
                    }
                  >
                    ➕ Сет нэмэх
                  </button>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="px-5 py-4 border-t border-black/10 flex justify-end gap-2">
                <button className={btnSoft} onClick={() => setEditing(null)}>
                  Болих
                </button>
                <button className={btnPrimary} onClick={saveEdit}>
                  Хадгалах
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
