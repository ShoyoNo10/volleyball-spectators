"use client";

export default function OpenInBrowserClient() {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText("https://www.volleylive.mn");
      alert("www.volleylive.mn хууллаа ✅");
    } catch {
      alert("Хуулах боломжгүй байна. Доорх хаягийг удаан дараад copy хийнэ үү.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-white/10 rounded-3xl p-6 bg-white/5 text-center">
        
        <div className="text-xl font-bold mb-4">
          Төлбөр хийхийн тулд
        </div>

        <div className="text-sm text-white/70 mb-6">
          Facebook доторх browser-оос төлбөр хийх боломжгүй.
        </div>

        <div className="text-base font-semibold mb-3">
          Safari эсвэл Google Chrome дээр
        </div>

        <div className="text-2xl font-bold text-purple-400 mb-6">
          www.volleylive.mn
        </div>

        {/* COPY BUTTON */}
        <button
          onClick={copy}
          className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 font-semibold mb-6"
        >
          Линк хуулах
        </button>

        <div className="text-sm text-white/60">
          Browser дээр paste хийгээд орж<br />
          “Төлөх” товчийг дахин дарна уу.
        </div>

      </div>
    </div>
  );
}