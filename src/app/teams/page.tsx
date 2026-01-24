"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Team {
  _id: string;
  name: string;
  code: string;
  gender: "men" | "women";
  flagUrl: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [gender, setGender] = useState<"men" | "women">("men");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then(setTeams);
  }, []);

  const filtered = teams.filter(
    (t) => t.gender === gender
  );

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setGender("men")}
          className={`px-4 py-2 rounded ${
            gender === "men"
              ? "bg-red-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Men&apos;s
        </button>
        <button
          onClick={() => setGender("women")}
          className={`px-4 py-2 rounded ${
            gender === "women"
              ? "bg-red-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Women&apos;s
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map((t) => (
          <div
            key={t._id}
            onClick={() => router.push(`/teams/${t._id}`)}
            className="cursor-pointer bg-white rounded-xl shadow p-3 text-center hover:scale-105 transition"
          >
            <img
              src={t.flagUrl}
              alt={t.name}
              className="w-16 h-10 mx-auto object-contain mb-2"
            />
            <b>{t.code}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
