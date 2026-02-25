"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDeviceId } from "@/src/lib/device";

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
  likes?: number;
  likedBy?: string[];
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
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const getDeviceId = () => {
    // fallback: localStorage
    const k = "deviceId";
    let v = localStorage.getItem(k);
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem(k, v);
    }
    return v;
  };

  useEffect(() => {
    if (!playerId) return;

    const load = async (): Promise<void> => {
      try {
        const res = await fetch(
          `/api/players?playerId=${encodeURIComponent(playerId)}`,
          { cache: "no-store" },
        );

        if (!res.ok) {
          setPlayer(null);
          return;
        }

        const data: unknown = await res.json();
        setPlayer(data as Player);

        const p = data as Player;
        const deviceId = getDeviceId();

        setLikeCount(p.likes ?? 0);
        setLiked((p.likedBy ?? []).includes(deviceId));
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
      <div className="p-6 text-center text-gray-400">Loading player...</div>
    );
  }

  if (!player) {
    return <div className="p-6 text-center text-red-500">Player not found</div>;
  }

  // 🔥 SAFE STATS (хуучин document-ууд дээр ч ажиллана)
  const s: Stats = {
    ...defaultStats,
    ...(player.stats || {}),
  };

  const toggleLike = async () => {
    if (!player?._id) return;

    const deviceId = getDeviceId();
    const wasLiked = liked;

    // optimistic update
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));

    try {
      const res = await fetch("/api/players/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player._id, deviceId }),
      });

      if (!res.ok) throw new Error("Like failed");

      const out = (await res.json()) as { likes: number; liked: boolean };
      setLikeCount(out.likes);
      setLiked(out.liked);
    } catch (e) {
      // rollback
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-4 mb-15">
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
            border
            border-black
            bg-black
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
          
          <button
            onClick={toggleLike}
            className={`
    mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold
    border border-white/10
    ${liked ? "bg-red-600 text-white" : "bg-[#121826] text-gray-200 hover:bg-[#182033]"}
  `}
          >
            <span>{liked ? "❤️ Liked" : "🤍 Like"}</span>
            <span className="text-white/70">•</span>
            <span className="text-white">{likeCount}</span>
          </button>

          {/* <button
  onClick={toggleLike}
  className={`
    mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold
    border border-white/10
    ${liked ? "bg-red-600 text-white" : "bg-[#121826] text-gray-200 hover:bg-[#182033]"}
  `}
>
  <span>
    {liked ? "❤️ Миний дуртай тоглогч" : "🤍 Миний дуртай тоглогч"}
  </span>
  <span className="text-white/70">•</span>
  <span className="text-white">{likeCount}</span>
</button> */}

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
          <div className="font-bold my-4 text-center text-[20px] lg:text-left">
            Үзүүлэлт
          </div>

          <div className="space-y-1">
            <Stat
              label="Оноо"
              value={s.totalPoints}
              iconSrc="/icons/ptslogo.png"
            />
            {/* <Stat label="Average By Match" value={s.avgByMatch} /> */}
            <Stat
              label="Довтолгоо"
              value={s.attackPoints}
              iconSrc="/icons/attack.png"
            />
            <Stat
              label="Холболт"
              value={`${s.attackEfficiency}`}
              iconSrc="/icons/set.png"
            />
            <Stat
              label="Хаалт"
              value={s.blockPoints}
              iconSrc="/icons/block.png"
            />
            <Stat
              label="Хамгаалалт"
              value={`${s.blockSuccess}`}
              iconSrc="/icons/defense.png"
            />
            <Stat
              label="Давуулалт"
              value={s.servePoints}
              iconSrc="/icons/serve.png"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= UI ================= */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#121826] p-2 rounded">
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  iconSrc,
}: {
  label: string;
  value: string | number;
  iconSrc: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-700 py-2">
      {/* left */}
      <div className="flex items-center gap-2">
        <img src={iconSrc} alt={label} className="w-6 h-6 object-contain" />
        <span className="text-gray-400">{label}</span>
      </div>

      {/* right */}
      <span className="text-red-500 font-bold">{value}</span>
    </div>
  );
}
