"use client";

import {
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

type News = {
  _id: string;
  title: string;
  desc: string;
  image: string;
  author: string;
  createdAt: string;
  likes: number;
};

export default function AdminNews() {
  const router = useRouter();

  const [news, setNews] =
    useState<News[]>([]);
  const [title, setTitle] =
    useState("");
  const [desc, setDesc] =
    useState("");
  const [author, setAuthor] =
    useState("VNL Admin");
  const [file, setFile] =
    useState<File | null>(null);
  const [loading, setLoading] =
    useState(false);

  const fetchNews = useCallback(
    async () => {
      const res = await fetch(
        "/api/news"
      );
      const data = await res.json();
      setNews(data);
    },
    []
  );

  useEffect(() => {
    const auth =
      localStorage.getItem(
        "adminAuth"
      );
    if (!auth) {
      router.push("/admin/login");
      return;
    }
    fetchNews();
  }, [router, fetchNews]);

  const uploadImage = async () => {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      "/api/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const addNews = async () => {
    if (
      !title ||
      !desc ||
      !file ||
      !author
    ) {
      return alert(
        "Гарчиг, тайлбар, зураг, username заавал!"
      );
    }

    setLoading(true);

    const imageUrl =
      await uploadImage();

    await fetch("/api/news", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        title,
        desc,
        image: imageUrl,
        author,
        createdAt:
          new Date().toISOString(),
      }),
    });

    setTitle("");
    setDesc("");
    setFile(null);
    setLoading(false);

    fetchNews();
  };

  const deleteNews = async (
    id: string
  ) => {
    await fetch("/api/news", {
      method: "DELETE",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({ id }),
    });

    fetchNews();
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">
        Manage News (Insta Style)
      </h1>

      {/* ADD NEWS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Username (жишээ: VNL Admin)"
          value={author}
          onChange={(e) =>
            setAuthor(
              e.target.value
            )
          }
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="News title"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="News description"
          value={desc}
          onChange={(e) =>
            setDesc(
              e.target.value
            )
          }
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFile(
              e.target.files?.[0] ||
                null
            )
          }
        />

        <button
          disabled={loading}
          onClick={addNews}
          className="bg-vnl text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading
            ? "Uploading..."
            : "➕ Add News"}
        </button>
      </div>

      {/* NEWS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.map((n) => (
          <div
            key={n._id}
            className="bg-white p-4 rounded-xl shadow flex justify-between"
          >
            <div className="flex gap-4">
              <img
                src={n.image}
                className="w-24 h-16 object-cover rounded"
                alt=""
              />
              <div>
                <h2 className="font-bold">
                  {n.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {n.desc}
                </p>
                <p className="text-xs text-gray-400">
                  {n.author} •{" "}
                  {new Date(
                    n.createdAt
                  ).toLocaleDateString(
                    "mn-MN"
                  )}{" "}
                  • ❤️ {n.likes || 0}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                deleteNews(n._id)
              }
              className="text-red-500 font-bold"
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
