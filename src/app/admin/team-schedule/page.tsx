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
    if (Array.isArray(data)) {
      setTeams(data as Team[]);
    }
  };

  const loadMatches = async (): Promise<void> => {
    const res = await fetch("/api/team-schedule");
    const data: unknown = await res.json();
    if (Array.isArray(data)) {
      setMatches(data as Match[]);
    }
  };

  useEffect(() => {
    loadTeams();
    loadMatches();
  }, []);

  /* ================= UPLOAD ================= */

  const uploadLogo = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: fd,
    });

    const data: { url: string } = await res.json();
    return data.url;
  };

  /* ================= CRUD ================= */

  const addMatch = async (): Promise<void> => {
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

  /* ================= RENDER ================= */

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        Admin — Team Schedule
      </h1>

      {/* FORM */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white p-4 rounded shadow">
        {/* MAIN TEAM */}
        <select
          className="border p-2 col-span-2"
          value={form.teamId}
          onChange={(e) => {
            const team = teams.find(
              (t) => t._id === e.target.value
            );

            setForm((p) => ({
              ...p,
              teamId: e.target.value,
              teamA: team?.name || "",
              logoA: team?.logo || "",
            }));
          }}
        >
          <option value="">
            Select Main Team
          </option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* OPPONENT */}
        <input
          className="border p-2"
          placeholder="Opponent Team"
          value={form.teamB}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              teamB: e.target.value,
            }))
          }
        />

        {/* LOGO A */}
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            if (!e.target.files?.[0]) return;
            const url = await uploadLogo(
              e.target.files[0]
            );
            setForm((p) => ({
              ...p,
              logoA: url,
            }));
          }}
        />

        {/* LOGO B */}
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            if (!e.target.files?.[0]) return;
            const url = await uploadLogo(
              e.target.files[0]
            );
            setForm((p) => ({
              ...p,
              logoB: url,
            }));
          }}
        />

        {/* GENDER */}
        <select
          className="border p-2"
          value={form.gender}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              gender: e.target.value as
                | "men"
                | "women",
            }))
          }
        >
          <option value="men">MEN</option>
          <option value="women">WOMEN</option>
        </select>

        {/* WEEK */}
        <input
          className="border p-2"
          placeholder="Week (Week 1)"
          value={form.week}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              week: e.target.value,
            }))
          }
        />

        {/* DATE */}
        <input
          type="date"
          className="border p-2"
          value={form.matchDate}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              matchDate: e.target.value,
            }))
          }
        />

        {/* TIME */}
        <input
          type="time"
          className="border p-2"
          value={form.matchTime}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              matchTime: e.target.value,
            }))
          }
        />
      </div>

      <button
        onClick={addMatch}
        className="bg-black text-white px-4 py-2 rounded"
      >
        ➕ Add Match
      </button>

      {/* LIST */}
      <div className="space-y-3">
        {matches.map((m) => (
          <div
            key={m._id}
            className="bg-white p-3 rounded shadow flex justify-between items-center"
          >
            <div>
              <b>{m.teamA}</b> vs{" "}
              <b>{m.teamB}</b> | {m.week} |{" "}
              {m.gender.toUpperCase()}
              <div className="text-sm text-gray-500">
                {m.finished
                  ? `Final: ${m.finalA} - ${m.finalB}`
                  : `${m.matchDate} ${m.matchTime}`}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditing(m)}
                className="text-green-600"
              >
                ✏ EDIT
              </button>

              <button
                onClick={() =>
                  removeMatch(m._id)
                }
                className="text-red-600"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-3">
            <h2 className="font-bold text-lg">
              Edit — {editing.teamA} vs{" "}
              {editing.teamB}
            </h2>

            {/* FINISHED */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.finished}
                onChange={(e) =>
                  setEditing((p) =>
                    p
                      ? {
                          ...p,
                          finished:
                            e.target.checked,
                        }
                      : null
                  )
                }
              />
              Finished
            </label>

            {/* FINAL SCORE */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                className="border p-2"
                placeholder="Final A"
                value={editing.finalA}
                onChange={(e) =>
                  setEditing((p) =>
                    p
                      ? {
                          ...p,
                          finalA: Number(
                            e.target.value
                          ),
                        }
                      : null
                  )
                }
              />

              <input
                type="number"
                className="border p-2"
                placeholder="Final B"
                value={editing.finalB}
                onChange={(e) =>
                  setEditing((p) =>
                    p
                      ? {
                          ...p,
                          finalB: Number(
                            e.target.value
                          ),
                        }
                      : null
                  )
                }
              />
            </div>

            {/* SETS */}
            <div className="space-y-2">
              <div className="font-bold text-sm">
                Sets
              </div>

              {editing.sets.map((s, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 gap-2"
                >
                  <input
                    type="number"
                    className="border p-2"
                    placeholder="A"
                    value={s.teamA}
                    onChange={(e) => {
                      const copy = [
                        ...editing.sets,
                      ];
                      copy[i].teamA = Number(
                        e.target.value
                      );
                      setEditing((p) =>
                        p
                          ? {
                              ...p,
                              sets: copy,
                            }
                          : null
                      );
                    }}
                  />

                  <input
                    type="number"
                    className="border p-2"
                    placeholder="B"
                    value={s.teamB}
                    onChange={(e) => {
                      const copy = [
                        ...editing.sets,
                      ];
                      copy[i].teamB = Number(
                        e.target.value
                      );
                      setEditing((p) =>
                        p
                          ? {
                              ...p,
                              sets: copy,
                            }
                          : null
                      );
                    }}
                  />

                  <button
                    className="bg-red-500 text-white rounded"
                    onClick={() => {
                      const copy = [
                        ...editing.sets,
                      ];
                      copy.splice(i, 1);
                      setEditing((p) =>
                        p
                          ? {
                              ...p,
                              sets: copy,
                            }
                          : null
                      );
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                className="bg-gray-800 text-white px-2 py-1 rounded text-xs"
                onClick={() =>
                  setEditing((p) =>
                    p
                      ? {
                          ...p,
                          sets: [
                            ...p.sets,
                            {
                              teamA: 0,
                              teamB: 0,
                            },
                          ],
                        }
                      : null
                  )
                }
              >
                ➕ Add Set
              </button>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() =>
                  setEditing(null)
                }
              >
                Cancel
              </button>

              <button
                className="px-3 py-1 bg-black text-white rounded"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
