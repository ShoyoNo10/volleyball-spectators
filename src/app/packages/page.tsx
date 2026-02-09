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
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-gradient-to-b from-[#020617] via-[#020617] to-black text-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-xl font-bold mb-1">Pro эрх сунгах</div>
          <div className="text-xs text-gray-400">Live болон Replay үзэх эрх</div>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="relative w-[320px]">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 blur opacity-60" />

            <div className="relative bg-[#020617] border border-white/10 rounded-3xl p-6 text-center">
              <div className="text-lg font-bold mb-2">Нэвтрэх шаардлагатай</div>

              <div className="text-xs text-gray-400 mb-5">
                Эрх сунгахын тулд эхлээд нэвтэрнэ үү
              </div>

              <button
                onClick={() => router.push("/login")}
                className="w-full py-2 rounded-xl bg-cyan-600 font-bold hover:bg-cyan-500 mb-2"
              >
                Нэвтрэх
              </button>

              <button
                onClick={() => setShowLoginPopup(false)}
                className="text-xs text-gray-400"
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
      className={`relative rounded-2xl p-5 cursor-pointer transition hover:scale-[1.02]
      ${
        highlight
          ? "border border-cyan-400/50 bg-cyan-500/10"
          : "border border-white/10 bg-[#020617]"
      }`}
    >
      {highlight && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-cyan-500 px-3 py-1 rounded-full font-bold">
          ХАМГИЙН ИХ АВСАН
        </div>
      )}

      <div className="text-center">
        <div className="text-lg font-bold mb-1">{title}</div>
        <div className="text-2xl font-extrabold text-cyan-400">{price}</div>

        <button className="mt-4 w-full py-2 rounded-xl bg-cyan-600 font-bold hover:bg-cyan-500">
          {loading ? "..." : "Сонгох"}
        </button>
      </div>
    </div>
  );
}
