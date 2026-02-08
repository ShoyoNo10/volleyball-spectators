"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "@/src/lib/device";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(""); // 🔴 error state
  const [success, setSuccess] = useState(false); // 🟢 success state

  const login = async () => {
    setError("");
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
      setError(data.error || "Нэвтрэхэд алдаа гарлаа");
      return;
    }

    // 🟢 SUCCESS MODE
    setSuccess(true);

    setTimeout(() => {
      router.push("/live");
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(80vh-120px)] bg-gradient-to-b from-[#020617] via-[#020617] to-black text-white">
      <div className="relative w-[340px]">
        {/* glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 blur opacity-50" />

        <div className="relative bg-[#020617] border border-white/10 rounded-3xl p-6">
          {!success ? (
            <>
              <h1 className="text-center text-xl font-bold mb-5">Нэвтрэх</h1>

              <input
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="w-full mb-3 p-3 rounded-xl bg-[#121726] border border-white/10 focus:border-cyan-400 outline-none"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full p-3 rounded-xl bg-[#121726] border border-white/10 focus:border-cyan-400 outline-none"
              />

              {/* 🔴 error */}
              {error && (
                <div className="text-red-500 text-xs mt-2 font-semibold">
                  {error}
                </div>
              )}

              <button
                onClick={login}
                className="w-full py-3 mt-4 rounded-xl bg-cyan-600 font-bold hover:bg-cyan-500 transition"
              >
                {loading ? "..." : "Нэвтрэх"}
              </button>

              <div
                onClick={() => router.push("/signup")}
                className="text-center mt-4 text-xs text-cyan-400 cursor-pointer"
              >
                Бүртгэл үүсгэх
              </div>
            </>
          ) : (
            // 🟢 SUCCESS VIEW
            <div className="text-center py-8">
              <div className="text-green-400 text-3xl mb-2">✓</div>

              <div className="font-bold text-lg mb-2">Амжилттай нэвтэрлээ</div>

              <div className="text-xs text-gray-400">
                Шууд дамжуулалт руу орж байна...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
