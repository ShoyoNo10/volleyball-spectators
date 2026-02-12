"use client";

import { useEffect, useMemo, useState } from "react";

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
    setData(Array.isArray(d) ? d : []);
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= UPLOAD ================= */

  const uploadLogo = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Logo upload failed");

    const data: unknown = await res.json();
    const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;

    const url =
      (obj?.url as string | undefined) ??
      (obj?.secure_url as string | undefined) ??
      (obj?.secureUrl as string | undefined);

    return url || "";
  };

  /* ================= ACTIONS ================= */

  const reset = () => {
    setEditingId(null);
    setLogoFile(null);
    setForm({
      gender: "men",
      teamName: "",
      teamCode: "",
      logo: "",
      score: 0,
    });
  };

  const submit = async () => {
    try {
      setUploading(true);

      let logoUrl = form.logo;

      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const payload = {
        ...form,
        teamName: form.teamName.trim(),
        teamCode: form.teamCode.trim().toUpperCase(),
        score: Number(form.score),
        logo: logoUrl,
      };

      if (!payload.teamName || !payload.teamCode) {
        alert("Багийн нэр / код хоосон байна");
        return;
      }

      if (editingId) {
        await fetch("/api/ranking", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, update: payload }),
        });
      } else {
        await fetch("/api/ranking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      reset();
      load();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Устгах уу?")) return;

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

  /* ================= UI HELPERS ================= */

  const card = "bg-white rounded-2xl shadow-sm border border-black/10";
  const label = "block text-xs font-extrabold text-gray-700 mb-1";
  const hint = "text-[11px] text-gray-500 mb-2 leading-snug";
  const input =
    "w-full border border-black/20 bg-white text-black placeholder:text-gray-500 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-black/20";
  const btn =
    "px-4 py-2 rounded-xl font-extrabold transition disabled:opacity-50";
  const btnPrimary = `${btn} bg-black text-white hover:opacity-90`;
  const btnSoft = `${btn} bg-gray-100 text-black border border-black/10 hover:bg-gray-200`;
  const btnDanger = `${btn} bg-red-600 text-white hover:opacity-90`;

  const previewLogo = useMemo(() => {
    if (logoFile) return URL.createObjectURL(logoFile);
    return form.logo || "/user.png";
  }, [logoFile, form.logo]);

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-black">Админ — Ranking</h1>
          <div className="text-sm text-gray-600">
            Багийн чансааны оноо (score) болон logo-г удирдана.
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
                Доорх талбаруудыг бөглөөд хадгална.
              </div>
            </div>

            <div className="flex gap-2">
              {editingId && (
                <button onClick={reset} className={btnSoft}>
                  Cancel
                </button>
              )}
              <button onClick={reset} className={btnSoft}>
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Gender */}
            <div>
              <label className={label}>Төрөл</label>
              <div className={hint}>Эрэгтэй / Эмэгтэй ангилал</div>
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
              <div className={hint}>Ж: Japan, Mongolia</div>
              <input
                className={input}
                placeholder="Japan"
                value={form.teamName}
                onChange={(e) => setForm((p) => ({ ...p, teamName: e.target.value }))}
              />
            </div>

            {/* Team code */}
            <div>
              <label className={label}>Багийн код</label>
              <div className={hint}>3 үсэг — Ж: JPN, USA, MGL</div>
              <input
                className={input}
                placeholder="JPN"
                value={form.teamCode}
                onChange={(e) =>
                  setForm((p) => ({ ...p, teamCode: e.target.value.toUpperCase() }))
                }
              />
            </div>

            {/* Score */}
            <div>
              <label className={label}>Оноо</label>
              <div className={hint}>Чансааны оноо / байрлалын оноо</div>
              <input
                type="number"
                className={input}
                value={form.score}
                onChange={(e) =>
                  setForm((p) => ({ ...p, score: Number(e.target.value) }))
                }
              />
            </div>

            {/* Logo row */}
            <div className="md:col-span-4">
              <label className={label}>Logo (Upload)</label>
              <div className={hint}>PNG / JPG upload (Cloudinary)</div>

              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-black/10 bg-gray-50 overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewLogo} alt="logo" className="w-12 h-12 object-contain" />
                  </div>

                  <div className="text-xs text-gray-600">
                    {logoFile ? (
                      <span className="text-green-700 font-bold">Шинэ logo сонгосон</span>
                    ) : form.logo ? (
                      <span>Одоогийн logo ашиглагдана</span>
                    ) : (
                      <span>Logo байхгүй</span>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="block w-full md:max-w-md text-sm"
                />
              </div>
            </div>
          </div>

          <button disabled={uploading} onClick={submit} className={btnPrimary}>
            {uploading ? "Хадгалж байна..." : editingId ? "💾 Update" : "➕ Add"}
          </button>
        </div>

        {/* LIST */}
        <div className={`${card} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
            <div className="text-lg font-extrabold text-black">Жагсаалт</div>
            <div className="text-sm text-gray-600">{data.length} баг</div>
          </div>

          {/* table header */}
          <div className="grid grid-cols-[.8fr_2fr_1fr_1fr_1.2fr] gap-2 px-4 py-2 bg-gray-50 text-xs font-extrabold text-gray-700 border-b border-black/10">
            <span>LOGO</span>
            <span>БАГ</span>
            <span>ТӨРӨЛ</span>
            <span className="text-right">ОНОО</span>
            <span className="text-right">ACTIONS</span>
          </div>

          {data.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-600">Мэдээлэл алга</div>
          ) : (
            data
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((t, idx) => (
                <div
                  key={t._id}
                  className="grid grid-cols-[.8fr_2fr_1fr_1fr_1.2fr] gap-2 px-4 py-2 items-center border-b border-black/5 hover:bg-gray-50/60 transition"
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
                      <span className="text-gray-500 mr-2">#{idx + 1}</span>
                      {t.teamCode} — {t.teamName}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      (Ranking багц)
                    </div>
                  </div>

                  <div className="text-sm font-bold text-black">
                    {t.gender === "women" ? "ЭМЭГТЭЙ" : "ЭРЭГТЭЙ"}
                  </div>

                  <div className="text-right font-extrabold text-black">
                    {t.score}
                  </div>

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
