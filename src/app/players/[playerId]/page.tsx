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
    <div
      className="
        max-w-5xl mx-auto
        grid grid-cols-1
        lg:grid-cols-[380px_1fr]
        gap-6
      "
    >
      {/* LEFT — PROFILE */}
      <div
        className="
          text-center
          lg:bg-[#0f1629]
          lg:border lg:border-white/10
          lg:rounded-2xl
          lg:p-6
          lg:shadow-xl
        "
      >
        <img
          src={player.avatarUrl || "/user.png"}
          alt={player.name}
          className="
            w-32 h-32
            rounded-full
            mx-auto
            object-cover
            lg:border-4
            lg:border-red-500/40
            lg:shadow-lg
          "
        />

        <div className="text-red-500 text-4xl font-bold mt-3">
          {player.number}
        </div>

        <h1 className="text-2xl font-bold mt-1">
          {player.name.toUpperCase()}
        </h1>

        {/* BIO */}
        <div className="grid grid-cols-2 gap-3 my-4 text-sm">
          <Info label="Байрлал" value={player.position} />
          <Info label="Улс" value={player.nationality || "-"} />
          <Info label="Төрсөн он, сар" value={player.birthDate || "-"} />
          <Info
            label="Өндөр"
            value={player.height ? `${player.height} cm` : "-"}
          />
        </div>
      </div>

      {/* RIGHT — STATS */}
      <div
        className="
          lg:bg-[#0f1629]
          lg:border lg:border-white/10
          lg:rounded-2xl
          lg:p-6
          lg:shadow-xl
        "
      >
        <div className="font-bold my-4 text-center text-[13px] lg:text-left">
          2025 оны Үндэстнүүдийн лигийн үзүүлэлт
        </div>

        <div className="space-y-1">
          <Stat label="Оноо" value={s.totalPoints} />
          {/* <Stat label="Average By Match" value={s.avgByMatch} /> */}
          <Stat label="Довтолгоо" value={s.attackPoints} />
          {/* <Stat
            label="Attack Efficiency"
            value={`${s.attackEfficiency}%`}
          /> */}
          <Stat label="Хаалт" value={s.blockPoints} />
          {/* <Stat
            label="Block Success"
            value={`${s.blockSuccess}%`}
          /> */}
          <Stat label="Давуулалт" value={s.servePoints} />
        </div>
      </div>
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
