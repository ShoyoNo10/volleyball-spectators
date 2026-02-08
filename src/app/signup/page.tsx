"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // ⭐ NEW

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Нууц үг 8+ тэмдэгт байх ёстой";
    if (!/[A-Z]/.test(pass)) return "Том үсэг оруулна уу";
    if (!/[a-z]/.test(pass)) return "Жижиг үсэг оруулна уу";
    if (!/[0-9]/.test(pass)) return "Тоо оруулна уу";
    if (!/[!@#$%^&*]/.test(pass)) return "Тусгай тэмдэгт оруулна уу";
    return "";
  };

  const signup = async () => {
    setError("");

    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Алдаа гарлаа");
      return;
    }

    // ⭐ SUCCESS MODE
    setSuccess(true);

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(80vh-100px)] bg-gradient-to-b from-[#020617] via-[#020617] to-black text-white">
      <div className="relative w-[340px]">

        {/* glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500 blur opacity-50" />

        <div className="relative bg-[#020617] border border-white/10 rounded-3xl p-6">

          {!success ? (
            <>
              <h1 className="text-center text-xl font-bold mb-5">
                Бүртгэл үүсгэх
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full p-3 rounded-xl bg-[#121726] border border-white/10 focus:border-cyan-400 outline-none"
              />

              {/* password rule */}
              {password && (
                <div className="text-[11px] mt-2 text-gray-400">
                  8+ тэмдэгт, Том үсэг, Жижиг үсэг, Тоо, Тусгай тэмдэгт
                </div>
              )}

              {/* error */}
              {error && (
                <div className="text-red-500 text-xs mt-2 font-semibold">
                  {error}
                </div>
              )}

              <button
                onClick={signup}
                className="w-full py-3 mt-4 rounded-xl bg-purple-600 font-bold hover:bg-purple-500 transition"
              >
                {loading ? "..." : "Бүртгүүлэх"}
              </button>

              <div
                onClick={() => router.push("/login")}
                className="text-center mt-4 text-xs text-cyan-400 cursor-pointer"
              >
                Нэвтрэх
              </div>
            </>
          ) : (
            // ⭐ SUCCESS VIEW
            <div className="text-center py-8">
              <div className="text-green-400 text-3xl mb-2">✓</div>

              <div className="font-bold text-lg mb-2">
                Амжилттай бүртгэгдлээ
              </div>

              <div className="text-xs text-gray-400">
                Нэвтрэх хуудас руу шилжиж байна...
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
