"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Gender = "men" | "women";

type GenericStat = {
  _id: string;
  gender: Gender;
  playerNumber: number;
  playerName: string;
  avatar?: string;
  teamCode: string;
  score: number;
};

type CategoryKey = "points" | "block" | "serve" | "set" | "defense" | "receive";

const CATEGORIES: { key: CategoryKey; label: string; api: string }[] = [
  { key: "points", label: "ОНОО", api: "/api/statistics" },
  { key: "receive", label: "ДОВТОЛГОО", api: "/api/stats-receive" },
  { key: "block", label: "ХААЛТ", api: "/api/stats-block" },
  { key: "serve", label: "ДАВУУЛАЛТ", api: "/api/stats-serve" },
  { key: "set", label: "ХОЛБОЛТ", api: "/api/stats-set" },
  { key: "defense", label: "ХАМГААЛАЛТ", api: "/api/stats-defense" },
];

function isGender(x: unknown): x is Gender {
  return x === "men" || x === "women";
}

export default function StatisticsPage() {
  const [gender, setGender] = useState<Gender>("men");
  const [cat, setCat] = useState<CategoryKey>("points");

  const [genericData, setGenericData] = useState<GenericStat[]>([]);
  const [loading, setLoading] = useState(false);

  const current = useMemo(() => CATEGORIES.find((c) => c.key === cat)!, [cat]);

  const CATEGORY_IMG: Record<CategoryKey, string> = {
    points: "/icons/ptslogo.png",
    receive: "/icons/attack.png",
    block: "/icons/block.png",
    serve: "/icons/serve.png",
    set: "/icons/set.png",
    defense: "/icons/defense.png",
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // ✅ бүгд адилхан gender query-тэй
        const url = `${current.api}?gender=${gender}`;

        const res = await fetch(url);
        const data: unknown = await res.json();

        const safe = Array.isArray(data)
          ? data.filter((x): x is GenericStat => {
              if (!x || typeof x !== "object") return false;
              const o = x as Record<string, unknown>;
              return (
                typeof o._id === "string" &&
                isGender(o.gender) &&
                typeof o.playerNumber === "number" &&
                typeof o.playerName === "string" &&
                typeof o.teamCode === "string" &&
                typeof o.score === "number"
              );
            })
          : [];

        setGenericData(safe);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [cat, gender, current.api]);

  const genericFiltered = useMemo(() => {
    return genericData
      .filter((p) => p.gender === gender)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.playerNumber - b.playerNumber;
      });
  }, [genericData, gender]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* top header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-md mx-auto px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src={CATEGORY_IMG[current.key]}
                  alt="icon"
                  fill
                  className="object-contain"
                />
              </div>

              <div>
                <div className="text-xs text-gray-400">STATISTICS</div>
                <div className="text-lg font-extrabold tracking-wide">
                  {current.label}
                </div>
              </div>
            </div>

            <div className="flex justify-center px-3">
              <div className="flex w-full max-w-[320px] bg-black border border-white/10 rounded-full p-1">
                {(["men", "women"] as const).map((g) => {
                  const active = gender === g;

                  return (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 py-2 rounded-full text-[10px] font-bold transition-all px-2 ${
                        active
                          ? `
        text-white
        bg-gradient-to-r from-[#1e2a4a] via-[#2b3f74] to-[#3b4f9a]
        border border-white/20
        shadow-[0_0_18px_rgba(80,120,255,0.25)]
      `
                          : `
     text-gray-400
                  bg-transparent
                  border-transparent
      `
                      }`}
                    >
                      {g === "men" ? "ЭРЭГТЭЙ" : "ЭМЭГТЭЙ"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* category tabs */}
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`py-2 rounded-xl text-xs font-bold border border-white/10 ${
                  cat === c.key ? "bg-white text-black" : "bg-gray-900"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="max-w-md mx-auto bg-[#020617] border border-white/10 rounded-2xl p-6 text-center text-gray-400">
            Уншиж байна...
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-[#020617] rounded-2xl overflow-hidden border border-white/10">
            {/* header */}
            <div className="grid grid-cols-[0.5fr_5fr_1fr_1fr] px-3 py-2 text-[11px] font-bold text-gray-400 border-b border-white/10">
              <span>#</span>
              <span>Тоглогч</span>
              <span>Баг</span>
              <span className="text-center">Оноо</span>
            </div>

            {genericFiltered.length === 0 ? (
              <div className="p-6 text-center text-gray-400">Мэдээлэл алга</div>
            ) : (
              genericFiltered.map((p, i) => (
                <div
                  key={p._id}
                  className="grid grid-cols-[0.5fr_3fr_1fr_1fr] px-3 py-2 text-sm border-b border-white/5 hover:bg-white/5 transition items-center"
                >
                  {/* RANK */}
                  <span className="font-extrabold text-yellow-400">
                    {i + 1}
                  </span>

                  {/* PLAYER */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                      <Image
                        src={p.avatar || "/user.png"}
                        alt={p.playerName}
                        width={36}
                        height={36}
                        className="w-9 h-9 object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate font-semibold text-white">
                        {p.playerName}
                      </div>
                    </div>
                  </div>

                  {/* TEAM */}
                  <span className="font-bold text-cyan-400 text-right">
                    {p.teamCode}
                  </span>

                  {/* SCORE */}
                  <span className="text-right font-extrabold text-white">
                    {p.score}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* small footer */}
      </div>
    </div>
  );
}
