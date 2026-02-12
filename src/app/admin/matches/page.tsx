"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
  competition: string;
}

type MatchForm = Omit<Match, "_id">;

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [uploading, setUploading] = useState(false);
  const [logoAFile, setLogoAFile] = useState<File | null>(null);
  const [logoBFile, setLogoBFile] = useState<File | null>(null);

  // ✅ Link modal state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");
  const [competitionDraft, setCompetitionDraft] = useState("");

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
    competition: "VNL 2026",
  });

  /* LOAD */
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
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

    const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");

    const data: unknown = await res.json();
    const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;

    const url =
      (obj?.url as string | undefined) ??
      (obj?.secure_url as string | undefined) ??
      (obj?.secureUrl as string | undefined);

    if (!url) throw new Error("Upload url not found");
    return url;
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
        competition: form.competition || "VNL",
      };

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
    if (!confirm("Устгах уу?")) return;

    await fetch("/api/matches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  };

  const updateStatus = async (id: string, status: MatchStatus) => {
    await fetch("/api/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
  };

  // ✅ open link modal
  const openLinkEditor = (m: Match) => {
    setEditingId(m._id);
    setLinkDraft(m.liveUrl || "");
    setCompetitionDraft(m.competition || "VNL");
  };

  const saveLink = async () => {
    if (!editingId) return;

    await fetch("/api/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        liveUrl: linkDraft,
        competition: competitionDraft,
      }),
    });

    setEditingId(null);
    setLinkDraft("");
    setCompetitionDraft("");
    await load();
  };

  const editingMatch = useMemo(
    () => matches.find((m) => m._id === editingId) || null,
    [matches, editingId]
  );

  /* UI CLASSES */
  const card = "bg-white rounded-2xl shadow-sm border border-black/10";
  const label = "block text-sm font-bold text-black mb-1";
  const input =
    "w-full border border-black/20 bg-white text-black placeholder:text-gray-500 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-black/20";
  const btn = "px-4 py-2 rounded-xl font-bold transition disabled:opacity-50";
  const btnPrimary = `${btn} bg-black text-white hover:opacity-90`;
  const btnSoft = `${btn} bg-gray-100 text-black border border-black/10 hover:bg-gray-200`;
  const btnDanger = `${btn} bg-red-600 text-white hover:opacity-90`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-black">Админ — Тоглолтууд</h1>
          <div className="text-sm text-gray-600">
            Тоглолт нэмэх, статус солих, live линк оруулах, тэмцээний нэр засах.
          </div>
        </div>

        {/* FORM */}
        <div className={`${card} p-4 space-y-3`}>
          <div className="text-lg font-extrabold text-black">➕ Тоглолт нэмэх</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={label}>Огноо</label>
              <input
                type="date"
                className={input}
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>

            <div>
              <label className={label}>Цаг</label>
              <input
                type="time"
                className={input}
                value={form.time}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              />
            </div>

            <div>
              <label className={label}>Төрөл</label>
              <select
                className={input}
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
              >
                <option value="">Сонгох...</option>
                <option value="men">ЭРЭГТЭЙ</option>
                <option value="women">ЭМЭГТЭЙ</option>
              </select>
            </div>

            <div>
              <label className={label}>Team A</label>
              <input
                className={input}
                placeholder="Ж: Japan"
                value={form.teamA}
                onChange={(e) => setForm((p) => ({ ...p, teamA: e.target.value }))}
              />
            </div>

            <div>
              <label className={label}>Team B</label>
              <input
                className={input}
                placeholder="Ж: Brazil"
                value={form.teamB}
                onChange={(e) => setForm((p) => ({ ...p, teamB: e.target.value }))}
              />
            </div>

            <div>
              <label className={label}>Тэмцээн</label>
              <input
                className={input}
                placeholder="Ж: VNL 2026"
                value={form.competition}
                onChange={(e) => setForm((p) => ({ ...p, competition: e.target.value }))}
              />
            </div>

            <div className={`${card} p-3`}>
              <div className="text-sm font-extrabold text-black">Logo A</div>
              <input
                type="file"
                accept="image/*"
                className="mt-2 block w-full text-sm"
                onChange={(e) => setLogoAFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className={`${card} p-3`}>
              <div className="text-sm font-extrabold text-black">Logo B</div>
              <input
                type="file"
                accept="image/*"
                className="mt-2 block w-full text-sm"
                onChange={(e) => setLogoBFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className={`${card} p-3`}>
              <div className="text-sm font-extrabold text-black">Status (шинэ)</div>
              <select
                className={`${input} mt-2`}
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as MatchStatus }))}
              >
                <option value="upcoming">UPCOMING</option>
                <option value="live">LIVE</option>
                <option value="finished">FINISHED</option>
              </select>
            </div>
          </div>

          <button disabled={uploading} onClick={addMatch} className={btnPrimary}>
            {uploading ? "Оруулж байна..." : "➕ Тоглолт нэмэх"}
          </button>
        </div>

        {/* LIST */}
        <div className={`${card} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
            <div className="text-lg font-extrabold text-black">Жагсаалт</div>
            <div className="text-sm text-gray-600">{matches.length} тоглолт</div>
          </div>

          <div className="divide-y divide-black/10">
            {matches.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-600">Одоогоор мэдээлэл алга.</div>
            ) : (
              matches.map((m) => (
                <div key={m._id} className="px-4 py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-extrabold text-black truncate">
                      {m.teamA} <span className="text-gray-400">vs</span> {m.teamB}
                    </div>
                    <div className="text-sm text-gray-700">
                      <b>{m.competition || "VNL"}</b> • {m.date} • {m.time} •{" "}
                      {m.gender?.toLowerCase() === "women" ? "ЭМЭГТЭЙ" : "ЭРЭГТЭЙ"}
                    </div>

                    <div className="text-sm text-gray-600 mt-1">
                      Live:{" "}
                      {m.liveUrl ? (
                        <a
                          href={m.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all"
                        >
                          {m.liveUrl}
                        </a>
                      ) : (
                        <span className="text-gray-500">Линк байхгүй</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center shrink-0">
                    <select
                      value={m.status}
                      onChange={(e) => updateStatus(m._id, e.target.value as MatchStatus)}
                      className="border border-black/20 rounded-xl px-3 py-2 bg-white text-black font-bold"
                    >
                      <option value="live">LIVE</option>
                      <option value="upcoming">UPCOMING</option>
                      <option value="finished">FINISHED</option>
                    </select>

                    <button onClick={() => openLinkEditor(m)} className={btnSoft}>
                      ✏️ Link
                    </button>

                    <button onClick={() => remove(m._id)} className={btnDanger}>
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* LINK MODAL */}
        {editingId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <div className="text-lg font-extrabold text-black">
                  Link засах
                </div>
                <div className="text-sm text-gray-600">
                  {editingMatch ? (
                    <>
                      <b>{editingMatch.teamA}</b> vs <b>{editingMatch.teamB}</b>
                    </>
                  ) : (
                    "..."
                  )}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <label className={label}>Тэмцээн</label>
                  <input
                    className={input}
                    placeholder="Ж: VNL 2026"
                    value={competitionDraft}
                    onChange={(e) => setCompetitionDraft(e.target.value)}
                  />
                </div>

                <div>
                  <label className={label}>Live URL</label>
                  <input
                    className={input}
                    placeholder="https://..."
                    value={linkDraft}
                    onChange={(e) => setLinkDraft(e.target.value)}
                  />
                  <div className="text-xs text-gray-600 mt-1">
                    Хоосон байвал линк устсан гэж тооцно.
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-black/10 flex justify-end gap-2">
                <button
                  className={btnSoft}
                  onClick={() => {
                    setEditingId(null);
                    setLinkDraft("");
                    setCompetitionDraft("");
                  }}
                >
                  Болих
                </button>
                <button className={btnPrimary} onClick={saveLink}>
                  Хадгалах
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
