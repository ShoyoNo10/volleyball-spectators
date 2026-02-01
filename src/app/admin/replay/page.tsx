"use client";

import { useEffect, useState } from "react";

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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">
        Admin — Replay Videos
      </h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-2">
          {editing ? "✏️ Edit Video" : "➕ Add Video"}
        </h2>

        <select
          className="border p-2 w-full mb-2"
          value={videoForm.competitionId}
          onChange={(e) =>
            setVideoForm((p) => ({
              ...p,
              competitionId: e.target.value,
            }))
          }
        >
          <option value="">Select Competition</option>
          {competitions.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Title"
          value={videoForm.title}
          onChange={(e) =>
            setVideoForm((p) => ({
              ...p,
              title: e.target.value,
            }))
          }
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Video URL"
          value={videoForm.videoUrl}
          onChange={(e) =>
            setVideoForm((p) => ({
              ...p,
              videoUrl: e.target.value,
            }))
          }
        />

        <input
          type="file"
          accept="image/*"
          className="mb-2"
          onChange={(e) =>
            setThumbFile(e.target.files?.[0] || null)
          }
        />

        <button
          onClick={save}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {editing ? "Update" : "Add"}
        </button>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {videos.map((v) => (
          <div
            key={v._id}
            className="bg-white p-3 rounded shadow flex justify-between items-center"
          >
            <div>
              <div className="font-bold text-sm">
                {v.title}
              </div>
              <div className="text-xs text-gray-500">
                {competitions.find(
                  (c) => c._id === v.competitionId
                )?.name || "—"}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setVideoForm(v);
                  setEditing(true);
                }}
                className="text-blue-500 text-sm"
              >
                ✏️
              </button>

              <button
                onClick={() => remove(v._id)}
                className="text-red-500 text-sm"
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
