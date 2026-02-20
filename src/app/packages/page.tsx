"use client";

import { getDeviceId } from "@/src/lib/device";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const buy = async (months: number) => {
    if (loading !== null) return; // ✅ давхар дарахаас хамгаална

    const deviceId = getDeviceId(); // ✅ нэг удаа аваад бүхэнд ашиглана

    // 🔐 login + device шалгах (ME)
    const meRes = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        "x-device-id": deviceId, // ✅ хамгийн чухал
      },
      credentials: "include", // ✅ cookie заавал явуулна
      cache: "no-store", // ✅ хуучин cached me битгий авчихаар
    });

    const meData = await meRes.json();

    // ✅ өөр төхөөрөмж дээр login хийгдсэн бол
    if (meData.forceLogout) {
      router.push("/login");
      return;
    }

    // ✅ login хийгдээгүй бол popup
    if (!meData.user) {
      setShowLoginPopup(true);
      return;
    }

    setLoading(months);

    const res = await fetch("/api/qpay/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, months }),
      credentials: "include",
      cache: "no-store",
    });

    const data = await res.json();

    setLoading(null);

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-gradient-to-b from-[#020617] via-[#020617] to-black text-white p-4 mb-[60px]">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-xl font-bold mb-1">Pro хэрэглэгч болох</div>
          <div className="text-xs text-gray-400">
            Тоглолт шууд болон нөхөж үзэх эрх
          </div>
        </div>

        <div className="space-y-4">
          <PackageCard
            title="1 сар"
            price="10,000₮"
            onClick={() => buy(1)}
            loading={loading === 1}
          />
          <PackageCard
            title="6 сар"
            price="20,000₮"
            onClick={() => buy(6)}
            loading={loading === 6}
            highlight
          />
          <PackageCard
            title="1 жил"
            price="30,000₮"
            onClick={() => buy(12)}
            loading={loading === 12}
          />
        </div>
      </div>

      {/* 🔥 LOGIN POPUP */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
          <div className="relative w-[320px]">
            {/* glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600 blur opacity-70" />

            {/* card */}
            <div className="relative bg-[#05010b] border border-violet-400/30 rounded-3xl p-6 text-center overflow-hidden">
              {/* radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_60%)]" />

              <div className="relative text-xl font-extrabold mb-2 text-white">
                Нэвтрэх шаардлагатай
              </div>

              <div className="relative text-xs text-violet-200/80 mb-5">
                Эрх сунгахын тулд эхлээд нэвтэрнэ үү
              </div>

              <button
                onClick={() => router.push("/login")}
                className="
            relative w-full py-2.5 rounded-xl font-bold
            bg-gradient-to-r from-violet-600 to-fuchsia-600
            hover:from-violet-500 hover:to-fuchsia-500
            transition-all duration-300
            shadow-[0_0_25px_rgba(168,85,247,0.5)]
            active:scale-95
            mb-2
          "
              >
                Нэвтрэх
              </button>

              <button
                onClick={() => setShowLoginPopup(false)}
                className="relative text-xs text-gray-400 hover:text-white"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageCard({
  title,
  price,
  onClick,
  loading,
  highlight,
}: {
  title: string;
  price: string;
  onClick: () => void;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-300 
  hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(168,85,247,0.35)]
  ${
    highlight
      ? `
        border border-violet-400/60
        bg-linear-to-b from-[#1a0f2e] to-[#070312]
        shadow-[0_0_25px_rgba(168,85,247,0.35)]
      `
      : `
        border border-white/10
        bg-linear-to-b from-[#070312] to-[#020617]
        hover:border-violet-400/40
      `
  }`}
    >
      {/* DISCOUNT (INSIDE TOP-RIGHT) */}

      {title === "1 жил" && (
        <div className="absolute top-3 right-3 z-10 rotate-12">
          <div
            className="
      px-3 py-1 rounded-md
      text-[10px] font-extrabold tracking-widest
      bg-gradient-to-r from-violet-600 to-fuchsia-600
      text-white shadow-md
    "
          >
            -75% ХЭМНЭЛТ
          </div>
        </div>
      )}

      {/* TOP BADGE */}
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div
            className="text-[10px] bg-linear-to-r from-violet-500 to-fuchsia-500
                      px-4 py-1 rounded-full font-bold text-white
                      shadow-lg tracking-widest"
          >
            ХАМГИЙН ИХ АВСАН
          </div>
        </div>
      )}

      <div className="text-center">
        {/* TITLE */}
        <div className="text-lg font-bold mb-1 text-white/90">{title}</div>

        {/* PRICE */}
        <div
          className="text-3xl font-extrabold mb-2
                    bg-linear-to-r from-violet-300 via-fuchsia-300 to-purple-300
                    bg-clip-text text-transparent"
        >
          {price}
        </div>

        {/* SUBTLE LINE */}
        <div className="w-10 h-[2px] bg-violet-500/40 mx-auto mb-3 rounded-full" />

        {/* BUTTON */}
        <button
          className="
      mt-2 w-full py-2.5 rounded-xl font-bold tracking-wide
      bg-linear-to-r from-violet-600 to-fuchsia-600
      hover:from-violet-500 hover:to-fuchsia-500
      transition-all duration-300
      shadow-[0_0_20px_rgba(168,85,247,0.35)]
      active:scale-95
      "
        >
          {loading ? "..." : "Сонгох"}
        </button>
      </div>

      {/* GLOW */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl
                  bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_60%)]"
      />
    </div>
  );
}
