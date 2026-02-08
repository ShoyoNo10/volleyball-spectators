"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "@/src/lib/device";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);

    const deviceId = getDeviceId();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, deviceId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Login error");
      return;
    }

    router.push("/live");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(80vh-120px)] bg-gradient-to-b from-[#020617] via-[#020617] to-black text-white">
      <div className="relative w-[340px]">
        {/* glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 blur opacity-50" />

        <div className="relative bg-[#020617] border border-white/10 rounded-3xl p-6">
          <h1 className="text-center text-xl font-bold mb-5">
            Нэвтрэх
          </h1>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-3 p-3 rounded-xl bg-[#121726] border border-white/10 focus:border-cyan-400 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-3 rounded-xl bg-[#121726] border border-white/10 focus:border-cyan-400 outline-none"
          />

          <button
            onClick={login}
            className="w-full py-3 rounded-xl bg-cyan-600 font-bold hover:bg-cyan-500 transition"
          >
            {loading ? "..." : "Нэвтрэх"}
          </button>

          <div
            onClick={() => router.push("/signup")}
            className="text-center mt-4 text-xs text-cyan-400 cursor-pointer"
          >
            Бүртгэл үүсгэх
          </div>
        </div>
      </div>
    </div>
  );
}
