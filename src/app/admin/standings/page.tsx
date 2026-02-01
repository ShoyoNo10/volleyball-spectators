"use client";

import { useEffect, useState } from "react";

type Gender = "men" | "women";

interface Standing {
  _id: string;
  gender: Gender;
  teamName: string;
  teamCode: string;
  logo: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  setText: string;
}

export default function AdminStandings() {
  const [data, setData] = useState<Standing[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm: Omit<Standing, "_id"> = {
    gender: "men",
    teamName: "",
    teamCode: "",
    logo: "",
    played: 0,
    won: 0,
    lost: 0,
    points: 0,
    setText: "0-0",
  };

  const [form, setForm] =
    useState<Omit<Standing, "_id">>(emptyForm);

  /* LOAD */
  const load = async () => {
    const res = await fetch("/api/standings");
    const d = await res.json();
    setData(d);
  };

  useEffect(() => {
    load();
  }, []);

  /* UPLOAD LOGO */
  const uploadLogo = async (): Promise<string> => {
    if (!logoFile) return form.logo;

    const fd = new FormData();
    fd.append("file", logoFile);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    return data.url;
  };

  /* ADD / UPDATE */
  const save = async () => {
    const logoUrl = await uploadLogo();

    if (editingId) {
      await fetch("/api/standings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          update: {
            ...form,
            logo: logoUrl,
          },
        }),
      });
    } else {
      await fetch("/api/standings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          logo: logoUrl,
        }),
      });
    }

    setForm(emptyForm);
    setLogoFile(null);
    setEditingId(null);
    load();
  };

  /* DELETE */
  const remove = async (id: string) => {
    await fetch("/api/standings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  /* EDIT */
  const edit = (t: Standing) => {
    setEditingId(t._id);
    setForm({
      gender: t.gender,
      teamName: t.teamName,
      teamCode: t.teamCode,
      logo: t.logo,
      played: t.played,
      won: t.won,
      lost: t.lost,
      points: t.points,
      setText: t.setText,
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Admin — Standings
      </h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-bold mb-3 text-lg">
          {editingId
            ? "✏️ Edit Team"
            : "➕ Add Team"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              <option value="women">WOMEN</option>
            </select>
          </div>

          {/* TEAM NAME */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Team Name
            </label>
            <input
              className="border p-2 rounded w-full"
              placeholder="Argentina"
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
            <label className="block text-sm font-bold mb-1">
              Team Code
            </label>
            <input
              className="border p-2 rounded w-full"
              placeholder="ARG"
              value={form.teamCode}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  teamCode: e.target.value,
                }))
              }
            />
          </div>

          {/* LOGO */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Team Logo (Upload)
            </label>
            <input
              type="file"
              accept="image/*"
              className="border p-2 rounded w-full"
              onChange={(e) =>
                setLogoFile(
                  e.target.files?.[0] || null,
                )
              }
            />

            {form.logo && (
              <img
                src={form.logo}
                className="mt-2 w-12 h-12 object-contain border rounded"
              />
            )}
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

          {/* WON */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Won (W)
            </label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={form.won}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  won: Number(e.target.value),
                }))
              }
            />
          </div>

          {/* LOST */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Lost (L)
            </label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={form.lost}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  lost: Number(e.target.value),
                }))
              }
            />
          </div>

          {/* POINTS */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Points (PTS)
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

          {/* SET */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-1">
              Set Ratio (Manual)
            </label>
            <input
              className="border p-2 rounded w-full"
              placeholder="3-1 / +2 / 5-3"
              value={form.setText}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  setText: e.target.value,
                }))
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Энэ талбарыг гараар бөглөнө
            </p>
          </div>
        </div>

        <button
          onClick={save}
          className="mt-4 bg-black text-white px-6 py-2 rounded"
        >
          {editingId
            ? "💾 Update Team"
            : "➕ Add Team"}
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {data.map((t) => (
          <div
            key={t._id}
            className="bg-white p-3 rounded flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              {t.logo && (
                <img
                  src={t.logo}
                  className="w-8 h-8 object-contain"
                />
              )}
              <div>
                <b>{t.teamCode}</b> — {t.teamName} | P:
                {t.played} | W:{t.won} | L:
                {t.lost} | SET:{t.setText} | PTS:
                {t.points}
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
