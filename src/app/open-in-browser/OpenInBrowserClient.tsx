"use client";

import { useSearchParams } from "next/navigation";

export default function OpenInBrowserClient() {
  const sp = useSearchParams();
  const to = sp.get("to") ? decodeURIComponent(sp.get("to") as string) : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(to);
      alert("Линк хууллаа ✅");
    } catch {
      alert("Хуулах боломжгүй байна. Доорх линк дээр удаан дараад Copy хийнэ үү.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-white/10 rounded-3xl p-6 bg-white/5">
        <div className="text-xl font-bold mb-2">Төлбөр хийхийн тулд</div>
        <div className="text-sm text-white/70 mb-5">
          Facebook/Instagram доторх browser deeplink дэмждэггүй. Доорх алхмаар
          Chrome/Safari дээр нээгээд төлнө үү.
        </div>

        <ol className="text-sm space-y-2 mb-5 text-white/80 list-decimal pl-5">
          <li>Баруун дээд талын <b>…</b> дар</li>
          <li>
            <b>Open in Browser</b> / <b>Open in Safari</b> / <b>Open in Chrome</b> сонго
          </li>
          <li>Дахиад “Төлөх” дар</li>
        </ol>

        <div className="flex gap-2">
          <button
            onClick={copy}
            className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10"
          >
            Линк хуулах
          </button>

          <a
            href={to || "/"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-center font-semibold"
          >
            Шинэ tab нээх
          </a>
        </div>

        {to ? <div className="mt-4 text-xs text-white/50 break-all">{to}</div> : null}
      </div>
    </div>
  );
}