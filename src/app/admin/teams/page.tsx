"use client";

import { useEffect, useState } from "react";

interface Team {
  _id: string;
  name: string;
  code: string;
  gender: "men" | "women";
  flagUrl: string;
}

export default function AdminTeams() {
  const [flagFile, setFlagFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState<Omit<Team, "_id">>({
    name: "",
    code: "",
    gender: "men",
    flagUrl: "",
  });

  const load = async () => {
    const res = await fetch("/api/teams");
    const data = await res.json();
    setTeams(data);
  };

  useEffect(() => {
    load();
  }, []);
  const uploadFlag = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      throw new Error("Flag upload failed");
    }

    const data: { url: string } = await res.json();
    return data.url;
  };

  const addTeam = async () => {
    try {
      setUploading(true);

      let flagUrl = form.flagUrl;

      if (flagFile) {
        flagUrl = await uploadFlag(flagFile);
      }

      await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          flagUrl,
        }),
      });

      setForm({ name: "", code: "", gender: "men", flagUrl: "" });
      setFlagFile(null);
      load();
    } catch (err) {
      console.error("ADD TEAM ERROR:", err);
      alert("Flag upload / Team save алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    await fetch("/api/teams", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin — Teams</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <input
          placeholder="Name"
          className="border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Code (ARG)"
          className="border p-2 rounded"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <select
          className="border p-2 rounded"
          value={form.gender}
          onChange={(e) =>
            setForm({
              ...form,
              gender: e.target.value as "men" | "women",
            })
          }
        >
          <option value="men">Men</option>
          <option value="women">Women</option>
        </select>
        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded"
          onChange={(e) => setFlagFile(e.target.files?.[0] || null)}
        />
      </div>

      <button onClick={addTeam} className="bg-vnl text-white px-4 py-2 rounded">
        ➕ Add Team
      </button>

      <div className="mt-6 space-y-2">
        {teams.map((t) => (
          <div
            key={t._id}
            className="flex justify-between bg-white p-2 rounded shadow"
          >
            <div>
              {t.name} ({t.code}) — {t.gender}
            </div>
            <button onClick={() => remove(t._id)} className="text-red-500">
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
