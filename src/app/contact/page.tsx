"use client";

import { Phone, Facebook, Instagram } from "lucide-react";

export default function ContactPage() {
  const phoneNumber = "+97699112233";
  const facebookUrl = "https://www.facebook.com/yourpage";
  const instagramUrl = "https://www.instagram.com/yourpage";

  return (
    <div
      className="
        min-h-[calc(100vh-120px)]
        bg-gradient-to-b from-[#020617] via-[#020617] to-black
        flex items-center justify-center
        px-4
      "
    >
      {/* GLOW CONTAINER */}
      <div className="relative w-full max-w-md">
        {/* OUTER GLOW */}
        <div
          className="
            absolute -inset-1 rounded-3xl
            bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600
            blur opacity-60
            animate-pulse
          "
        />

        {/* INNER BOX */}
        <div className="relative bg-[#020617] rounded-3xl border border-white/10 p-6 text-white shadow-xl">
          {/* HEADER */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-wide text-cyan-300">
              Холбогдох
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Доорх товчлууруудаар бидэнтэй шууд холбогдоорой
            </p>
          </div>

          {/* BUTTONS */}
          <div className="space-y-4">
            {/* PHONE */}
            <a
              href={`tel:${phoneNumber}`}
              className="
                flex items-center justify-center gap-3
                w-full py-3 rounded-xl font-bold tracking-wide
                bg-gradient-to-r from-green-600 to-green-500
                hover:scale-[1.05] transition
                shadow-lg
              "
            >
              <Phone />
              <span>Утсаар холбогдох</span>
            </a>

            {/* FACEBOOK */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center justify-center gap-3
                w-full py-3 rounded-xl font-bold tracking-wide
                bg-gradient-to-r from-blue-700 to-blue-500
                hover:scale-[1.05] transition
                shadow-lg
              "
            >
              <Facebook />
              <span>Facebook хуудас</span>
            </a>

            {/* INSTAGRAM */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center justify-center gap-3
                w-full py-3 rounded-xl font-bold tracking-wide
                bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500
                hover:scale-[1.05] transition
                shadow-lg
              "
            >
              <Instagram />
              <span>Instagram</span>
            </a>
          </div>

          {/* FOOTER */}
          <div className="text-center text-xs text-gray-500 mt-6">
            © {new Date().getFullYear()} Volley Live • All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
}
