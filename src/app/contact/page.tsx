"use client";

import { Phone, Facebook, Instagram } from "lucide-react";

const PHONE_NUMBER = "+97689251998"; // 🔥 энд өөрийн дугаараа оруул
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61574986497630&mibextid=wwXIfr&rdid=uX0HztH4V2lLE6AF&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DJ8E7gJN4%2F%3Fmibextid%3DwwXIfr#";
const INSTAGRAM_URL = "https://www.instagram.com/clutchsports_mongolia?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

export default function ContactPage() {
  const handlePhoneClick = () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `tel:${PHONE_NUMBER}`;
    } else {
      navigator.clipboard.writeText(PHONE_NUMBER);
      alert(
        `📋 Утасны дугаарыг хууллаа:\n${PHONE_NUMBER}\n\nТа гар утсаараа залгаарай 📱`,
      );
    }
  };

  return (
   <div className="fixed inset-0 bg-gradient-to-b from-[#020617] via-[#020617] to-black flex items-center justify-center p-4 z-0">

      {/* GLOW WRAPPER */}
      <div className="relative w-full max-w-sm">
        {/* OUTER GLOW */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 blur opacity-70 animate-pulseGlow" />

        {/* CARD */}
        <div className="relative bg-[#0b1220] rounded-3xl border border-white/10 p-6 text-white shadow-2xl">
          {/* TITLE */}
          <h1 className="text-center text-2xl font-bold text-cyan-300 mb-2 tracking-wide">
            Холбогдох
          </h1>

          <p className="text-center text-sm text-gray-400 mb-6">
            Доорх товчлууруудаар бидэнтэй шууд холбогдоорой
          </p>

          {/* BUTTONS */}
          <div className="space-y-4">
            {/* PHONE */}
            <button
              onClick={handlePhoneClick}
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
            </button>

            {/* FACEBOOK */}
            <a
              href={FACEBOOK_URL}
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
              href={INSTAGRAM_URL}
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
          <div className="text-center text-[10px] text-gray-500 mt-6">
            © 2026 ClutchSports 
          </div>
        </div>
      </div>

      {/* ANIMATIONS */}
      {/* <style jsx global>{`
        @keyframes pulseGlow {
          0% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            opacity: 0.4;
          }
        }

        .animate-pulseGlow {
          animation: pulseGlow 3s ease-in-out infinite;
        }
      `}</style> */}
    </div>
  );
}
