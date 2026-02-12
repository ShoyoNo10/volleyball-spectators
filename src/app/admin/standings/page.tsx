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
  const [saving, setSaving] = useState(false);

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

  const [form, setForm] = useState<Omit<Standing, "_id">>(emptyForm);

  /* LOAD */
  const load = async () => {
    const res = await fetch("/api/standings");
    const d = await res.json();
    setData(Array.isArray(d) ? d : []);
  };

  useEffect(() => {
    load();
  }, []);

  /* UPLOAD LOGO */
  const uploadLogo = async (): Promise<string> => {
    if (!logoFile) return form.logo;

    const fd = new FormData();
    fd.append("file", logoFile);

    const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
    const data: unknown = await res.json();
    const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;

    const url =
      (obj?.url as string | undefined) ??
      (obj?.secure_url as string | undefined) ??
      (obj?.secureUrl as string | undefined);

    return url || "";
  };

  /* ADD / UPDATE */
  const save = async () => {
    try {
      setSaving(true);

      const logoUrl = await uploadLogo();

      const payload = {
        ...form,
        teamName: form.teamName.trim(),
        teamCode: form.teamCode.trim().toUpperCase(),
        setText: form.setText.trim(),
        logo: logoUrl || form.logo,
        played: Number(form.played),
        won: Number(form.won),
        lost: Number(form.lost),
        points: Number(form.points),
      };

      if (!payload.teamName || !payload.teamCode) {
        alert("Багийн нэр / код хоосон байна");
        return;
      }

      if (editingId) {
        await fetch("/api/standings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, update: payload }),
        });
      } else {
        await fetch("/api/standings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setForm(emptyForm);
      setLogoFile(null);
      setEditingId(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  /* DELETE */
  const remove = async (id: string) => {
    if (!confirm("Устгах уу?")) return;
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
    setLogoFile(null);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setLogoFile(null);
  };

  /* UI helpers */
  const card = "bg-white rounded-2xl shadow-sm border border-black/10";
  const label = "block text-xs font-extrabold text-gray-700 mb-1";
  const input =
    "w-full border border-black/20 bg-white text-black placeholder:text-gray-500 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-black/20";
  const btn =
    "px-4 py-2 rounded-xl font-extrabold transition disabled:opacity-50";
  const btnPrimary = `${btn} bg-black text-white hover:opacity-90`;
  const btnSoft = `${btn} bg-gray-100 text-black border border-black/10 hover:bg-gray-200`;
  const btnDanger = `${btn} bg-red-600 text-white hover:opacity-90`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-black">Админ — Standings</h1>
          <div className="text-sm text-gray-600">
            Баг нэмэх / засах / устгах. Logo upload ажиллана.
          </div>
        </div>

        {/* FORM */}
        <div className={`${card} p-5 space-y-4`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-extrabold text-black">
                {editingId ? "✏️ Баг засах" : "➕ Баг нэмэх"}
              </div>
              <div className="text-sm text-gray-600">
                Талбаруудыг бөглөөд хадгална.
              </div>
            </div>

            <button onClick={reset} className={btnSoft}>
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Gender */}
            <div>
              <label className={label}>Төрөл</label>
              <select
                className={input}
                value={form.gender}
                onChange={(e) =>
                  setForm((p) => ({ ...p, gender: e.target.value as Gender }))
                }
              >
                <option value="men">ЭРЭГТЭЙ</option>
                <option value="women">ЭМЭГТЭЙ</option>
              </select>
            </div>

            {/* Team name */}
            <div>
              <label className={label}>Багийн нэр</label>
              <input
                className={input}
                placeholder="Argentina"
                value={form.teamName}
                onChange={(e) => setForm((p) => ({ ...p, teamName: e.target.value }))}
              />
            </div>

            {/* Team code */}
            <div>
              <label className={label}>Багийн код</label>
              <input
                className={input}
                placeholder="ARG"
                value={form.teamCode}
                onChange={(e) => setForm((p) => ({ ...p, teamCode: e.target.value }))}
              />
            </div>

            {/* Logo uploader + preview */}
            <div className="md:col-span-3">
              <label className={label}>Logo (Upload)</label>

              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full md:max-w-md text-sm"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-black/10 bg-gray-50 overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoFile ? URL.createObjectURL(logoFile) : form.logo || "/user.png"}
                      alt="logo"
                      className="w-12 h-12 object-contain"
                    />
                  </div>

                  <div className="text-xs text-gray-600">
                    {logoFile ? "Шинэ зураг сонгосон" : form.logo ? "Одоо байгаа logo" : "Logo байхгүй"}
                  </div>
                </div>
              </div>
            </div>

            {/* numbers */}
            <div>
              <label className={label}>Тоглосон (P)</label>
              <input
                type="number"
                className={input}
                value={form.played}
                onChange={(e) => setForm((p) => ({ ...p, played: Number(e.target.value) }))}
              />
            </div>

            <div>
              <label className={label}>Хожсон (W)</label>
              <input
                type="number"
                className={input}
                value={form.won}
                onChange={(e) => setForm((p) => ({ ...p, won: Number(e.target.value) }))}
              />
            </div>

            <div>
              <label className={label}>Хожигдсон (L)</label>
              <input
                type="number"
                className={input}
                value={form.lost}
                onChange={(e) => setForm((p) => ({ ...p, lost: Number(e.target.value) }))}
              />
            </div>

            <div>
              <label className={label}>Оноо</label>
              <input
                type="number"
                className={input}
                value={form.points}
                onChange={(e) => setForm((p) => ({ ...p, points: Number(e.target.value) }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className={label}>Сет (гараар)</label>
              <input
                className={input}
                placeholder="Ж: 3-1 / 5-3 / +2"
                value={form.setText}
                onChange={(e) => setForm((p) => ({ ...p, setText: e.target.value }))}
              />
              <div className="text-xs text-gray-600 mt-1">
                Жишээ: “3-1” эсвэл “5-3” гэх мэтээр бөглөнө.
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <button onClick={save} disabled={saving} className={btnPrimary}>
              {saving ? "Хадгалж байна..." : editingId ? "💾 Update" : "➕ Add"}
            </button>
            {editingId && (
              <button onClick={reset} className={btnSoft}>
                Cancel edit
              </button>
            )}
          </div>
        </div>

        {/* LIST */}
        <div className={`${card} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
            <div className="text-lg font-extrabold text-black">Жагсаалт</div>
            <div className="text-sm text-gray-600">{data.length} баг</div>
          </div>

          {/* table header */}
          <div className="grid grid-cols-[.7fr_2fr_1fr_1fr_1fr_1fr_1.4fr] gap-2 px-4 py-2 bg-gray-50 text-xs font-extrabold text-gray-700 border-b border-black/10">
            <span>LOGO</span>
            <span>БАГ</span>
            <span>P</span>
            <span>W</span>
            <span>L</span>
            <span>ОНОО</span>
            <span className="text-right">ACTIONS</span>
          </div>

          {data.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-600">Мэдээлэл алга</div>
          ) : (
            data.map((t) => (
              <div
                key={t._id}
                className="grid grid-cols-[.7fr_2fr_1fr_1fr_1fr_1fr_1.4fr] gap-2 px-4 py-2 items-center border-b border-black/5 hover:bg-gray-50/60 transition"
              >
                <div className="w-10 h-10 rounded-xl border border-black/10 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.logo || "/user.png"}
                    alt={t.teamCode}
                    className="w-10 h-10 object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <div className="font-extrabold text-black truncate">
                    {t.teamCode} — {t.teamName}
                  </div>
                  <div className="text-xs text-gray-600">
                    {t.gender === "women" ? "ЭМЭГТЭЙ" : "ЭРЭГТЭЙ"} • SET: {t.setText}
                  </div>
                </div>

                <div className="font-bold text-black">{t.played}</div>
                <div className="font-bold text-black">{t.won}</div>
                <div className="font-bold text-black">{t.lost}</div>
                <div className="font-extrabold text-black">{t.points}</div>

                <div className="flex justify-end gap-2">
                  <button onClick={() => edit(t)} className={btnSoft}>
                    ✏️
                  </button>
                  <button onClick={() => remove(t._id)} className={btnDanger}>
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
