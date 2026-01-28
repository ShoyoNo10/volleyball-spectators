"use client";

import { useState } from "react";

async function upload(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
  const data: { url: string } = await res.json();
  return data.url;
}

export default function AdminSchedule() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");

  const [logoA, setLogoA] = useState<File | null>(null);
  const [logoB, setLogoB] = useState<File | null>(null);

  const save = async () => {
    let logoAUrl = "";
    let logoBUrl = "";

    if (logoA) logoAUrl = await upload(logoA);
    if (logoB) logoBUrl = await upload(logoB);

    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        time,
        liveUrl,
        teamA: { name: teamAName, logo: logoAUrl },
        teamB: { name: teamBName, logo: logoBUrl },
      }),
    });

    alert("Game created");
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-2">
      <h1 className="text-xl font-bold">Admin — Schedule</h1>

      <input className="border p-2 w-full" placeholder="Date"
        value={date} onChange={(e) => setDate(e.target.value)} />

      <input className="border p-2 w-full" placeholder="Time"
        value={time} onChange={(e) => setTime(e.target.value)} />

      <input className="border p-2 w-full" placeholder="Team A Name"
        value={teamAName} onChange={(e) => setTeamAName(e.target.value)} />

      <input type="file" onChange={(e) => setLogoA(e.target.files?.[0] || null)} />

      <input className="border p-2 w-full" placeholder="Team B Name"
        value={teamBName} onChange={(e) => setTeamBName(e.target.value)} />

      <input type="file" onChange={(e) => setLogoB(e.target.files?.[0] || null)} />

      <input className="border p-2 w-full" placeholder="Live URL"
        value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />

      <button onClick={save}
        className="bg-vnl text-white p-2 rounded w-full">
        ➕ Add Game
      </button>
    </div>
  );
}
