"use client";

import { useEffect, useMemo, useState } from "react";

interface Competition {
  _id: string;
  name: string;
  logo: string;
}

export default function AdminCompetitions() {
  const [data, setData] = useState<Competition[]>([]);
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [editing, setEditing] = useState<Competition | null>(null);

  const load = async () => {
    const res = await fetch("/api/competitions");
    setData(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const uploadLogo = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    return data.secure_url || data.url;
  };

  const add = async () => {
    if (!name || !logoFile) return alert("Бүгдийг бөглө");

    const logo = await uploadLogo(logoFile);

    await fetch("/api/competitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, logo }),
    });

    setName("");
    setLogoFile(null);
    load();
  };

  const update = async () => {
    if (!editing) return;

    let logo = editing.logo;
    if (logoFile) {
      logo = await uploadLogo(logoFile);
    }

    await fetch("/api/competitions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing._id,
        name: editing.name,
        logo,
      }),
    });

    setEditing(null);
    setLogoFile(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Устгах уу?")) return;

    await fetch("/api/competitions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    load();
  };

  const previewLogo = useMemo(() => {
    if (logoFile) return URL.createObjectURL(logoFile);
    if (editing?.logo) return editing.logo;
    return "";
  }, [logoFile, editing?.logo]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Competitions Admin
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Competition нэмэх • засах • устгах
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Нийт: <span className="text-white font-bold">{data.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.12),transparent_55%)]" />

              <div className="relative p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="text-sm font-extrabold">
                      {editing ? "✏️ Competition засах" : "➕ Шинэ competition нэмэх"}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {editing
                        ? "Нэр/лого шинэчлэнэ"
                        : "Тэмцээний нэр болон лого оруулна"}
                    </div>
                  </div>

                  {editing && (
                    <button
                      onClick={() => {
                        setEditing(null);
                        setLogoFile(null);
                      }}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition"
                    >
                      Болих
                    </button>
                  )}
                </div>

                {/* Name */}
                <label className="block text-[11px] font-bold tracking-widest text-slate-300 mb-2">
                  NAME
                </label>
                <input
                  className="w-full rounded-2xl bg-slate-950/60 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-violet-400/50"
                  placeholder="Жишээ: VNL 2026"
                  value={editing ? editing.name : name}
                  onChange={(e) =>
                    editing
                      ? setEditing({ ...editing, name: e.target.value })
                      : setName(e.target.value)
                  }
                />

                {/* Logo */}
                <div className="mt-4">
                  <label className="block text-[11px] font-bold tracking-widest text-slate-300 mb-2">
                    LOGO
                  </label>

                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 transition text-xs font-bold">
                      Зураг сонгох
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      />
                    </label>

                    <div className="text-[11px] text-slate-400 truncate">
                      {logoFile ? logoFile.name : "Файл сонгоогүй"}
                    </div>
                  </div>

                  {previewLogo && (
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                      <img
                        src={previewLogo}
                        alt="logo preview"
                        className="w-14 h-14 object-contain rounded-xl bg-black/40 border border-white/10"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {editing ? editing.name : name || "Preview"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Preview
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <button
                  onClick={editing ? update : add}
                  className="mt-5 w-full py-3 rounded-2xl font-extrabold text-sm
                    bg-gradient-to-r from-violet-600 to-fuchsia-600
                    hover:from-violet-500 hover:to-fuchsia-500
                    active:scale-[0.99] transition
                    shadow-[0_0_20px_rgba(168,85,247,0.25)]
                  "
                >
                  {editing ? "Шинэчлэх" : "Нэмэх"}
                </button>

                <div className="mt-3 text-[11px] text-slate-400">
                  {editing
                    ? "Update хийхэд PATCH явна."
                    : "Add хийхэд POST явна."}
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-extrabold">Competitions</div>

              <button
                onClick={load}
                className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition"
              >
                Refresh
              </button>
            </div>

            {data.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-10 text-center text-slate-400">
                Одоогоор competition алга
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.map((c) => (
                  <div
                    key={c._id}
                    className="rounded-3xl border border-white/10 bg-slate-900/30 overflow-hidden hover:border-white/20 transition"
                  >
                    <div className="p-4 flex items-center gap-3">
                      <img
                        src={c.logo}
                        alt={c.name}
                        className="w-12 h-12 object-contain rounded-2xl bg-black/40 border border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-extrabold truncate">
                          {c.name}
                        </div>
                        <div className="text-[10px] text-slate-500 break-all">
                          {c._id}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(c);
                          setLogoFile(null);
                        }}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition"
                      >
                        Засах
                      </button>

                      <button
                        onClick={() => remove(c._id)}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-red-500/15 text-red-200 hover:bg-red-500/20 transition"
                      >
                        Устгах
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}