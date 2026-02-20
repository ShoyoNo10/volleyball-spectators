"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import CountdownBanner from "@/src/components/CountdownBanner";

/* ================= TYPES ================= */

type News = {
  _id: string;
  title: string;
  desc: string;
  image: string;
  author: string;
  createdAt: string;
  likes: number;
};

/* ================= HELPERS ================= */

// ✅ "February" биш: "2026 оны 2-р сарын 8" гэж гаргана
function formatDateMN(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";

  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();

  return `${y} оны ${m} сарын ${day}`;
}

/* ================= PAGE ================= */

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [activePost, setActivePost] = useState<News | null>(null);

  // 🔒 BODY SCROLL LOCK
  useEffect(() => {
    if (activePost) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [activePost]);

  // 🔹 Fetch news
  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data: News[]) => {
        setNews(data);

        const map: Record<string, boolean> = {};
        data.forEach((n) => {
          map[n._id] = Boolean(localStorage.getItem(`liked_${n._id}`));
        });
        setLikedMap(map);
      });
  }, []);

  // 🔹 Like handler
  const handleLike = async (id: string) => {
    if (likedMap[id]) return;

    setLikedMap((prev) => ({ ...prev, [id]: true }));
    localStorage.setItem(`liked_${id}`, "true");

    try {
      const res = await fetch("/api/news/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      setNews((prev) =>
        prev.map((n) => (n._id === id ? { ...n, likes: data.likes } : n)),
      );

      setActivePost((prev) =>
        prev && prev._id === id ? { ...prev, likes: data.likes } : prev,
      );
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  return (
    <>
      {/* GRID */}
      <div
        className="
          bg-black min-h-screen
          p-3 sm:p-4 md:p-8
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
          gap-4 md:gap-6 pb-16
          lg:max-w-7xl lg:mx-auto
          items-start
        "
      >
        <CountdownBanner
          title="VNL 2026"
          logoSrc="/vnllogo3.png"
          startDateISO="2026-06-03T00:55:00+08:00"
          endDateISO="2026-08-03T00:00:00+08:00"
          locationText="Олон байршил"
        />
        {news.length === 0 && <p className="text-gray-500">Уншиж байна...</p>}

        {news.map((n) => {
          const liked = likedMap[n._id];

          return (
            <div
              key={n._id}
              onClick={() => setActivePost(n)}
              className="
                bg-[#0b0f1a] text-white rounded-2xl
                border border-white/10 overflow-hidden
                transition cursor-pointer
                hover:shadow-2xl hover:scale-[1.02]
                lg:hover:scale-[1.03]

                flex flex-col
                self-start
              "
            >
              {/* TOP BAR */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#121726] border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center font-bold text-xs">
                    {n.author?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <span className="text-sm font-semibold">
                    {n.author || "VNL Admin"}
                  </span>
                </div>

                <span className="text-[10px] text-gray-400">
                  {formatDateMN(n.createdAt)}
                </span>
              </div>

              {/* IMAGE (✅ mobile дээр жаахан намхан) */}
              <div className="relative w-full h-36 sm:h-40 lg:h-48">
                <Image
                  src={n.image}
                  alt={n.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* CONTENT (✅ mobile дээр жижиг padding/font) */}
              <div className="p-3 sm:p-4 space-y-2 flex-1">
                <h2 className="font-bold text-[15px] sm:text-base lg:text-lg line-clamp-2">
                  {n.title}
                </h2>

                <p className="text-[13px] sm:text-sm text-gray-400 line-clamp-3 break-words">
                  {n.desc}
                </p>

                {/* LIKE BAR */}
                <div className="flex items-center gap-2 pt-1 relative z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleLike(String(n._id));
                    }}
                    className={`
                      transition
                      ${liked ? "text-red-500 scale-110" : "text-gray-400 hover:text-red-500"}
                    `}
                  >
                    <Heart size={20} fill={liked ? "currentColor" : "none"} />
                  </button>

                  <span className="text-xs sm:text-sm text-gray-400">
                    {n.likes || 0} likes
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL FULL VIEW ================= */}
      {activePost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-3 sm:p-4">
          <div
            className="
              bg-[#0b0f1a] text-white
              w-full
              max-h-[90vh]
              rounded-2xl overflow-hidden
              border border-white/10
              animate-fadeIn
              flex flex-col

              md:max-w-2xl
              lg:max-w-4xl
            "
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#121726] border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center font-bold text-xs">
                  {activePost.author?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {activePost.author || "VNL Admin"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatDateMN(activePost.createdAt)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActivePost(null)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* IMAGE — ✅ desktop дээр хэт өндөр болохоос хамгаалж max-h багасгав */}
            <div className="relative w-full bg-black shrink-0 aspect-[16/9] max-h-[320px] sm:max-h-[360px]">
              <img
                src={activePost.image}
                className="w-full h-full object-contain"
                alt=""
              />
            </div>

            {/* TEXT — ONLY THIS SCROLLS */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 pb-14">
              <h2 className="font-bold text-base sm:text-lg">
                {activePost.title}
              </h2>

              <p className="text-[13px] sm:text-sm text-gray-300 whitespace-pre-line break-words">
                {activePost.desc}
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleLike(String(activePost._id))}
                  className="text-red-500 hover:scale-110 transition"
                >
                  <Heart size={20} fill="currentColor" />
                </button>

                <span className="text-xs sm:text-sm text-gray-400">
                  {activePost.likes || 0} likes
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
