"use client";

import { useEffect, useState } from "react";

/* ================= TYPES ================= */

interface Team {
  _id: string;
  name: string;
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

export default function AdminTeamSchedule() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [list, setList] = useState<TeamSchedule[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<TeamSchedule, "_id">>({
    teamId: "",
    opponent: "",
    opponentLogo: "",
    matchDate: "",
    matchTime: "",
  });

  /* LOAD TEAMS */
  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((d: Team[]) => setTeams(d));
  }, []);

  /* LOAD SCHEDULE */
  useEffect(() => {
    if (!form.teamId) return;

    fetch(`/api/team-schedule?teamId=${form.teamId}`)
      .then((r) => r.json())
      .then((d: TeamSchedule[]) => setList(d));
  }, [form.teamId]);

  /* UPLOAD LOGO */
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

  /* SAVE */
  const save = async () => {
    if (!form.teamId) return alert("Select team");

    const method = editingId ? "PATCH" : "POST";
    const payload = editingId
      ? { id: editingId, ...form }
      : form;

    await fetch("/api/team-schedule", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    setForm((p) => ({
      ...p,
      opponent: "",
      opponentLogo: "",
      matchDate: "",
      matchTime: "",
    }));

    const res = await fetch(
      `/api/team-schedule?teamId=${form.teamId}`
    );
    const d = await res.json();
    setList(d);
  };

  /* DELETE */
  const remove = async (id: string) => {
    await fetch("/api/team-schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setList((p) => p.filter((m) => m._id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        Admin — Team Schedule
      </h1>

      {/* TEAM SELECT */}
      <select
        className="border p-2 w-full"
        value={form.teamId}
        onChange={(e) =>
          setForm((p) => ({
            ...p,
            teamId: e.target.value,
          }))
        }
      >
        <option value="">Select Team</option>
        {teams.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* FORM */}
      <input
        className="border p-2 w-full"
        placeholder="Opponent"
        value={form.opponent}
        onChange={(e) =>
          setForm((p) => ({
            ...p,
            opponent: e.target.value,
          }))
        }
      />

      <input
        type="file"
        className="border p-2 w-full"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = await uploadLogo(file);
          setForm((p) => ({
            ...p,
            opponentLogo: url,
          }));
        }}
      />

      <input
        type="date"
        className="border p-2 w-full"
        value={form.matchDate}
        onChange={(e) =>
          setForm((p) => ({
            ...p,
            matchDate: e.target.value,
          }))
        }
      />

      <input
        type="time"
        className="border p-2 w-full"
        value={form.matchTime}
        onChange={(e) =>
          setForm((p) => ({
            ...p,
            matchTime: e.target.value,
          }))
        }
      />

      <button
        onClick={save}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {editingId ? "Update Match" : "Add Match"}
      </button>

      {/* LIST */}
      <div className="space-y-2">
        {list.map((m) => (
          <div
            key={m._id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>
              <b>{m.opponent}</b> — {m.matchDate}{" "}
              {m.matchTime}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(m._id);
                  setForm(m);
                }}
                className="text-blue-500 font-bold"
              >
                ✏️
              </button>

              <button
                onClick={() => remove(m._id)}
                className="text-red-500 font-bold"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
