"use client";

import { useEffect, useState } from "react";

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
}

export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/matches");
      const data: Match[] = await res.json();
      setMatches(data);
    };
    load();
  }, []);

  const sections: {
    title: string;
    filter: MatchStatus;
  }[] = [
    { title: "🔴 LIVE", filter: "live" },
    { title: "⏳ Тун удахгүй", filter: "upcoming" },
    { title: "📼 Өмнөх тоглолтууд", filter: "finished" },
  ];

  return (
    <div className="p-4 space-y-8">
      {sections.map((s) => (
        <Section
          key={s.filter}
          title={s.title}
          matches={matches.filter(
            (m) => m.status === s.filter
          )}
        />
      ))}
    </div>
  );
}

function Section({
  title,
  matches,
}: {
  title: string;
  matches: Match[];
}) {
  if (!matches.length) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-3 text-white">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((m) => (
          <MatchCard key={m._id} match={m} />
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  return (
    <div
      onClick={() =>
        match.liveUrl &&
        window.open(match.liveUrl, "_blank")
      }
      className="bg-[#0b1220] text-white p-4 rounded-xl shadow hover:scale-[1.02] transition cursor-pointer"
    >
      <div className="flex justify-between text-sm mb-2">
        <span>{match.gender}</span>
        <span className="text-cyan-400">
          {match.time}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {match.logoA && (
            <img
              src={match.logoA}
              alt={match.teamA}
              className="w-8 h-8 object-contain"
            />
          )}
          <b>{match.teamA}</b>
        </div>

        <span>VS</span>

        <div className="flex items-center gap-2">
          <b>{match.teamB}</b>
          {match.logoB && (
            <img
              src={match.logoB}
              alt={match.teamB}
              className="w-8 h-8 object-contain"
            />
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        {match.status === "live" && "🔴 LIVE"}
        {match.status === "upcoming" && "⏳ Тун удахгүй"}
        {match.status === "finished" && "📼 Archive"}
      </div>
    </div>
  );
}
