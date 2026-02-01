"use client";

import { useEffect, useState } from "react";

interface Competition {
  _id: string;
  name: string;
  logo: string;
}

export default function AdminCompetitions() {
  const [data, setData] = useState<Competition[]>([]);
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [editing, setEditing] = useState<Competition | null>(null);

  const load = async () => {
    const res = await fetch("/api/competitions");
    setData(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const uploadLogo = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    return data.secure_url || data.url;
  };

  const add = async () => {
    if (!name || !logoFile) return alert("Бүгдийг бөглө");

    const logo = await uploadLogo(logoFile);

    await fetch("/api/competitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, logo }),
    });

    setName("");
    setLogoFile(null);
    load();
  };

  const update = async () => {
    if (!editing) return;

    let logo = editing.logo;
    if (logoFile) {
      logo = await uploadLogo(logoFile);
    }

    await fetch("/api/competitions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing._id,
        name: editing.name,
        logo,
      }),
    });

    setEditing(null);
    setLogoFile(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Устгах уу?")) return;

    await fetch("/api/competitions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    load();
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        Admin — Competitions
      </h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-bold mb-2">
          {editing ? "✏️ Edit Competition" : "➕ Add Competition"}
        </h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Name"
          value={editing ? editing.name : name}
          onChange={(e) =>
            editing
              ? setEditing({ ...editing, name: e.target.value })
              : setName(e.target.value)
          }
        />

        <input
          type="file"
          accept="image/*"
          className="mb-2"
          onChange={(e) =>
            setLogoFile(e.target.files?.[0] || null)
          }
        />

        <button
          onClick={editing ? update : add}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {editing ? "Update" : "Add"}
        </button>

        {editing && (
          <button
            onClick={() => setEditing(null)}
            className="ml-2 text-sm text-gray-500"
          >
            Cancel
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {data.map((c) => (
          <div
            key={c._id}
            className="flex justify-between items-center bg-white p-2 rounded shadow"
          >
            <div className="flex items-center gap-2">
              <img src={c.logo} className="w-8 h-8" />
              <span>{c.name}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditing(c)}
                className="text-blue-500 text-sm"
              >
                ✏️
              </button>

              <button
                onClick={() => remove(c._id)}
                className="text-red-500 text-sm"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
