// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// /* ================= TYPES ================= */

// interface Stats {
//   totalPoints: number;
//   avgByMatch: number;
//   attackPoints: number;
//   attackEfficiency: number;
//   blockPoints: number;
//   blockSuccess: number;
//   servePoints: number;
// }

// interface Player {
//   _id: string;
//   number: number;
//   name: string;
//   position: string;
//   nationality: string;
//   birthDate: string;
//   height: number;
//   avatarUrl: string;
//   likes?: number;
//   likedBy?: string[];
//   stats?: Partial<Stats>; // 👈 stats optional
// }

// /* ================= HELPERS ================= */

// const defaultStats: Stats = {
//   totalPoints: 0,
//   avgByMatch: 0,
//   attackPoints: 0,
//   attackEfficiency: 0,
//   blockPoints: 0,
//   blockSuccess: 0,
//   servePoints: 0,
// };

// /* ================= COMPONENT ================= */

// export default function PlayerPage() {
//   const params = useParams();
//   const raw = params?.playerId;
//   const playerId =
//     typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;

//   const [player, setPlayer] = useState<Player | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   const [likeCount, setLikeCount] = useState(0);
//   const [liked, setLiked] = useState(false);

//   const getDeviceId = () => {
//     // fallback: localStorage
//     const k = "deviceId";
//     let v = localStorage.getItem(k);
//     if (!v) {
//       v = crypto.randomUUID();
//       localStorage.setItem(k, v);
//     }
//     return v;
//   };

//   useEffect(() => {
//     if (!playerId) return;

//     const load = async (): Promise<void> => {
//       try {
//         const res = await fetch(
//           `/api/players?playerId=${encodeURIComponent(playerId)}`,
//           { cache: "no-store" },
//         );

//         if (!res.ok) {
//           setPlayer(null);
//           return;
//         }

//         const data: unknown = await res.json();
//         setPlayer(data as Player);

//         const p = data as Player;
//         const deviceId = getDeviceId();

//         setLikeCount(p.likes ?? 0);
//         setLiked((p.likedBy ?? []).includes(deviceId));
//       } catch (err) {
//         console.error("LOAD PLAYER ERROR:", err);
//         setPlayer(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [playerId]);

//   if (loading) {
//     return (
//       <div className="p-6 text-center text-gray-400">Loading player...</div>
//     );
//   }

//   if (!player) {
//     return <div className="p-6 text-center text-red-500">Player not found</div>;
//   }

//   // 🔥 SAFE STATS (хуучин document-ууд дээр ч ажиллана)
//   const s: Stats = {
//     ...defaultStats,
//     ...(player.stats || {}),
//   };

//   const toggleLike = async () => {
//     if (!player?._id) return;

//     const deviceId = getDeviceId();
//     const wasLiked = liked;

//     // optimistic update
//     setLiked(!wasLiked);
//     setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));

//     try {
//       const res = await fetch("/api/players/like", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ playerId: player._id, deviceId }),
//       });

//       if (!res.ok) throw new Error("Like failed");

//       const out = (await res.json()) as { likes: number; liked: boolean };
//       setLikeCount(out.likes);
//       setLiked(out.liked);
//     } catch (e) {
//       // rollback
//       setLiked(wasLiked);
//       setLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
//     }
//   };

//   return (
//     <div className="  bg-[#0b0f19] text-white p-4 mb-15">
//       <div
//         className="
//         max-w-5xl mx-auto
//         grid grid-cols-1
//         lg:grid-cols-[380px_1fr]
//         gap-6 relative
//       "
//       >
//         {/* LEFT — PROFILE */}
//         <div
//           className="
//           text-center
//           lg:bg-[#0f1629]
//           lg:border lg:border-white/10
//           lg:rounded-2xl
//           lg:p-6
//           lg:shadow-xl
//         "
//         >
//           <button
//             onClick={toggleLike}
//             className={`
//      inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold
//     border border-white/10 absolute right-1 top-1 md:left-4 md:top-4 md:w-fit
//     ${liked ? "bg-red-600 text-white" : "bg-[#121826] text-gray-200 hover:bg-[#182033]"}
//   `}
//           >
//             <span>{liked ? "❤️ Liked" : "🤍 Like"}</span>
//             <span className="text-white/70">•</span>
//             <span className="text-white">{likeCount}</span>
//           </button>
//           <img
//             src={player.avatarUrl || "/user.png"}
//             alt={player.name}
//             className="
//             w-32 h-32
//             rounded-full
//             border
//             border-black
//             bg-black
//             mx-auto
//             object-cover
//             lg:border-4
//             lg:border-red-500/40
//             lg:shadow-lg
//           "
//           />

//           <div className="text-red-500 text-4xl font-bold mt-3">
//             {player.number}
//           </div>

//           <h1 className="text-2xl font-bold mt-1">
//             {player.name.toUpperCase()}
//           </h1>

//           {/* BIO */}
//           <div className="grid grid-cols-2 gap-3 my-4 text-sm">
//             <Info label="Байрлал" value={player.position} />
//             <Info label="Улс" value={player.nationality || "-"} />
//             <Info label="Төрсөн он, сар" value={player.birthDate || "-"} />
//             <Info
//               label="Өндөр"
//               value={player.height ? `${player.height} cm` : "-"}
//             />
//           </div>
//         </div>

//         {/* RIGHT — STATS */}
//         <div
//           className="
//           lg:bg-[#0f1629]
//           lg:border lg:border-white/10
//           lg:rounded-2xl
//           lg:p-6
//           lg:shadow-xl
//         "
//         >
//           <div className="font-bold my-4 text-center text-[20px] lg:text-left">
//             Үзүүлэлт
//           </div>

//           <div className="space-y-1">
//             <Stat
//               label="Оноо"
//               value={s.totalPoints}
//               iconSrc="/icons/ptslogo.png"
//             />
//             {/* <Stat label="Average By Match" value={s.avgByMatch} /> */}
//             <Stat
//               label="Довтолгоо"
//               value={s.attackPoints}
//               iconSrc="/icons/attack.png"
//             />
//             <Stat
//               label="Холболт"
//               value={`${s.attackEfficiency}`}
//               iconSrc="/icons/set.png"
//             />
//             <Stat
//               label="Хаалт"
//               value={s.blockPoints}
//               iconSrc="/icons/block.png"
//             />
//             <Stat
//               label="Хамгаалалт"
//               value={`${s.blockSuccess}`}
//               iconSrc="/icons/defense.png"
//             />
//             <Stat
//               label="Давуулалт"
//               value={s.servePoints}
//               iconSrc="/icons/serve.png"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ================= UI ================= */

// function Info({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="bg-[#121826] p-2 rounded">
//       <div className="text-gray-400 text-xs">{label}</div>
//       <div className="font-bold">{value}</div>
//     </div>
//   );
// }

// function Stat({
//   label,
//   value,
//   iconSrc,
// }: {
//   label: string;
//   value: string | number;
//   iconSrc: string;
// }) {
//   return (
//     <div className="flex items-center justify-between border-b border-gray-700 py-2">
//       {/* left */}
//       <div className="flex items-center gap-2">
//         <img src={iconSrc} alt={label} className="w-6 h-6 object-contain" />
//         <span className="text-gray-400">{label}</span>
//       </div>

//       {/* right */}
//       <span className="text-red-500 font-bold">{value}</span>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
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

type Handedness = "right" | "left";

type Achievement = {
  year?: number | string;
  competition?: string;
  medal?: string; // 🥇🥈🥉 / "Gold" / "Мөнгө" гэх мэт
  trophy?: string; // "MVP", "Best spiker", "Champion" гэх мэт
  note?: string;
};

interface Player {
  _id: string;
  number: number;
  name: string;
  position: string;
  nationality: string;
  birthDate: string; // "YYYY-MM-DD" эсвэл "YYYY-MM" гэх мэт байж болно
  height: number;
  avatarUrl: string;

  likes?: number;
  likedBy?: string[];
  stats?: Partial<Stats>; // 👈 stats optional

  // ✅ NEW (optional) fields for tabs
  handedness?: Handedness;
  nationalTeamFromYear?: number; // шигшээд орсон он
  nationalTeamToYear?: number; // одоо хүртэл тоглож байвал хоосон байж болно
  spikeHeight?: number; // довтолгооны өндөр (cm)
  blockHeight?: number; // хаалтны өндөр (cm)
  achievements?: Achievement[];
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

function toDateSafe(input?: string): Date | null {
  if (!input) return null;
  // allow "YYYY-MM" -> "YYYY-MM-01"
  const normalized = /^\d{4}-\d{2}$/.test(input) ? `${input}-01` : input;

  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function calcAge(birthDate?: string): number | null {
  const d = toDateSafe(birthDate);
  if (!d) return null;

  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();

  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;

  return age >= 0 ? age : null;
}

function formatHand(h?: Handedness) {
  if (h === "right") return "Баруун гар";
  if (h === "left") return "Зүүн гар";
  return "-";
}

function fmtYearRange(from?: number, to?: number) {
  if (!from && !to) return "-";
  if (from && !to) return `${from}`;
  if (!from && to) return `- ${to}`;
  return `${from} - ${to}`;
}

/* ================= COMPONENT ================= */

type TabKey = "stats" | "achievements" | "general";

export default function PlayerPage() {
  const params = useParams();
  const raw = params?.playerId;
  const playerId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const [tab, setTab] = useState<TabKey>("stats");

  const getDeviceId = () => {
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

  // 🔥 SAFE STATS
  const s: Stats = {
    ...defaultStats,
    ...(player.stats || {}),
  };

  const age = calcAge(player.birthDate);

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

  const achievements = player.achievements ?? [];

  return (
    <div className="bg-[#0b0f19] text-white p-4 mb-15">
      <div
        className="
          max-w-5xl mx-auto
          grid grid-cols-1
          lg:grid-cols-[380px_1fr]
          gap-6 relative
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
          <button
            onClick={toggleLike}
            className={`
              inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold
              border border-white/10 absolute right-1 top-1 md:left-4 md:top-4 md:w-fit
              ${
                liked
                  ? "bg-red-600 text-white"
                  : "bg-[#121826] text-gray-200 hover:bg-[#182033]"
              }
            `}
          >
            <span>{liked ? "❤️ Liked" : "🤍 Like"}</span>
            <span className="text-white/70">•</span>
            <span className="text-white">{likeCount}</span>
          </button>

          <img
            src={player.avatarUrl || "/user.png"}
            alt={player.name}
            className="
              w-32 h-32
              rounded-full
              border border-black
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

        {/* RIGHT — TABS */}
        <div
          className="
            lg:bg-[#0f1629]
            lg:border lg:border-white/10
            lg:rounded-2xl
            lg:p-6
            lg:shadow-xl
          "
        >
          {/* Tabs header */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex gap-2 bg-[#0b1222] border border-white/10 rounded-full p-1">
              <TabBtn active={tab === "stats"} onClick={() => setTab("stats")}>
                Үзүүлэлт
              </TabBtn>
              <TabBtn
                active={tab === "achievements"}
                onClick={() => setTab("achievements")}
              >
                Амжилт
              </TabBtn>
              <TabBtn
                active={tab === "general"}
                onClick={() => setTab("general")}
              >
                Ерөнхий
              </TabBtn>
            </div>
          </div>

          {/* Tab content */}
          {tab === "stats" ? (
            // ✅ EXISTING STATS (unchanged)
            <div className="space-y-1">
              <Stat
                label="Оноо"
                value={s.totalPoints}
                iconSrc="/icons/ptslogo.png"
              />
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
          ) : tab === "achievements" ? (
            <div className="space-y-3">
              {achievements.length === 0 ? (
                <div className="text-gray-400 text-sm bg-[#121826] border border-white/10 rounded-xl p-4">
                  Одоогоор амжилтын мэдээлэл алга байна.
                </div>
              ) : (
                <AchievementGroups achievements={achievements} />
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Нас" value={age != null ? `${age}` : "-"} />
                <Info label="Гар" value={formatHand(player.handedness)} />
                <Info
                  label="Шигшээд тоглосон жил"
                  value={fmtYearRange(player.nationalTeamFromYear)}
                />
                <Info
                  label="Довтолгооны өндөр"
                  value={player.spikeHeight ? `${player.spikeHeight} cm` : "-"}
                />
                <Info
                  label="Хаалтны өндөр"
                  value={player.blockHeight ? `${player.blockHeight} cm` : "-"}
                />
                <Info label="Байрлал" value={player.position || "-"} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= UI ================= */

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-xs font-bold transition
        ${active ? "bg-red-600 text-white" : "text-gray-300 hover:bg-white/5"}
      `}
      type="button"
    >
      {children}
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#121826] p-2 rounded">
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/20 border border-white/10 p-2 rounded-lg">
      <div className="text-gray-400 text-[11px]">{label}</div>
      <div className="font-bold text-sm">{value}</div>
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

// type Achievement = {
//   year?: number | string;
//   competition?: string;
//   medal?: string; // ж: "Хүрэл медаль" эсвэл "🥉 Хүрэл медаль"
//   trophy?: string;
//   note?: string;
// };

function AchievementGroups({ achievements }: { achievements: Achievement[] }) {
  // group by competition
  const groups = achievements.reduce<Record<string, Achievement[]>>(
    (acc, a) => {
      const key = (a.competition?.trim() || "Тэмцээн").toUpperCase();
      (acc[key] ||= []).push(a);
      return acc;
    },
    {},
  );

function medalText(medal?: string) {
  if (!medal) return "-";

  const m = medal.toLowerCase();

  if (m.includes("алт") || m.includes("gold") || m.includes("🥇"))
    return "Алтан медаль";

  if (m.includes("мөнгө") || m.includes("silver") || m.includes("🥈"))
    return "Мөнгөн медаль";

  if (m.includes("хүрэл") || m.includes("bronze") || m.includes("🥉"))
    return "Хүрэл медаль";

  return medal;
}

  // sort groups by name (optional)
  const entries = Object.entries(groups);

  return (
    <div className="space-y-4">
      {entries.map(([comp, items]) => {
        // sort years desc (optional)
        const sorted = [...items].sort((x, y) => {
          const ax = typeof x.year === "number" ? x.year : Number(x.year);
          const ay = typeof y.year === "number" ? y.year : Number(y.year);
          const aNum = Number.isFinite(ax) ? ax : -1;
          const bNum = Number.isFinite(ay) ? ay : -1;
          return bNum - aNum;
        });

        return (
          <div
            key={comp}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f19]"
          >
            {/* HEADER */}
            <div className="px-4 py-3 text-center font-extrabold tracking-wide bg-linear-to-b from-white/10 to-white/0">
              {comp}
            </div>

            {/* ROWS */}
            <div>
              {sorted.map((a, i) => (
                <div
                  key={`${comp}-${i}`}
                  className="flex items-center justify-between px-4 py-3 border-t border-white/10"
                >
                  {/* LEFT: YEAR */}
                  <div className="text-white font-semibold tabular-nums">
                    {a.year ?? "-"}
                  </div>

                  {/* RIGHT: MEDAL (like image) */}
<div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
  {a.trophy ? (
    <>
      <span>👍</span>
      <span>{a.trophy}</span>
    </>
  ) : (
    <span>{medalText(a.medal)}</span>
  )}
</div>
                </div>
              ))}
            </div>

            {/* NOTE / TROPHY (optional) */}
            {/* Хэрвээ хүсвэл доор нь жижиг тайлбар болгож гаргаж болно */}
            {/* <div className="px-4 py-3 text-xs text-gray-400 border-t border-white/10">
              {sorted.some(x=>x.note||x.trophy) ? "..." : null}
            </div> */}
          </div>
        );
      })}
    </div>
  );
}

function medalEmoji(medal?: string) {
  const m = (medal || "").toLowerCase();

  // already has emoji
  if (medal?.includes("🥇") || medal?.includes("🥈") || medal?.includes("🥉"))
    return "";

  if (m.includes("алт") || m.includes("gold") || m.includes("1")) return "🥇";
  if (m.includes("мөнгө") || m.includes("silver") || m.includes("2"))
    return "🥈";
  if (m.includes("хүрэл") || m.includes("bronze") || m.includes("3"))
    return "🥉";

  // default icon (like your screenshot used medal icon)
  return "🏅";
}

function cleanMedalText(medal?: string) {
  if (!medal) return "";
  // remove emoji duplicates if user saved "🥉 Хүрэл медаль"
  return medal
    .replaceAll("🥇", "")
    .replaceAll("🥈", "")
    .replaceAll("🥉", "")
    .trim();
}
