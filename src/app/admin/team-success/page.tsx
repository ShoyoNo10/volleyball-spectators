"use client";

import { useEffect, useState } from "react";

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
      .then((d: Team[]) => setTeams(d));
  }, []);

  /* LOAD SUCCESS */
  useEffect(() => {
    if (!teamId) return;
    fetch(`/api/team-success?teamId=${teamId}`)
      .then((r) => r.json())
      .then((d: TeamSuccess) => setData(d || null));
  }, [teamId]);

  const addCompetition = async () => {
    await fetch("/api/team-success", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId,
        competitionName,
        appearances: Number(appearances),
        firstYear: Number(firstYear),
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin — Team Success</h1>

      {/* TEAM SELECT */}
      <select
        className="border p-2 w-full"
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
      >
        <option value="">Select team</option>
        {teams.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>

      {teamId && (
        <>
          {/* ADD FORM */}
          <div className="bg-white p-4 rounded shadow space-y-2">
            <h2 className="font-bold">➕ Add Competition</h2>

            <input
              className="border p-2 w-full"
              placeholder="Competition name (World Cup)"
              value={competitionName}
              onChange={(e) => setCompetitionName(e.target.value)}
            />

            <div className="flex gap-2">
              <input
                className="border p-2 w-full"
                placeholder="Appearances"
                type="number"
                value={appearances}
                onChange={(e) => setAppearances(e.target.value)}
              />
              <input
                className="border p-2 w-full"
                placeholder="First Year"
                type="number"
                value={firstYear}
                onChange={(e) => setFirstYear(e.target.value)}
              />
            </div>

            {/* BEST RESULTS */}
            <div className="flex gap-2">
              <input
                className="border p-2 w-full"
                placeholder="Result (Gold)"
                value={bestTitle}
                onChange={(e) => setBestTitle(e.target.value)}
              />
              <input
                className="border p-2 w-24"
                placeholder="Year"
                type="number"
                value={bestYear}
                onChange={(e) => setBestYear(e.target.value)}
              />
              <button
                onClick={() => {
                  if (!bestTitle || !bestYear) return;
                  setBestResults((p) => [
                    ...p,
                    { title: bestTitle, year: Number(bestYear) },
                  ]);
                  setBestTitle("");
                  setBestYear("");
                }}
                className="bg-green-600 text-white px-3 rounded"
              >
                ➕
              </button>
            </div>

            {bestResults.map((r, i) => (
              <div key={i} className="text-sm text-gray-600">
                🏆 {r.title} — {r.year}
              </div>
            ))}

            <button
              onClick={addCompetition}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Save Competition
            </button>
          </div>

          {/* LIST */}
          <div className="space-y-2">
            {data?.competitions.map((c) => (
              <div
                key={c._id}
                className="bg-gray-100 p-3 rounded flex justify-between items-center"
              >
                <div>
                  <b>{c.competitionName}</b> — {c.appearances} apps (first{" "}
                  {c.firstYear})
                </div>

                <button
                  onClick={() => removeCompetition(c._id)}
                  className="text-red-600 font-bold"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
