"use client";

import { useState } from "react";

const SITE_URL = "https://www.volleylive.mn";

export default function OpenInBrowserClient() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      alert("Хуулах боломжгүй байна. Доорх хаягийг удаан дараад Copy хийнэ үү.");
    }
  };

  return (
  <div className="min-h-[calc(100vh-90px)] flex items-center justify-center p-6 pb-30">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-neutral-900/60 backdrop-blur p-6">
          <div className="text-lg font-semibold mb-3">
            Facebook дотор төлбөр хийх боломжгүй.
          </div>

          <div className="text-sm text-white/70 leading-relaxed">
            Safari эсвэл Google Chrome вэб хөтөч ашиглан доорх хаягаар нэвтэрнэ үү:
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <div className="text-center text-xl font-semibold tracking-wide">
              www.volleylive.mn
            </div>
          </div>

          <div className="mt-4 text-sm text-white/70 leading-relaxed">
            Сайтад орсны дараа <span className="text-white font-medium">“Төлөх”</span> товчийг дарж
            төлбөрөө хийнэ үү.
          </div>

          <button
            onClick={copy}
            className="mt-6 w-full rounded-2xl border border-white/10 bg-white text-black font-semibold py-3 hover:bg-white/90 active:scale-[0.99] transition"
          >
            ЛИНК ХУУЛАХ
          </button>

          {/* tiny toast */}
          {copied && (
            <div className="mt-3 text-center text-xs text-white/60">
              Хууллаа ✅
            </div>
          )}

          <div className="mt-3 text-center text-xs text-white/35 break-all">
            {SITE_URL}
          </div>
        </div>
      </div>
    </div>
  );
}