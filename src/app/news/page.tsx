"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ================= PAGE ================= */

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [activePost, setActivePost] = useState<News | null>(null); // 🔥 MODAL STATE

  // 🔹 Fetch news
  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data: News[]) => {
        setNews(data);

        // 🔥 Build liked map from localStorage
        const map: Record<string, boolean> = {};
        data.forEach((n) => {
          map[n._id] = Boolean(localStorage.getItem(`liked_${n._id}`));
        });
        setLikedMap(map);
      });
  }, []);

  // 🔹 Like handler
  const handleLike = async (id: string) => {
    console.log("LIKE ID SENT:", id);

    if (likedMap[id]) return;

    // Optimistic UI
    setLikedMap((prev) => ({
      ...prev,
      [id]: true,
    }));

    localStorage.setItem(`liked_${id}`, "true");

    try {
      const res = await fetch("/api/news/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      // Update likes count
      setNews((prev) =>
        prev.map((n) =>
          n._id === id
            ? {
                ...n,
                likes: data.likes,
              }
            : n
        )
      );

      // 🔥 Update modal post too
      setActivePost((prev) =>
        prev && prev._id === id
          ? { ...prev, likes: data.likes }
          : prev
      );
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  return (
    <>
      {/* GRID */}
      <div className="p-4 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length === 0 && (
          <p className="text-gray-500">Одоогоор мэдээ алга</p>
        )}

        {news.map((n) => {
          const liked = likedMap[n._id];

          return (
            <div
              key={n._id}
              onClick={() => setActivePost(n)} // 🔥 OPEN MODAL
              className="
                bg-[#0b0f1a] text-white rounded-2xl
                border border-white/10 overflow-hidden
                hover:scale-[1.02] hover:shadow-xl
                transition cursor-pointer
              "
            >
              {/* TOP BAR — USER + DATE */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#121726] border-b border-white/10">
                <div className="flex items-center gap-2">
                  {/* Avatar initial */}
                  <div className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center font-bold text-xs">
                    {n.author?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <span className="text-sm font-semibold">
                    {n.author || "VNL Admin"}
                  </span>
                </div>

                <span className="text-[10px] text-gray-400">
                  {formatDate(n.createdAt)}
                </span>
              </div>

              {/* IMAGE */}
              <div className="relative w-full h-44">
                <Image
                  src={n.image}
                  alt={n.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="p-4 space-y-2">
                <h2 className="font-bold text-base line-clamp-2">
                  {n.title}
                </h2>
                <p className="text-sm text-gray-400 line-clamp-3">
                  {n.desc}
                </p>

                {/* LIKE BAR */}
                <div className="flex items-center gap-3 pt-2 relative z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // 🔥 Card click-ээс салгана
                      e.preventDefault();
                      handleLike(String(n._id));
                    }}
                    className={`
                      text-xl transition
                      ${
                        liked
                          ? "text-red-500 scale-110"
                          : "text-gray-400 hover:text-red-500"
                      }
                    `}
                  >
                    <Heart fill={liked ? "currentColor" : "none"} />
                  </button>

                  <span className="text-sm text-gray-400">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-[#0b0f1a] text-white max-w-md w-full rounded-2xl overflow-hidden border border-white/10 animate-fadeIn">
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#121726] border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center font-bold text-xs">
                  {activePost.author?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <span className="text-sm font-semibold">
                  {activePost.author}
                </span>
              </div>

              <button
                onClick={() => setActivePost(null)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* IMAGE */}
            <div className="relative w-full h-64 bg-black">
              <img
                src={activePost.image}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-3">
              <h2 className="font-bold text-lg">
                {activePost.title}
              </h2>

              <p className="text-sm text-gray-300 whitespace-pre-line">
                {activePost.desc}
              </p>

              {/* LIKE BAR */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleLike(String(activePost._id))
                  }
                  className="text-xl text-red-500 hover:scale-110 transition"
                >
                  <Heart fill="currentColor" />
                </button>

                <span className="text-sm text-gray-400">
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
