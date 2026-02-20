"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ⭐ popup state
  const [showWarn, setShowWarn] = useState(false);
  const [confirmedWarn, setConfirmedWarn] = useState(false);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Нууц үг 8+ тэмдэгт байх ёстой";
    if (!/[A-Z]/.test(pass)) return "Том үсэг оруулна уу";
    if (!/[a-z]/.test(pass)) return "Жижиг үсэг оруулна уу";
    if (!/[0-9]/.test(pass)) return "Тоо оруулна уу";
    if (!/[!@#$%^&*]/.test(pass)) return "Тусгай тэмдэгт оруулна уу";
    return "";
  };

  const doSignup = async () => {
    setError("");

    if (!username.trim()) {
      setError("Username оруулна уу");
      return;
    }
    if (!password) {
      setError("Нууц үг оруулна уу");
      return;
    }

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

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError((data as any)?.error || "Алдаа гарлаа");
      return;
    }

    setSuccess(true);

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  const signup = async () => {
    // ⭐ эхний удаа анхааруулга popup харуулна
    if (!confirmedWarn) {
      setShowWarn(true);
      return;
    }
    await doSignup();
  };

  // ⭐ popup нээлттэй үед ESC дарвал хаах
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showWarn) setShowWarn(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showWarn]);

  return (
    <div className="flex items-center justify-center min-h-[calc(80vh-100px)] bg-gradient-to-b from-[#020617] via-[#020617] to-black text-white">
      <div className="relative w-[340px]">
        {/* glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 via-purple-600 to-purple-600 blur opacity-50" />

        <div className="relative bg-[#020617] border border-white/10 rounded-3xl p-6">
          {!success ? (
            <>
              <h1 className="text-center text-xl font-extrabold mb-5">
                Бүртгэл үүсгэх
              </h1>

              <input
                placeholder="Нэвтрэх нэр"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="w-full mb-3 p-3 rounded-xl bg-[#121726] border border-white/10 focus:border-cyan-400 outline-none"
              />

              <input
                type="password"
                placeholder="Нууц үг"
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
                disabled={loading}
                className="w-full py-3 mt-4 rounded-xl bg-purple-600 font-bold hover:bg-purple-500 transition disabled:opacity-60 disabled:hover:bg-purple-600"
              >
                {loading ? "..." : "Бүртгүүлэх"}
              </button>

              <div
                onClick={() => router.push("/login")}
                className="text-center mt-4 text-xs text-white cursor-pointer"
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

      {/* ⭐ WARNING POPUP */}
      {showWarn && !success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowWarn(false)}
          />

          {/* modal */}
          <div className="relative w-full max-w-[420px]">
            {/* neon glow frame */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 blur opacity-60" />

            <div className="relative rounded-3xl border border-white/10 bg-[#050812] p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
              <div className="text-lg font-bold mb-2 flex items-center gap-2">Анхааруулга <Info size={20} /></div>

              <div className="text-sm text-gray-300 leading-relaxed flex gap-1 items-start">
               Нэвтрэх нэр болон нууц үгээ мартсан тохиолдолд сэргээх
                боломжгүй. Иймд мартахгүй нууц үг сонгох эсвэл мэдээллээ хадгалж
                авна уу.
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setShowWarn(false)}
                  className="flex py-2.5 px-1 rounded-xl border border-white/15 text-gray-200 hover:bg-white/5 transition"
                >
                  Буцах
                </button>

                <button
                  onClick={() => {
                    setConfirmedWarn(true);
                    setShowWarn(false);
                    // ⭐ зөвшөөрсөн тул яг одоо signup үргэлжлүүлнэ
                    doSignup();
                  }}
                  className="flex py-2.5 px-1 rounded-xl bg-purple-600 font-bold hover:bg-purple-500 disabled:opacity-60 disabled:hover:bg-purple-600 transition"
                >
                  Ойлголоо, үргэлжлүүлэх
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
