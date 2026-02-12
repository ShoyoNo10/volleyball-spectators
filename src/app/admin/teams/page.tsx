"use client";

import { useEffect, useState } from "react";

interface Team {
  _id: string;
  name: string;
  code: string;
  gender: "men" | "women";
  flagUrl: string;
}

type Form = Omit<Team, "_id">;

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);

  const [flagFile, setFlagFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm: Form = {
    name: "",
    code: "",
    gender: "men",
    flagUrl: "/flag.png",
  };

  const [form, setForm] = useState<Form>(emptyForm);

  const load = async () => {
    const res = await fetch("/api/teams");
    const data = await res.json();
    setTeams(Array.isArray(data) ? data : []);
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

  const data: unknown = await res.json();

  if (!data || typeof data !== "object") {
    throw new Error("Upload response is not object");
  }

  const obj = data as
    | { url: string }
    | { secure_url: string }
    | { secureUrl: string };

  let url: string | undefined;

  if ("url" in obj && typeof obj.url === "string") {
    url = obj.url;
  } else if ("secure_url" in obj && typeof obj.secure_url === "string") {
    url = obj.secure_url;
  } else if ("secureUrl" in obj && typeof obj.secureUrl === "string") {
    url = obj.secureUrl;
  }

  if (!url) {
    throw new Error("Upload response missing url");
  }

  return url;
};


  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFlagFile(null);
  };

  const addOrUpdate = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      return alert("Name / Code хоосон байна");
    }

    try {
      setUploading(true);

      let flagUrl = form.flagUrl;

      // ✅ шинэ файл сонгосон бол upload
      if (flagFile) {
        flagUrl = await uploadFlag(flagFile);
      }

      const payload: Form = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        gender: form.gender,
        flagUrl,
      };

      if (editingId) {
        await fetch("/api/teams", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, update: payload }),
        });
      } else {
        await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      reset();
      load();
    } catch (err) {
      console.error("TEAM SAVE ERROR:", err);
      alert("Flag upload / Team save алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Устгах уу?")) return;

    await fetch("/api/teams", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    load();
  };

  const edit = (t: Team) => {
    setEditingId(t._id);
    setForm({
      name: t.name,
      code: t.code,
      gender: t.gender,
      flagUrl: t.flagUrl || "/flag.png",
    });
    setFlagFile(null);
  };

  // ✅ UI classes (тод, цэвэрхэн)
  const card = "bg-white rounded-2xl shadow-sm border border-black/10";
  const label = "block text-sm font-bold text-black mb-1";
  const input =
    "border border-black/20 bg-white text-black placeholder:text-gray-500 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-black/20 w-full";
  const btn =
    "px-4 py-2 rounded-xl font-bold transition disabled:opacity-50";
  const btnPrimary = `${btn} bg-black text-white hover:opacity-90`;
  const btnSoft = `${btn} bg-gray-100 text-black border border-black/10 hover:bg-gray-200`;
  const btnDanger = `${btn} bg-red-600 text-white hover:opacity-90`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-black">Admin — Teams</h1>
          <div className="text-sm text-gray-600">
            Add • Edit • Delete
          </div>
        </div>

        {/* FORM */}
        <div className={`${card} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-black">
              {editingId ? "✏️ Edit Team" : "➕ Add Team"}
            </h2>

            {editingId && (
              <button onClick={reset} className={btnSoft}>
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className={label}>Name</label>
              <input
                className={input}
                placeholder="Argentina"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Code</label>
              <input
                className={input}
                placeholder="ARG"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Gender</label>
              <select
                className={input}
                value={form.gender}
                onChange={(e) =>
                  setForm({ ...form, gender: e.target.value as "men" | "women" })
                }
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>

            <div>
              <label className={label}>Flag (Upload)</label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-black"
                onChange={(e) => setFlagFile(e.target.files?.[0] || null)}
                disabled={uploading}
              />
            </div>

            {/* Preview */}
            <div className="md:col-span-4 flex items-center gap-3 mt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.flagUrl || "/flag.png"}
                alt="flag"
                className="w-16 h-12 object-cover rounded-xl border border-black/10 bg-white"
              />
              <div className="text-xs text-gray-700 break-all">
                {flagFile ? "Шинэ зураг сонгогдсон ✅" : form.flagUrl}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={addOrUpdate} disabled={uploading} className={btnPrimary}>
              {uploading
                ? "Saving..."
                : editingId
                ? "💾 Save Changes"
                : "➕ Add Team"}
            </button>
            <button onClick={reset} className={btnSoft}>
              Clear
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div key={t._id} className={`${card} p-4 flex justify-between gap-3`}>
              <div className="flex gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.flagUrl || "/flag.png"}
                  alt=""
                  className="w-14 h-10 object-cover rounded-xl border border-black/10"
                />

                <div className="min-w-0">
                  <div className="font-extrabold text-black truncate">
                    {t.name}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-bold">{t.code}</span> •{" "}
                    <span className="capitalize">{t.gender}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => edit(t)} className={btnSoft}>
                  ✏️
                </button>
                <button onClick={() => remove(t._id)} className={btnDanger}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}
