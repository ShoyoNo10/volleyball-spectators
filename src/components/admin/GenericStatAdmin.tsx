"use client";

import { useEffect, useMemo, useState } from "react";

type Gender = "men" | "women";

type StatRow = {
  _id: string;
  gender: Gender;
  playerNumber: number;
  playerName: string;
  avatar?: string;
  teamCode: string;
  score: number;
};

type CreateBody = Omit<StatRow, "_id">;
type UpdateBody = Partial<CreateBody> & { _id: string };

function isStatRow(x: unknown): x is StatRow {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o._id === "string" &&
    (o.gender === "men" || o.gender === "women") &&
    typeof o.playerNumber === "number" &&
    typeof o.playerName === "string" &&
    typeof o.teamCode === "string" &&
    typeof o.score === "number"
  );
}

export default function GenericStatAdmin({
  title,
  apiPath,
}: {
  title: string;
  apiPath: string; // ж: "/api/stats-block"
}) {
  const [gender, setGender] = useState<Gender>("men");
  const [rows, setRows] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [playerNumber, setPlayerNumber] = useState<number>(0);
  const [playerName, setPlayerName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [avatar, setAvatar] = useState("/user.png");
  const [score, setScore] = useState<number>(0);

  const [uploading, setUploading] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiPath}?gender=${gender}`);
      const data: unknown = await res.json();

      if (Array.isArray(data)) {
        setRows(data.filter(isStatRow));
      } else {
        setRows([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, apiPath]);

  const reset = () => {
    setEditingId(null);
    setPlayerNumber(0);
    setPlayerName("");
    setTeamCode("");
    setAvatar("/user.png");
    setScore(0);
  };

  // ✅ Upload → /api/upload/logo (чи яг ийм route-той)
const uploadImage = async (file: File) => {
  setUploading(true);
  try {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
    const data: unknown = await res.json();

    const obj = (data && typeof data === "object") ? (data as Record<string, unknown>) : null;
    const url =
      (obj?.secure_url as string | undefined) ??
      (obj?.url as string | undefined) ??
      (obj?.secureUrl as string | undefined);

    if (typeof url === "string" && url.length > 0) {
      setAvatar(url);
    } else {
      alert("Upload failed: url/secure_url ирсэнгүй (Response-оо Network->Preview дээр шалга)");
    }
  } finally {
    setUploading(false);
  }
};


  const onSubmit = async () => {
    if (!playerName || !teamCode) return alert("playerName/teamCode хоосон байна");

    const payload: CreateBody = {
      gender,
      playerNumber,
      playerName,
      teamCode,
      avatar,
      score,
    };

    if (editingId) {
      const body: UpdateBody = { _id: editingId, ...payload };
      await fetch(apiPath, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    reset();
    fetchRows();
  };

  const onEdit = (r: StatRow) => {
    setEditingId(r._id);
    setPlayerNumber(r.playerNumber);
    setPlayerName(r.playerName);
    setTeamCode(r.teamCode);
    setAvatar(r.avatar || "/user.png");
    setScore(r.score);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Устгах уу?")) return;
    await fetch(`${apiPath}?id=${id}`, { method: "DELETE" });
    fetchRows();
  };

  const sorted = useMemo(() => [...rows].sort((a, b) => b.score - a.score), [rows]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>

        {/* Gender */}
        <div className="flex gap-2">
          {(["men", "women"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`flex-1 py-2 rounded-xl font-bold ${
                gender === g ? "bg-white text-black" : "bg-gray-800"
              }`}
            >
              {g.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-[#0b1220] border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold">{editingId ? "✏️ Засах" : "➕ Нэмэх"}</div>
            <button onClick={reset} className="text-sm underline text-gray-300">
              Clear
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-2">
            <input
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2"
              type="number"
              placeholder="№ (playerNumber)"
              value={playerNumber}
              onChange={(e) => setPlayerNumber(Number(e.target.value))}
            />

            <input
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2"
              placeholder="Player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />

            <input
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2"
              placeholder="TEAM code"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
            />

            {/* ✅ Avatar URL + Upload */}
            <div className="md:col-span-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar || "/user.png"}
                  alt="avatar"
                  className="w-12 h-12 object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <input
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 w-full"
                  placeholder="Avatar URL (эсвэл upload)"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />

                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f);
                  }}
                  className="block w-full text-xs text-gray-300
                    file:mr-3 file:py-2 file:px-3
                    file:rounded-xl file:border-0
                    file:bg-white file:text-black file:font-bold
                    hover:file:opacity-90 disabled:opacity-60"
                />

                {uploading && (
                  <div className="text-xs text-gray-400">Uploading...</div>
                )}
              </div>
            </div>

            <input
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2"
              type="number"
              placeholder="Score"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </div>

          <button
            onClick={onSubmit}
            className="w-full py-2 rounded-xl font-bold bg-white text-black"
          >
            {editingId ? "UPDATE" : "CREATE"}
          </button>
        </div>

        {/* List */}
        <div className="bg-[#020617] border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[0.6fr_1fr_2fr_1fr_1fr_1.6fr] px-3 py-2 text-xs font-bold text-gray-400 border-b border-white/10">
            <span>#</span>
            <span>№</span>
            <span>PLAYER</span>
            <span>TEAM</span>
            <span className="text-center">SCORE</span>
            <span className="text-right">ACTIONS</span>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : sorted.length === 0 ? (
            <div className="p-4 text-center text-gray-400">Мэдээлэл алга</div>
          ) : (
            sorted.map((r, i) => (
              <div
                key={r._id}
                className="grid grid-cols-[0.6fr_1fr_2fr_1fr_1fr_1.6fr] px-3 py-2 text-sm border-b border-white/5 items-center"
              >
                <span className="font-bold text-yellow-400">{i + 1}</span>
                <span className="font-bold">{r.playerNumber}</span>
                <span className="truncate">{r.playerName}</span>
                <span className="font-bold text-cyan-400">{r.teamCode}</span>
                <span className="text-center font-bold">{r.score}</span>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(r)}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(r._id)}
                    className="px-3 py-1 rounded-lg bg-red-500/30 hover:bg-red-500/40"
                  >
                    Delete
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
