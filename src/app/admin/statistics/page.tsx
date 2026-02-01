"use client";

import { useEffect, useState } from "react";

type Gender = "men" | "women";

interface Stat {
  _id: string;
  gender: Gender;
  playerName: string;
  teamCode: string;
  played: number;
  points: number;
  attackPts: number;
  blockPts: number;
  servePts: number;
}

export default function AdminStatistics() {
  const emptyForm: Omit<Stat, "_id"> = {
    gender: "men",
    playerName: "",
    teamCode: "",
    played: 0,
    points: 0,
    attackPts: 0,
    blockPts: 0,
    servePts: 0,
  };

  const [data, setData] = useState<Stat[]>([]);
  const [form, setForm] =
    useState<Omit<Stat, "_id">>(emptyForm);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/statistics");
    const d = await res.json();
    setData(d);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (editingId) {
      await fetch("/api/statistics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          update: form,
        }),
      });
    } else {
      await fetch("/api/statistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const remove = async (id: string) => {
    await fetch("/api/statistics", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const edit = (s: Stat) => {
    setEditingId(s._id);
    setForm({
      gender: s.gender,
      playerName: s.playerName,
      teamCode: s.teamCode,
      played: s.played,
      points: s.points,
      attackPts: s.attackPts,
      blockPts: s.blockPts,
      servePts: s.servePts,
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Admin — Player Statistics
      </h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-bold mb-3 text-lg">
          {editingId
            ? "✏️ Edit Player"
            : "➕ Add Player"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* GENDER */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Gender
            </label>
            <select
              className="border p-2 rounded w-full"
              value={form.gender}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  gender: e.target.value as Gender,
                }))
              }
            >
              <option value="men">MEN</option>
              <option value="women">
                WOMEN
              </option>
            </select>
          </div>

          {/* PLAYER */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Player Name
            </label>
            <input
              className="border p-2 rounded w-full"
              placeholder="Yuki Ishikawa"
              value={form.playerName}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  playerName: e.target.value,
                }))
              }
            />
          </div>

          {/* TEAM */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Team Code
            </label>
            <input
              className="border p-2 rounded w-full"
              placeholder="JPN"
              value={form.teamCode}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  teamCode: e.target.value,
                }))
              }
            />
          </div>

          {/* PLAYED */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Played (P)
            </label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={form.played}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  played: Number(e.target.value),
                }))
              }
            />
          </div>

          {/* PTS */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Total PTS
            </label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={form.points}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  points: Number(e.target.value),
                }))
              }
            />
          </div>

          {/* ATTACK */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Attack PTS
            </label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={form.attackPts}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  attackPts: Number(e.target.value),
                }))
              }
            />
          </div>

          {/* BLOCK */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Block PTS
            </label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={form.blockPts}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  blockPts: Number(e.target.value),
                }))
              }
            />
          </div>

          {/* SERVE */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Serve PTS
            </label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={form.servePts}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  servePts: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

        <button
          onClick={save}
          className="mt-4 bg-black text-white px-6 py-2 rounded"
        >
          {editingId
            ? "💾 Update Player"
            : "➕ Add Player"}
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {data.map((p) => (
          <div
            key={p._id}
            className="bg-white p-3 rounded flex justify-between items-center"
          >
            <div>
              <b>{p.playerName}</b> —{" "}
              {p.teamCode} | PTS:{p.points} |
              A:{p.attackPts} | B:
              {p.blockPts} | S:
              {p.servePts}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => edit(p)}
                className="text-blue-500 font-bold"
              >
                ✏️
              </button>

              <button
                onClick={() => remove(p._id)}
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
