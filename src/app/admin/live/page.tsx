"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLive() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (!auth) {
      router.push("/admin/login");
      return;
    }

    fetch("/api/live")
      .then((res) => res.json())
      .then((data) => {
        if (data?.url) {
          setSaved(data.url);
        }
      });
  }, [router]);

  const saveLive = async () => {
    if (!url) return alert("Live линк оруулна уу");

    await fetch("/api/live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    setSaved(url);
    setUrl("");
    alert("Live линк хадгалагдлаа!");
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Manage Live Link</h1>

      <div className="bg-white p-4 rounded-xl shadow max-w-xl">
        <input
          className="w-full border p-3 rounded mb-3"
          placeholder="https://live-stream-link.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={saveLive}
          className="bg-vnl text-white px-6 py-2 rounded"
        >
          💾 Save Live Link
        </button>

        {saved && (
          <p className="text-sm text-green-600 mt-3">
            Current live link: {saved}
          </p>
        )}
      </div>
    </div>
  );
}
