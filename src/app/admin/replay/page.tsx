"use client";

import { useEffect, useMemo, useState } from "react";

interface Competition {
  _id: string;
  name: string;
}

interface ReplayVideo {
  _id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  competitionId: string;
}

export default function AdminReplay() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [videos, setVideos] = useState<ReplayVideo[]>([]);

  const [videoForm, setVideoForm] = useState<ReplayVideo>({
    _id: "",
    title: "",
    thumbnail: "",
    videoUrl: "",
    competitionId: "",
  });

  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);

  const load = async () => {
    const c = await fetch("/api/competitions").then((r) => r.json());
    const v = await fetch("/api/replay").then((r) => r.json());
    setCompetitions(c);
    setVideos(v);
  };

  useEffect(() => {
    load();
  }, []);

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    return data.secure_url || data.url;
  };

  const save = async () => {
    let thumbnail = videoForm.thumbnail;

    if (thumbFile) {
      thumbnail = await uploadImage(thumbFile);
    }

    const method = editing ? "PATCH" : "POST";

    await fetch("/api/replay", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...videoForm,
        thumbnail,
        ...(editing && { id: videoForm._id }),
      }),
    });

    setVideoForm({
      _id: "",
      title: "",
      thumbnail: "",
      videoUrl: "",
      competitionId: "",
    });
    setThumbFile(null);
    setEditing(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Устгах уу?")) return;

    await fetch("/api/replay", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    load();
  };

  const selectedCompetitionName = useMemo(() => {
    return (
      competitions.find((c) => c._id === videoForm.competitionId)?.name || ""
    );
  }, [competitions, videoForm.competitionId]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Replay Admin
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Видео нэмэх • засах • устгах (competition-оор ангилна)
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Нийт видео:{" "}
            <span className="text-white font-bold">{videos.length}</span>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
              <div className="relative p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="text-sm font-extrabold">
                      {editing ? "✏️ Видео засах" : "➕ Шинэ видео нэмэх"}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {editing ? "Одоо байгаа видеог шинэчилнэ" : "Шинэ replay видео үүсгэнэ"}
                    </div>
                  </div>

                  {editing && (
                    <button
                      onClick={() => {
                        setVideoForm({
                          _id: "",
                          title: "",
                          thumbnail: "",
                          videoUrl: "",
                          competitionId: "",
                        });
                        setThumbFile(null);
                        setEditing(false);
                      }}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition"
                    >
                      Болих
                    </button>
                  )}
                </div>

                {/* Competition */}
                <label className="block text-[11px] font-bold tracking-widest text-slate-300 mb-2">
                  COMPETITION
                </label>
                <select
                  className="w-full rounded-2xl bg-slate-950/60 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
                  value={videoForm.competitionId}
                  onChange={(e) =>
                    setVideoForm((p) => ({
                      ...p,
                      competitionId: e.target.value,
                    }))
                  }
                >
                  <option value="">— Сонгох —</option>
                  {competitions.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {videoForm.competitionId && (
                  <div className="mt-2 text-[11px] text-slate-400">
                    Сонгосон:{" "}
                    <span className="text-white font-semibold">
                      {selectedCompetitionName}
                    </span>
                  </div>
                )}

                {/* Title */}
                <div className="mt-4">
                  <label className="block text-[11px] font-bold tracking-widest text-slate-300 mb-2">
                    TITLE
                  </label>
                  <input
                    className="w-full rounded-2xl bg-slate-950/60 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
                    placeholder="Жишээ: Japan vs Brazil (Final)"
                    value={videoForm.title}
                    onChange={(e) =>
                      setVideoForm((p) => ({
                        ...p,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Video URL */}
                <div className="mt-4">
                  <label className="block text-[11px] font-bold tracking-widest text-slate-300 mb-2">
                    VIDEO URL
                  </label>
                  <input
                    className="w-full rounded-2xl bg-slate-950/60 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
                    placeholder="https://..."
                    value={videoForm.videoUrl}
                    onChange={(e) =>
                      setVideoForm((p) => ({
                        ...p,
                        videoUrl: e.target.value,
                      }))
                    }
                  />
                  <div className="mt-2 text-[11px] text-slate-400">
                    Tip: embed / direct link байвал илүү найдвартай.
                  </div>
                </div>

                {/* Thumbnail */}
                <div className="mt-4">
                  <label className="block text-[11px] font-bold tracking-widest text-slate-300 mb-2">
                    THUMBNAIL
                  </label>

                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 transition text-xs font-bold">
                      Зураг сонгох
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                      />
                    </label>

                    <div className="text-[11px] text-slate-400 truncate">
                      {thumbFile ? thumbFile.name : "Файл сонгоогүй"}
                    </div>
                  </div>

                  {(thumbFile || videoForm.thumbnail) && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 bg-slate-950/40">
                      <div className="aspect-video w-full">
                        <img
                          src={thumbFile ? URL.createObjectURL(thumbFile) : videoForm.thumbnail}
                          alt="thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Save */}
                <button
                  onClick={save}
                  className="mt-5 w-full py-3 rounded-2xl font-extrabold text-sm
                    bg-gradient-to-r from-cyan-600 to-blue-600
                    hover:from-cyan-500 hover:to-blue-500
                    active:scale-[0.99] transition
                    shadow-[0_0_20px_rgba(56,189,248,0.25)]
                  "
                >
                  {editing ? "Шинэчлэх" : "Нэмэх"}
                </button>

                <div className="mt-3 text-[11px] text-slate-400">
                  {editing ? "Update хийхэд PATCH явна." : "Add хийхэд POST явна."}
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-extrabold">Videos</div>
              <button
                onClick={load}
                className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition"
              >
                Refresh
              </button>
            </div>

            {videos.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-10 text-center text-slate-400">
                Одоогоор видео алга
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((v) => (
                  <div
                    key={v._id}
                    className="group rounded-3xl border border-white/10 bg-slate-900/30 overflow-hidden hover:border-white/20 transition"
                  >
                    {/* thumb */}
                    <div className="relative aspect-video bg-black/40">
                      {v.thumbnail ? (
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                          Thumbnail байхгүй
                        </div>
                      )}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                    </div>

                    {/* content */}
                    <div className="p-4">
                      <div className="text-sm font-extrabold line-clamp-2">
                        {v.title}
                      </div>

                      <div className="mt-1 text-[11px] text-slate-400">
                        {competitions.find((c) => c._id === v.competitionId)?.name ||
                          "—"}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <a
                          href={v.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
                        >
                          Link нээх
                        </a>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setVideoForm(v);
                              setEditing(true);
                              setThumbFile(null);
                            }}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition"
                          >
                            Засах
                          </button>

                          <button
                            onClick={() => remove(v._id)}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-red-500/15 text-red-200 hover:bg-red-500/20 transition"
                          >
                            Устгах
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-500 break-all">
                        {v.videoUrl}
                      </div>
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