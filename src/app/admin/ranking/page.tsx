"use client";

import { useEffect, useState } from "react";

type Gender = "men" | "women";

interface Team {
  _id: string;
  gender: Gender;
  teamName: string;
  teamCode: string;
  logo: string;
  score: number;
}

export default function AdminRanking() {
  const [data, setData] = useState<Team[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<Omit<Team, "_id">>({
    gender: "men",
    teamName: "",
    teamCode: "",
    logo: "",
    score: 0,
  });

  /* ================= LOAD ================= */

  const load = async () => {
    const res = await fetch("/api/ranking");
    const d = await res.json();
    setData(d);
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= UPLOAD ================= */

  const uploadLogo = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) throw new Error("Logo upload failed");
    const data: { url: string } = await res.json();
    return data.url;
  };

  /* ================= ACTIONS ================= */

  const submit = async () => {
    try {
      setUploading(true);

      let logoUrl = form.logo;

      // 🔥 Upload new logo if selected
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const payload = {
        ...form,
        logo: logoUrl,
      };

      if (editingId) {
        await fetch("/api/ranking", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            update: payload,
          }),
        });
        setEditingId(null);
      } else {
        await fetch("/api/ranking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      // Reset
      setForm({
        gender: "men",
        teamName: "",
        teamCode: "",
        logo: "",
        score: 0,
      });
      setLogoFile(null);

      load();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    await fetch("/api/ranking", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const edit = (t: Team) => {
    setEditingId(t._id);
    const { _id, ...rest } = t;
    setForm(rest);
    setLogoFile(null);
  };

  /* ================= RENDER ================= */

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Admin — Ranking (Logo Upload)
      </h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* GENDER */}
          <div>
            <label className="text-xs font-bold text-gray-600">
              Gender
            </label>
            <p className="text-[10px] text-gray-400 mb-1">
              Эрэгтэй эсвэл эмэгтэй ангилал
            </p>
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
              <option value="women">WOMEN</option>
            </select>
          </div>

          {/* TEAM NAME */}
          <div>
            <label className="text-xs font-bold text-gray-600">
              Team Name
            </label>
            <p className="text-[10px] text-gray-400 mb-1">
              Багийн бүтэн нэр (ж: Japan, Mongolia)
            </p>
            <input
              className="border p-2 rounded w-full"
              placeholder="Japan"
              value={form.teamName}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  teamName: e.target.value,
                }))
              }
            />
          </div>

          {/* TEAM CODE */}
          <div>
            <label className="text-xs font-bold text-gray-600">
              Team Code
            </label>
            <p className="text-[10px] text-gray-400 mb-1">
              Товчлол (3 үсэг) — ж: JPN, USA, MGL
            </p>
            <input
              className="border p-2 rounded w-full"
              placeholder="JPN"
              value={form.teamCode}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  teamCode: e.target.value.toUpperCase(),
                }))
              }
            />
          </div>

          {/* SCORE */}
          <div>
            <label className="text-xs font-bold text-gray-600">
              Score
            </label>
            <p className="text-[10px] text-gray-400 mb-1">
              Багийн нийт оноо / байрлалын оноо
            </p>
            <input
              type="number"
              className="border p-2 rounded w-full"
              placeholder="0"
              value={form.score}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  score: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

        {/* LOGO UPLOAD */}
        <div>
          <label className="text-xs font-bold text-gray-600">
            Team Logo
          </label>
          <p className="text-[10px] text-gray-400 mb-1">
            PNG / JPG файл upload хийнэ (Cloudinary руу орно)
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setLogoFile(e.target.files?.[0] || null)
            }
          />

          {form.logo && !logoFile && (
            <div className="mt-2 flex items-center gap-2">
              <img
                src={form.logo}
                alt="logo"
                className="w-8 h-8 object-contain border rounded"
              />
              <span className="text-xs text-gray-500">
                Одоогийн logo
              </span>
            </div>
          )}

          {logoFile && (
            <p className="text-xs text-green-600 mt-1">
              Шинэ logo сонгогдлоо
            </p>
          )}
        </div>

        <button
          disabled={uploading}
          onClick={submit}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploading
            ? "Uploading..."
            : editingId
            ? "✏️ Update Team"
            : "➕ Add Team"}
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {data.map((t) => (
          <div
            key={t._id}
            className="bg-white p-3 rounded flex justify-between items-center shadow"
          >
            <div className="flex items-center gap-2">
              {t.logo && (
                <img
                  src={t.logo}
                  alt={t.teamName}
                  className="w-8 h-8 object-contain"
                />
              )}
              <div>
                <b>{t.teamCode}</b> — {t.teamName} |{" "}
                {t.gender.toUpperCase()} | SCORE:{" "}
                {t.score}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => edit(t)}
                className="text-blue-500 font-bold"
              >
                ✏️
              </button>
              <button
                onClick={() => remove(t._id)}
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
