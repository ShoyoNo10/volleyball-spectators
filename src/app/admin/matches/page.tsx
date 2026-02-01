"use client";

import { useCallback, useEffect, useState } from "react";

type MatchStatus = "live" | "upcoming" | "finished";

interface Match {
  _id: string;
  date: string;
  teamA: string;
  teamB: string;
  logoA: string;
  logoB: string;
  gender: string;
  time: string;
  status: MatchStatus;
  liveUrl: string;

  // 🔥 NEW
  competition: string;
}

type MatchForm = Omit<Match, "_id">;

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [uploading, setUploading] = useState(false);
  const [logoAFile, setLogoAFile] = useState<File | null>(null);
  const [logoBFile, setLogoBFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");

  const [form, setForm] = useState<MatchForm>({
    date: "",
    teamA: "",
    teamB: "",
    logoA: "",
    logoB: "",
    gender: "",
    time: "",
    status: "upcoming",
    liveUrl: "",
    competition: "VNL 2026", // 🔥 default
  });

  /* LOAD */
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setMatches(data);
      else setMatches([]);
    } catch {
      setMatches([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* UPLOAD */
  const uploadLogo = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) throw new Error("Upload failed");
    const data: { url: string } = await res.json();
    return data.url;
  };

  /* ACTIONS */
  const addMatch = async () => {
    try {
      setUploading(true);

      let logoA = form.logoA;
      let logoB = form.logoB;

      if (logoAFile) logoA = await uploadLogo(logoAFile);
      if (logoBFile) logoB = await uploadLogo(logoBFile);

      const payload = {
        ...form,
        logoA,
        logoB,
        competition: form.competition || "VNL", // 🔥 FORCE SEND
      };
console.log("PAYLOAD:", payload);

      console.log("SENDING MATCH:", payload);

      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Create failed");

      setForm({
        date: "",
        teamA: "",
        teamB: "",
        logoA: "",
        logoB: "",
        gender: "",
        time: "",
        status: "upcoming",
        liveUrl: "",
        competition: "VNL 2026",
      });

      setLogoAFile(null);
      setLogoBFile(null);
      await load();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    await fetch("/api/matches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  };

  const updateStatus = async (
    id: string,
    status: MatchStatus
  ) => {
    await fetch("/api/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
  };

  const saveLink = async (id: string) => {
    await fetch("/api/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        liveUrl: linkDraft,
        competition: form.competition, // 🔥 allow update if needed
      }),
    });
    setEditingId(null);
    setLinkDraft("");
    await load();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Admin — Matches
      </h1>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        {(
          [
            "date",
            "teamA",
            "teamB",
            "gender",
            "time",
            "competition", // 🔥 NEW INPUT
          ] as const
        ).map((key) => (
          <input
            key={key}
            placeholder={key}
            className="border p-2 rounded"
            value={form[key]}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                [key]: e.target.value,
              }))
            }
          />
        ))}

        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded"
          onChange={(e) =>
            setLogoAFile(e.target.files?.[0] || null)
          }
        />

        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded"
          onChange={(e) =>
            setLogoBFile(e.target.files?.[0] || null)
          }
        />
      </div>

      <button
        disabled={uploading}
        onClick={addMatch}
        className="bg-vnl text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "➕ Add Match"}
      </button>

      {/* LIST */}
      <div className="mt-6 space-y-2">
        {matches.map((m) => (
          <div
            key={m._id}
            className="bg-white p-3 rounded shadow flex justify-between items-center"
          >
            <div>
              <b>{m.teamA}</b> VS{" "}
              <b>{m.teamB}</b>{" "}
              <span className="text-xs text-gray-500">
                — {m.competition || "VNL"}
              </span>
              <div className="text-xs text-gray-400">
                {m.liveUrl ? (
                  <a
                    href={m.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Link
                  </a>
                ) : (
                  "No link yet"
                )}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={m.status}
                onChange={(e) =>
                  updateStatus(
                    m._id,
                    e.target.value as MatchStatus
                  )
                }
                className="border rounded px-2"
              >
                <option value="live">LIVE</option>
                <option value="upcoming">
                  UPCOMING
                </option>
                <option value="finished">
                  FINISHED
                </option>
              </select>

              <button
                onClick={() => remove(m._id)}
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
