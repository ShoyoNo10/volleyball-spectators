"use client";

import { useEffect, useMemo, useState } from "react";

interface Team {
  _id: string;
  name: string;
}

interface BestResult {
  title: string;
  year: number;
}

interface CompetitionBlock {
  _id: string;
  competitionName: string;
  appearances: number;
  firstYear: number;
  bestResults: BestResult[];
}

interface TeamSuccess {
  _id: string;
  teamId: string;
  competitions: CompetitionBlock[];
}

export default function AdminTeamSuccess() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [data, setData] = useState<TeamSuccess | null>(null);

  const [competitionName, setCompetitionName] = useState("");
  const [appearances, setAppearances] = useState("");
  const [firstYear, setFirstYear] = useState("");

  const [bestTitle, setBestTitle] = useState("");
  const [bestYear, setBestYear] = useState("");
  const [bestResults, setBestResults] = useState<BestResult[]>([]);

  /* LOAD TEAMS */
  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((d: Team[]) => setTeams(Array.isArray(d) ? d : []));
  }, []);

  /* LOAD SUCCESS */
  useEffect(() => {
    if (!teamId) return;
    fetch(`/api/team-success?teamId=${teamId}`)
      .then((r) => r.json())
      .then((d: TeamSuccess) => setData(d || null));
  }, [teamId]);

  const addCompetition = async () => {
    if (!teamId) return alert("Эхлээд баг сонгоно уу");
    if (!competitionName.trim()) return alert("Тэмцээний нэр хоосон байна");

    await fetch("/api/team-success", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId,
        competitionName,
        appearances: Number(appearances || 0),
        firstYear: Number(firstYear || 0),
        bestResults,
      }),
    });

    setCompetitionName("");
    setAppearances("");
    setFirstYear("");
    setBestResults([]);

    const res = await fetch(`/api/team-success?teamId=${teamId}`);
    setData(await res.json());
  };

  const removeCompetition = async (competitionId: string) => {
    await fetch("/api/team-success", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, competitionId }),
    });

    const res = await fetch(`/api/team-success?teamId=${teamId}`);
    setData(await res.json());
  };

  const selectedTeamName = useMemo(() => {
    const t = teams.find((x) => x._id === teamId);
    return t?.name || "";
  }, [teams, teamId]);

  const card = "bg-white rounded-2xl shadow-sm border border-black/10";
  const label = "block text-sm font-bold text-black mb-1";
  const input =
    "w-full border border-black/20 bg-white text-black placeholder:text-gray-500 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-black/20";
  const btn =
    "px-4 py-2 rounded-xl font-bold transition disabled:opacity-50";
  const btnPrimary = `${btn} bg-black text-white hover:opacity-90`;
  const btnSoft = `${btn} bg-gray-100 text-black border border-black/10 hover:bg-gray-200`;
  const btnDanger = `${btn} bg-red-600 text-white hover:opacity-90`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-black">
              Админ — Багийн амжилт
            </h1>
            <div className="text-sm text-gray-600">
              Баг сонгоод тэмцээн, оролцоо, амжилтыг нэмнэ.
            </div>
          </div>

          {teamId && (
            <div className="text-sm font-bold text-black">
              Сонгосон баг:{" "}
              <span className="text-gray-700">{selectedTeamName}</span>
            </div>
          )}
        </div>

        {/* TEAM SELECT */}
        <div className={`${card} p-4`}>
          <label className={label}>Баг сонгох</label>
          <select
            className={input}
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="">Баг сонгох...</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="text-xs text-gray-600 mt-1">
            Сонгосон багийн “амжилт” доор харагдана.
          </div>
        </div>

        {teamId && (
          <>
            {/* ADD FORM */}
            <div className={`${card} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-extrabold text-black">
                  ➕ Тэмцээн нэмэх
                </h2>

                <button
                  className={btnSoft}
                  onClick={() => {
                    setCompetitionName("");
                    setAppearances("");
                    setFirstYear("");
                    setBestTitle("");
                    setBestYear("");
                    setBestResults([]);
                  }}
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className={label}>Тэмцээний нэр</label>
                  <input
                    className={input}
                    placeholder="Ж: World Cup"
                    value={competitionName}
                    onChange={(e) => setCompetitionName(e.target.value)}
                  />
                </div>

                <div>
                  <label className={label}>Оролцсон тоо</label>
                  <input
                    className={input}
                    placeholder="Appearances"
                    type="number"
                    value={appearances}
                    onChange={(e) => setAppearances(e.target.value)}
                  />
                </div>

                <div>
                  <label className={label}>Анх оролцсон он</label>
                  <input
                    className={input}
                    placeholder="First year"
                    type="number"
                    value={firstYear}
                    onChange={(e) => setFirstYear(e.target.value)}
                  />
                </div>
              </div>

              {/* BEST RESULTS */}
              <div className="mt-4">
                <div className="text-sm font-extrabold text-black mb-2">
                  🏆 Шилдэг амжилтууд
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_120px] gap-2 items-end">
                  <div>
                    <label className={label}>Амжилт (ж: Gold)</label>
                    <input
                      className={input}
                      placeholder="Ж: Gold / Silver / 4th"
                      value={bestTitle}
                      onChange={(e) => setBestTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={label}>Он</label>
                    <input
                      className={input}
                      placeholder="2026"
                      type="number"
                      value={bestYear}
                      onChange={(e) => setBestYear(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!bestTitle.trim() || !bestYear) return;
                      setBestResults((p) => [
                        ...p,
                        { title: bestTitle.trim(), year: Number(bestYear) },
                      ]);
                      setBestTitle("");
                      setBestYear("");
                    }}
                    className={btnPrimary}
                  >
                    Нэмэх
                  </button>
                </div>

                {bestResults.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bestResults.map((r, i) => (
                      <div
                        key={i}
                        className="px-3 py-1 rounded-full bg-gray-100 border border-black/10 text-sm text-black"
                      >
                        🏆 <b>{r.title}</b> — {r.year}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={addCompetition} className={`${btnPrimary} mt-4`}>
                💾 Хадгалах
              </button>
            </div>

            {/* LIST */}
            <div className={`${card} overflow-hidden`}>
              <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
                <div className="text-lg font-extrabold text-black">
                  Одоо байгаа тэмцээнүүд
                </div>
                <div className="text-sm text-gray-600">
                  {data?.competitions?.length ?? 0} ширхэг
                </div>
              </div>

              <div className="divide-y divide-black/10">
                {(data?.competitions ?? []).map((c) => (
                  <div
                    key={c._id}
                    className="px-4 py-3 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="font-extrabold text-black truncate">
                        {c.competitionName}
                      </div>
                      <div className="text-sm text-gray-700">
                        Оролцсон: <b>{c.appearances}</b> • Анх:{" "}
                        <b>{c.firstYear}</b>
                      </div>

                      {(c.bestResults?.length ?? 0) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {c.bestResults.map((r, idx) => (
                            <div
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full bg-black text-white"
                            >
                              🏆 {r.title} — {r.year}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeCompetition(c._id)}
                      className={btnDanger}
                    >
                      🗑 Устгах
                    </button>
                  </div>
                ))}

                {(data?.competitions?.length ?? 0) === 0 && (
                  <div className="px-4 py-6 text-center text-gray-600">
                    Одоогоор тэмцээний мэдээлэл алга байна.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
