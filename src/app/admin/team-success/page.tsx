"use client";

import { useEffect, useState } from "react";

/* ================= TYPES ================= */

interface Team {
  _id: string;
  name: string;
}

interface BestResult {
  title: string;
  year: number;
}

interface TeamSuccess {
  _id: string;
  teamId: string;
  competitions: string[];
  appearances: number;
  firstYear: number;
  bestResults: BestResult[];
}

/* ================= PAGE ================= */

export default function AdminTeamSuccess() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [list, setList] = useState<TeamSuccess[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<TeamSuccess, "_id">>({
    teamId: "",
    competitions: [],
    appearances: 0,
    firstYear: 0,
    bestResults: [],
  });

  const [bestTitle, setBestTitle] = useState("");
  const [bestYear, setBestYear] = useState<number>(2024);

  /* LOAD TEAMS */
  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((d: Team[]) => setTeams(d));
  }, []);

  /* LOAD SUCCESS LIST */
  useEffect(() => {
    if (!form.teamId) return;

    fetch(`/api/team-success?teamId=${form.teamId}`)
      .then((r) => r.json())
      .then((d: TeamSuccess[]) => setList(d));
  }, [form.teamId]);

  /* ADD BEST RESULT */
  const addBest = () => {
    if (!bestTitle) return;

    setForm((p) => ({
      ...p,
      bestResults: [
        ...p.bestResults,
        { title: bestTitle, year: bestYear },
      ],
    }));

    setBestTitle("");
    setBestYear(2024);
  };

  /* SAVE */
  const save = async () => {
    if (!form.teamId) return alert("Select team");

    const method = editingId ? "PATCH" : "POST";
    const payload = editingId
      ? { id: editingId, ...form }
      : form;

    await fetch("/api/team-success", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    setForm({
      teamId: form.teamId,
      competitions: [],
      appearances: 0,
      firstYear: 0,
      bestResults: [],
    });

    const res = await fetch(
      `/api/team-success?teamId=${form.teamId}`
    );
    const d = await res.json();
    setList(d);
  };

  /* DELETE */
  const remove = async (id: string) => {
    await fetch("/api/team-success", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setList((p) => p.filter((s) => s._id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        Admin — Team Success
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
        placeholder="Competitions (VNL, Asian Cup)"
        value={form.competitions.join(", ")}
        onChange={(e) =>
          setForm((p) => ({
            ...p,
            competitions: e.target.value
              .split(",")
              .map((s) => s.trim()),
          }))
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          className="border p-2"
          placeholder="Appearances"
          value={form.appearances}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              appearances: Number(e.target.value),
            }))
          }
        />

        <input
          type="number"
          className="border p-2"
          placeholder="First Year"
          value={form.firstYear}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              firstYear: Number(e.target.value),
            }))
          }
        />
      </div>

      {/* BEST RESULT */}
      <div className="flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="Best Result (Gold Medal)"
          value={bestTitle}
          onChange={(e) => setBestTitle(e.target.value)}
        />
        <input
          type="number"
          className="border p-2 w-24"
          value={bestYear}
          onChange={(e) =>
            setBestYear(Number(e.target.value))
          }
        />
        <button
          onClick={addBest}
          className="bg-black text-white px-3 rounded"
        >
          ➕
        </button>
      </div>

      <div className="text-sm text-gray-600">
        {form.bestResults.map((r, i) => (
          <div key={i}>
            🏆 {r.title} — {r.year}
          </div>
        ))}
      </div>

      <button
        onClick={save}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {editingId ? "Update Success" : "Add Success"}
      </button>

      {/* LIST */}
      <div className="space-y-2">
        {list.map((s) => (
          <div
            key={s._id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>
              <b>{s.competitions.join(", ")}</b>{" "}
              — {s.firstYear}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(s._id);
                  setForm({
                    teamId: s.teamId,
                    competitions: s.competitions,
                    appearances: s.appearances,
                    firstYear: s.firstYear,
                    bestResults: s.bestResults,
                  });
                }}
                className="text-blue-500 font-bold"
              >
                ✏️
              </button>

              <button
                onClick={() => remove(s._id)}
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
