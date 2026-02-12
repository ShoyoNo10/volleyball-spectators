"use client";

import { useEffect, useState, useCallback } from "react";
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

type EditForm = {
  id: string;
  title: string;
  desc: string;
  author: string;
  createdAt: string;
  image: string; // preview url
  file: File | null; // new image file (optional)
};

export default function AdminNews() {
  const router = useRouter();

  const [news, setNews] = useState<News[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [author, setAuthor] = useState("VNL Admin");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  // ✅ Edit state
  const [editing, setEditing] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchNews = useCallback(async () => {
    const res = await fetch("/api/news");
    const data = await res.json();
    setNews(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (!auth) {
      router.push("/admin/login");
      return;
    }
    fetchNews();
  }, [router, fetchNews]);

  const uploadImage = async (f: File) => {
    const formData = new FormData();
    formData.append("file", f);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.secure_url as string;
  };

  const addNews = async () => {
    if (!title || !desc || !file || !author) {
      return alert("Гарчиг, тайлбар, зураг, username заавал!");
    }

    setLoading(true);
    try {
      const imageUrl = await uploadImage(file);

      await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          desc,
          image: imageUrl,
          author,
          createdAt: new Date().toISOString(),
        }),
      });

      setTitle("");
      setDesc("");
      setFile(null);
      fetchNews();
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: string) => {
    await fetch("/api/news", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchNews();
  };

  // ✅ start edit
  const startEdit = (n: News) => {
    setEditing({
      id: n._id,
      title: n.title,
      desc: n.desc,
      author: n.author || "VNL Admin",
      createdAt: n.createdAt || new Date().toISOString(),
      image: n.image,
      file: null,
    });
  };

  const cancelEdit = () => setEditing(null);

  // ✅ save edit (PUT)
  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.title || !editing.desc || !editing.author) {
      return alert("Гарчиг, тайлбар, username хоосон байна!");
    }

    setSavingEdit(true);
    try {
      let imageUrl = editing.image;

      // шинэ зураг сонгосон бол upload хийнэ
      if (editing.file) {
        imageUrl = await uploadImage(editing.file);
      }

      await fetch("/api/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          update: {
            title: editing.title,
            desc: editing.desc,
            author: editing.author,
            createdAt: editing.createdAt,
            image: imageUrl,
          },
        }),
      });

      setEditing(null);
      fetchNews();
    } finally {
      setSavingEdit(false);
    }
  };

  // ✅ UI helpers (илүү тод)
  const card =
    "bg-white rounded-2xl shadow-sm border border-black/10";
  const label = "block text-sm font-bold text-black mb-1";
  const input =
    "w-full border border-black/20 bg-white text-black placeholder:text-gray-500 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-black/20";
  const btn =
    "px-4 py-2 rounded-xl font-bold transition disabled:opacity-50";
  const btnPrimary = `${btn} bg-black text-white hover:opacity-90`;
  const btnSoft = `${btn} bg-gray-100 text-black border border-black/10 hover:bg-gray-200`;
  const btnDanger = `${btn} bg-red-600 text-white hover:opacity-90`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-black">
              Manage News
            </h1>
            <div className="text-sm text-gray-600">
              Add • Edit • Delete
            </div>
          </div>
        </div>

        {/* ✅ EDIT BAR */}
        {editing && (
          <div className={`${card} p-4 mb-6`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-black">
                ✏️ Засах
              </h2>
              <div className="flex gap-2">
                <button onClick={cancelEdit} className={btnSoft}>
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className={btnPrimary}
                >
                  {savingEdit ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={label}>Username</label>
                <input
                  className={input}
                  value={editing.author}
                  onChange={(e) =>
                    setEditing((p) => (p ? { ...p, author: e.target.value } : p))
                  }
                />
              </div>

              <div>
                <label className={label}>Огноо</label>
                <input
                  className={input}
                  value={editing.createdAt}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, createdAt: e.target.value } : p
                    )
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className={label}>Гарчиг</label>
                <input
                  className={input}
                  value={editing.title}
                  onChange={(e) =>
                    setEditing((p) => (p ? { ...p, title: e.target.value } : p))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className={label}>Тайлбар</label>
                <textarea
                  className={`${input} min-h-[110px]`}
                  value={editing.desc}
                  onChange={(e) =>
                    setEditing((p) => (p ? { ...p, desc: e.target.value } : p))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className={label}>Зураг (солих бол сонго)</label>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editing.image}
                    alt=""
                    className="w-28 h-20 object-cover rounded-xl border border-black/10"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-black"
                    onChange={(e) =>
                      setEditing((p) =>
                        p ? { ...p, file: e.target.files?.[0] || null } : p
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD NEWS */}
        <div className={`${card} p-4 mb-6 space-y-3`}>
          <h2 className="text-lg font-extrabold text-black">
            ➕ Add News
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={label}>Username</label>
              <input
                className={input}
                placeholder="VNL Admin"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div>
              <label className={label}>Зураг</label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-black"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="md:col-span-2">
              <label className={label}>News title</label>
              <input
                className={input}
                placeholder="News title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className={label}>News description</label>
              <textarea
                className={`${input} min-h-[110px]`}
                placeholder="News description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={loading}
            onClick={addNews}
            className={btnPrimary}
          >
            {loading ? "Uploading..." : "➕ Add News"}
          </button>

          <div className="text-xs text-gray-600">
            Tip: Edit хийх үед зураг сонгоогүй бол хуучин зураг хэвээр үлдэнэ.
          </div>
        </div>

        {/* NEWS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((n) => (
            <div
              key={n._id}
              className={`${card} p-4 flex justify-between gap-3`}
            >
              <div className="flex gap-4 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={n.image}
                  className="w-28 h-20 object-cover rounded-xl border border-black/10"
                  alt=""
                />
                <div className="min-w-0">
                  <h2 className="font-extrabold text-black truncate">
                    {n.title}
                  </h2>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {n.desc}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-bold text-black">{n.author}</span> •{" "}
                    {new Date(n.createdAt).toLocaleDateString("mn-MN")} • ❤️{" "}
                    {n.likes || 0}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => startEdit(n)}
                  className={btnSoft}
                >
                  ✏️
                </button>

                <button
                  onClick={() => deleteNews(n._id)}
                  className={btnDanger}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* bottom space */}
        <div className="h-10" />
      </div>
    </div>
  );
}
