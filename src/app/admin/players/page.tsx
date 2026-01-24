"use client";

import { useEffect, useState } from "react";

/* ================= TYPES ================= */

interface Team {
  _id: string;
  name: string;
}

interface PlayerStats {
  totalPoints: number;
  avgByMatch: number;
  attackPoints: number;
  attackEfficiency: number;
  blockPoints: number;
  blockSuccess: number;
  servePoints: number;
}

interface PlayerForm {
  teamId: string;
  number: number;
  name: string;
  position: string;
  nationality: string;
  birthDate: string;
  height: number;
  avatarUrl: string;
  stats: PlayerStats;
}

interface Player {
  _id: string;
  number: number;
  name: string;
  position: string;
}

/* ================= COMPONENT ================= */

export default function AdminPlayers() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<PlayerForm>({
    teamId: "",
    number: 0,
    name: "",
    position: "",
    nationality: "",
    birthDate: "",
    height: 0,
    avatarUrl: "",
    stats: {
      totalPoints: 0,
      avgByMatch: 0,
      attackPoints: 0,
      attackEfficiency: 0,
      blockPoints: 0,
      blockSuccess: 0,
      servePoints: 0,
    },
  });

  /* ================= LOAD TEAMS ================= */

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then(setTeams);
  }, []);

  /* ================= LOAD PLAYERS ================= */

  const loadPlayers = async (teamId: string) => {
    const res = await fetch(
      `/api/players?teamId=${encodeURIComponent(teamId)}`
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      setPlayers(data);
    } else {
      setPlayers([]);
    }
  };

  /* ================= UPLOAD ================= */

  const uploadAvatar = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: fd,
    });

    const data: { url: string } = await res.json();
    return data.url;
  };

  /* ================= ACTIONS ================= */

  const addPlayer = async () => {
    if (!form.teamId) {
      alert("Team сонгоно уу");
      return;
    }

    try {
      setUploading(true);

      let avatarUrl = form.avatarUrl;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          avatarUrl,
        }),
      });

      setForm((prev) => ({
        ...prev,
        number: 0,
        name: "",
        position: "",
        nationality: "",
        birthDate: "",
        height: 0,
        avatarUrl: "",
      }));

      setAvatarFile(null);
      loadPlayers(form.teamId);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    await fetch("/api/players", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadPlayers(form.teamId);
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Admin — Players + Stats
      </h1>

      {/* TEAM SELECT */}
      <select
        className="border p-2 mb-4 rounded"
        value={form.teamId}
        onChange={(e) => {
          const id = e.target.value;
          setForm((prev) => ({ ...prev, teamId: id }));
          if (id) loadPlayers(id);
        }}
      >
        <option value="">Select Team</option>
        {teams.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <input
          placeholder="Number"
          type="number"
          className="border p-2 rounded"
          value={form.number}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              number: Number(e.target.value),
            }))
          }
        />

        <input
          placeholder="Name"
          className="border p-2 rounded"
          value={form.name}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              name: e.target.value,
            }))
          }
        />

        <input
          placeholder="Position (OH, MB, S, L, O)"
          className="border p-2 rounded"
          value={form.position}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              position: e.target.value,
            }))
          }
        />

        <input
          placeholder="Nationality"
          className="border p-2 rounded"
          value={form.nationality}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              nationality: e.target.value,
            }))
          }
        />

        <input
          placeholder="Birth Date (YYYY-MM-DD)"
          className="border p-2 rounded"
          value={form.birthDate}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              birthDate: e.target.value,
            }))
          }
        />

        <input
          placeholder="Height (cm)"
          type="number"
          className="border p-2 rounded"
          value={form.height}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              height: Number(e.target.value),
            }))
          }
        />

        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded"
          onChange={(e) =>
            setAvatarFile(e.target.files?.[0] || null)
          }
        />
      </div>

      {/* STATS */}
      <h2 className="font-bold mb-2">
        Stats
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        {(
          Object.keys(
            form.stats
          ) as (keyof PlayerStats)[]
        ).map((k) => (
          <input
            key={k}
            type="number"
            placeholder={k}
            className="border p-2 rounded"
            value={form.stats[k]}
            onChange={(e) => {
              const val = Number(e.target.value);
              setForm((p) => ({
                ...p,
                stats: {
                  ...p.stats,
                  [k]: isNaN(val) ? 0 : val,
                },
              }));
            }}
          />
        ))}
      </div>

      <button
        disabled={uploading}
        onClick={addPlayer}
        className="bg-vnl text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "➕ Add Player"}
      </button>

      {/* LIST */}
      <div className="mt-6">
        {players.map((p) => (
          <div
            key={p._id}
            className="flex justify-between bg-white p-2 mb-1 rounded shadow"
          >
            <div>
              #{p.number} {p.name} — {p.position}
            </div>
            <button
              onClick={() => remove(p._id)}
              className="text-red-500 font-bold"
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
