"use client";

import { useEffect, useMemo, useState } from "react";

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
  teamId?: string;
  number: number;
  name: string;
  position: string;
  nationality?: string;
  birthDate?: string;
  height?: number;
  avatarUrl?: string;
  stats?: PlayerStats;
}

/* ================= HELPERS ================= */

function emptyStats(): PlayerStats {
  return {
    totalPoints: 0,
    avgByMatch: 0,
    attackPoints: 0,
    attackEfficiency: 0,
    blockPoints: 0,
    blockSuccess: 0,
    servePoints: 0,
  };
}

function toForm(p?: Player): PlayerForm {
  return {
    teamId: p?.teamId || "",
    number: p?.number ?? 0,
    name: p?.name || "",
    position: p?.position || "",
    nationality: p?.nationality || "",
    birthDate: p?.birthDate || "",
    height: p?.height ?? 0,
    avatarUrl: p?.avatarUrl || "",
    stats: p?.stats ? { ...emptyStats(), ...p.stats } : emptyStats(),
  };
}

type UploadRes =
  | { url: string }
  | { secure_url: string }
  | { secureUrl: string };

function pickUploadUrl(data: unknown): string {
  if (!data || typeof data !== "object")
    throw new Error("Upload response invalid");

  const obj = data as UploadRes;

  let url: string | undefined;
  if ("url" in obj && typeof obj.url === "string") url = obj.url;
  else if ("secure_url" in obj && typeof obj.secure_url === "string")
    url = obj.secure_url;
  else if ("secureUrl" in obj && typeof obj.secureUrl === "string")
    url = obj.secureUrl;

  if (!url) throw new Error("Upload response missing url");
  return url;
}

/* ================= COMPONENT ================= */

export default function AdminPlayers() {
  const STATS_MN: Record<keyof PlayerStats, string> = {
    totalPoints: "Нийт оноо",
    avgByMatch: "X",
    attackPoints: "Довтолгооны оноо",
    attackEfficiency: "X",
    blockPoints: "Хаалтын оноо",
    blockSuccess: "X",
    servePoints: "Давуулалтын оноо",
  };
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlayerForm>(toForm());

  /* ================= LOAD TEAMS ================= */

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((d) => setTeams(Array.isArray(d) ? d : []));
  }, []);

  /* ================= LOAD PLAYERS ================= */

  const loadPlayers = async (teamId: string) => {
    const res = await fetch(
      `/api/players?teamId=${encodeURIComponent(teamId)}`,
    );
    const data = await res.json();
    setPlayers(Array.isArray(data) ? data : []);
  };

  /* ================= UPLOAD ================= */

  const uploadAvatar = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Avatar upload failed");

    const data: unknown = await res.json();
    return pickUploadUrl(data);
  };

  /* ================= ACTIONS ================= */

  const reset = () => {
    setEditingId(null);
    setAvatarFile(null);
    setForm((prev) => ({ ...toForm(), teamId: prev.teamId })); // баг сонгосныг хадгална
  };

  const submit = async () => {
    if (!form.teamId) return alert("Эхлээд Team сонгоно уу");
    if (!form.name.trim()) return alert("Player name хоосон байна");
    if (!form.position.trim()) return alert("Position хоосон байна");

    try {
      setUploading(true);

      let avatarUrl = form.avatarUrl;
      if (avatarFile) avatarUrl = await uploadAvatar(avatarFile);

      const stats: PlayerStats = {
        totalPoints: Number(form.stats.totalPoints || 0),
        avgByMatch: Number(form.stats.avgByMatch || 0),
        attackPoints: Number(form.stats.attackPoints || 0),
        attackEfficiency: Number(form.stats.attackEfficiency || 0),
        blockPoints: Number(form.stats.blockPoints || 0),
        blockSuccess: Number(form.stats.blockSuccess || 0),
        servePoints: Number(form.stats.servePoints || 0),
      };

      const payload = {
        ...form,
        number: Number(form.number),
        height: Number(form.height || 0),
        avatarUrl,
        stats,
      };

      if (editingId) {
        // ✅ PUT update
        await fetch("/api/players", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setAvatarFile(null);
      reset();
      loadPlayers(form.teamId);
    } catch (e) {
      console.error(e);
      alert("Save хийхэд алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (p: Player) => {
    setEditingId(p._id);
    setAvatarFile(null);
    setForm(toForm({ ...p, teamId: form.teamId || p.teamId })); // teamId-г хадгална
  };

  const remove = async (id: string) => {
    if (!confirm("Устгах уу?")) return;

    await fetch("/api/players", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadPlayers(form.teamId);
  };

  /* ================= UI HELPERS ================= */

  const statKeys = useMemo(
    () => Object.keys(form.stats) as (keyof PlayerStats)[],
    [form.stats],
  );

  const card = "bg-white rounded-2xl shadow-sm border border-black/10";
  const label = "block text-sm font-bold text-black mb-1";
  const hint = "text-xs text-gray-600";
  const input =
    "w-full border border-black/20 bg-white text-black placeholder:text-gray-500 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-black/20";

  const btn = "px-4 py-2 rounded-xl font-bold transition disabled:opacity-50";
  const btnPrimary = `${btn} bg-black text-white hover:opacity-90`;
  const btnSoft = `${btn} bg-gray-100 text-black border border-black/10 hover:bg-gray-200`;
  const btnDanger = `${btn} bg-red-600 text-white hover:opacity-90`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-6xl mx-auto space-y-5">
        <div>
          <h1 className="text-3xl font-extrabold text-black">
            Admin — Players
          </h1>
          <div className="text-sm text-gray-600">
            Team сонго → Player нэм/зас → Stats бөглөнө
          </div>
        </div>

        {/* TEAM SELECT */}
        <div className={`${card} p-4`}>
          <label className={label}>Team сонгох</label>
          <select
            className={input}
            value={form.teamId}
            onChange={(e) => {
              const id = e.target.value;
              setForm((prev) => ({ ...prev, teamId: id }));
              if (id) loadPlayers(id);
              reset();
            }}
          >
            <option value="">Select Team</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className={hint}>
            Team сонгосны дараа доор тоглогчдын list гарна.
          </div>
        </div>

        {/* FORM */}
        <div className={`${card} p-4 space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="text-lg font-extrabold text-black">
              {editingId ? "✏️ Засах" : "➕ Нэмэх"}
            </div>
            <div className="flex gap-2">
              {editingId && (
                <button onClick={reset} className={btnSoft}>
                  Cancel
                </button>
              )}
              <button
                onClick={submit}
                disabled={uploading}
                className={btnPrimary}
              >
                {uploading ? "Saving..." : editingId ? "Save" : "Add Player"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className={label}>Number</label>
              <input
                type="number"
                className={input}
                value={form.number}
                onChange={(e) =>
                  setForm((p) => ({ ...p, number: Number(e.target.value) }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className={label}>Name</label>
              <input
                className={input}
                placeholder="Yuki Ishikawa"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div>
              <label className={label}>Position</label>
              <input
                className={input}
                placeholder="OH / MB / S / L / O"
                value={form.position}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    position: e.target.value.toUpperCase(),
                  }))
                }
              />
              <div className={hint}>
                OH=Outside, MB=Middle, S=Setter, L=Libero
              </div>
            </div>

            <div>
              <label className={label}>Nationality</label>
              <input
                className={input}
                placeholder="JPN"
                value={form.nationality}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nationality: e.target.value }))
                }
              />
            </div>

            <div>
              <label className={label}>Birth Date</label>
              <input
                className={input}
                placeholder="YYYY-MM-DD"
                value={form.birthDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, birthDate: e.target.value }))
                }
              />
            </div>

            <div>
              <label className={label}>Height (cm)</label>
              <input
                type="number"
                className={input}
                value={form.height}
                onChange={(e) =>
                  setForm((p) => ({ ...p, height: Number(e.target.value) }))
                }
              />
            </div>

            {/* AVATAR */}
            <div className="md:col-span-4">
              <label className={label}>Avatar</label>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.avatarUrl || "/user.png"}
                  alt="avatar"
                  className="w-14 h-14 rounded-2xl object-cover border border-black/10 bg-white"
                />
                <div className="flex-1 space-y-2">
                  <input
                    className={input}
                    placeholder="Avatar URL (эсвэл upload)"
                    value={form.avatarUrl}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, avatarUrl: e.target.value }))
                    }
                  />
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-black"
                  />
                  <div className={hint}>
                    Зураг сонговол upload хийгээд avatarUrl автоматаар
                    шинэчлэгдэнэ.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="pt-2">
            <div className="text-lg font-extrabold text-black mb-1">Stats</div>
            <div className={hint}>
              Бүх утга тоо байх ёстой. Хоосон бол 0 гэж үзнэ.
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {(Object.keys(form.stats) as (keyof PlayerStats)[]).map((k) => (
                <div key={k} className="space-y-1">
                  <div className="text-xs font-bold text-gray-600">
                    {STATS_MN[k]}
                  </div>

                  <input
                    type="number"
                    className="border p-2 rounded w-full"
                    value={form.stats[k]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setForm((p) => ({
                        ...p,
                        stats: { ...p.stats, [k]: isNaN(val) ? 0 : val },
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className={`${card} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-extrabold text-black">
              Players list
            </div>
            <div className={hint}>{players.length} хүн</div>
          </div>

          {!form.teamId ? (
            <div className="text-gray-600">Эхлээд team сонгоно уу.</div>
          ) : players.length === 0 ? (
            <div className="text-gray-600">Энэ баг дээр тоглогч алга.</div>
          ) : (
            <div className="space-y-2">
              {players.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between bg-gray-50 border border-black/10 rounded-xl p-3"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-black truncate">
                      #{p.number} {p.name}
                    </div>
                    <div className="text-sm text-gray-700">
                      {p.position} {p.nationality ? `• ${p.nationality}` : ""}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => startEdit(p)} className={btnSoft}>
                      Edit
                    </button>
                    <button onClick={() => remove(p._id)} className={btnDanger}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}
