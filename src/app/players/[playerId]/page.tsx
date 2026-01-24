"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ================= TYPES ================= */

interface Stats {
  totalPoints: number;
  avgByMatch: number;
  attackPoints: number;
  attackEfficiency: number;
  blockPoints: number;
  blockSuccess: number;
  servePoints: number;
}

interface Player {
  _id: string;
  number: number;
  name: string;
  position: string;
  nationality: string;
  birthDate: string;
  height: number;
  avatarUrl: string;
  stats?: Partial<Stats>; // 👈 stats optional
}

/* ================= HELPERS ================= */

const defaultStats: Stats = {
  totalPoints: 0,
  avgByMatch: 0,
  attackPoints: 0,
  attackEfficiency: 0,
  blockPoints: 0,
  blockSuccess: 0,
  servePoints: 0,
};

/* ================= COMPONENT ================= */

export default function PlayerPage() {
  const params = useParams();
  const raw = params?.playerId;
  const playerId =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
      ? raw[0]
      : null;

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!playerId) return;

    const load = async (): Promise<void> => {
      try {
        const res = await fetch(
          `/api/players?playerId=${encodeURIComponent(
            playerId
          )}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          setPlayer(null);
          return;
        }

        const data: unknown = await res.json();
        setPlayer(data as Player);
      } catch (err) {
        console.error("LOAD PLAYER ERROR:", err);
        setPlayer(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [playerId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading player...
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-6 text-center text-red-500">
        Player not found
      </div>
    );
  }

  // 🔥 SAFE STATS (хуучин document-ууд дээр ч ажиллана)
  const s: Stats = {
    ...defaultStats,
    ...(player.stats || {}),
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-4">
      <div className="max-w-md mx-auto text-center">
        <img
          src={player.avatarUrl || "/user.png"}
          alt={player.name}
          className="w-32 h-32 rounded-full mx-auto object-cover"
        />

        <div className="text-red-500 text-4xl font-bold mt-2">
          {player.number}
        </div>

        <h1 className="text-2xl font-bold">
          {player.name.toUpperCase()}
        </h1>

        {/* BIO */}
        <div className="grid grid-cols-2 gap-3 my-4 text-sm">
          <Info
            label="Position"
            value={player.position}
          />
          <Info
            label="Nationality"
            value={player.nationality || "-"}
          />
          <Info
            label="Birth Date"
            value={player.birthDate || "-"}
          />
          <Info
            label="Height"
            value={
              player.height
                ? `${player.height} cm`
                : "-"
            }
          />
        </div>

        <h2 className="font-bold my-4">
          PLAYER COMPETITION STATISTICS
        </h2>

        <Stat label="Total Points" value={s.totalPoints} />
        <Stat
          label="Average By Match"
          value={s.avgByMatch}
        />
        <Stat
          label="Attack Points"
          value={s.attackPoints}
        />
        <Stat
          label="Attack Efficiency"
          value={`${s.attackEfficiency}%`}
        />
        <Stat
          label="Block Points"
          value={s.blockPoints}
        />
        <Stat
          label="Block Success"
          value={`${s.blockSuccess}%`}
        />
        <Stat
          label="Serve Points"
          value={s.servePoints}
        />
      </div>
    </div>
  );
}

/* ================= UI ================= */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#121826] p-2 rounded">
      <div className="text-gray-400 text-xs">
        {label}
      </div>
      <div className="font-bold">
        {value}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between border-b border-gray-700 py-2">
      <span className="text-gray-400">
        {label}
      </span>
      <span className="text-red-400 font-bold">
        {value}
      </span>
    </div>
  );
}
