"use client";

import { useEffect, useState } from "react";

type News = {
  _id: string;
  title: string;
  desc: string;
  image: string;
};

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => setNews(data));
  }, []);

  return (
    <div className="p-4 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.length === 0 && (
        <p className="text-gray-500">Одоогоор мэдээ алга</p>
      )}

      {news.map((n) => (
        <div
          key={n._id}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition"
        >
          <img
            src={n.image}
            alt=""
            className="h-40 w-full object-cover"
          />
          <div className="p-4">
            <h2 className="font-bold text-lg mb-2">{n.title}</h2>
            <p className="text-sm text-gray-600">{n.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
