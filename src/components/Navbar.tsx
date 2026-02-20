"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Gem, User2, Globe, Phone, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { getDeviceId } from "@/src/lib/device";
import Image from "next/image";

type MeResponse = {
  user: string | null;
  isPro: boolean;
  forceLogout?: boolean;
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<MeResponse>({ user: null, isPro: false });
  const [loadingMe, setLoadingMe] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const redirectedRef = useRef(false);

  const fetchMe = async () => {
    try {
      const deviceId = getDeviceId();

      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        headers: {
          "cache-control": "no-cache",
          "x-device-id": deviceId,
        },
      });

      const data: MeResponse = await res.json();
      const onAuthPage = pathname === "/login" || pathname === "/signup";

      if (data.forceLogout) {
        setMe({ user: null, isPro: false });

        if (!onAuthPage && !redirectedRef.current) {
          redirectedRef.current = true;
          router.replace("/login");
        }
        return;
      }

      redirectedRef.current = false;
      setMe({ user: data.user, isPro: !!data.isPro });
    } catch {
      setMe({ user: null, isPro: false });
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    fetchMe();

    const onFocus = () => fetchMe();
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchMe();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe({ user: null, isPro: false });
    router.replace("/login");
  };

  return (
    <nav className="bg-vnl text-white px-4 py-3">
      <div className="flex justify-between items-center gap-2">
        <Image
          src="/volleylogo.png"
          alt="VNL Logo"
          width={120}
          height={100}
          className="object-contain"
        />
        {/* <h1 className="font-bold text-lg md:text-xl shrink-0">VOLLEY LIVE</h1> */}

        {/* RIGHT AREA */}
        <div className="flex items-center gap-2 ml-auto">
          {/* ✅ Username / Login button — GADNA TALD (☰-ийн хажууд) */}
          {loadingMe ? (
            <div className="w-20 h-9 rounded-full bg-white/10 animate-pulse" />
          ) : me.user ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/10 max-w-40">
              <User2 className="w-4 h-4 opacity-80 shrink-0" />
              <span className="text-xs font-semibold truncate">{me.user}</span>
              {me.isPro && (
                <>
                  {/* gradient defs */}
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <linearGradient
                        id="proGem"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#e9d5ff" />
                        <stop offset="40%" stopColor="#e9d5ff" />
                        <stop offset="70%" stopColor="#e9d5ff" />
                        <stop offset="100%" stopColor="#e9d5ff" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <Gem
                    className="w-4 h-4 shrink-0"
                    stroke="url(#proGem)"
                    style={{
                      filter: `
          drop-shadow(0 0 6px rgba(168,85,247,0.9))
          drop-shadow(0 0 12px rgba(192,132,252,0.9))
          drop-shadow(0 0 22px rgba(168,85,247,0.8))
          drop-shadow(0 0 38px rgba(147,51,234,0.7))
        `,
                    }}
                  />
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-2 rounded-full border border-white/20 hover:bg-white/10 text-xs font-semibold"
            >
              Нэвтрэх
            </Link>
          )}

          {/* Mobile button */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setOpen(!open)}
            aria-label="menu"
          >
            ☰
          </button>

          {/* ✅ Desktop menu — GOY BOLGOSON (mobile-д огт нөлөөгүй) */}
          <div className="hidden md:flex items-center gap-3 ml-4">
            {/* Links group */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
              <Link
                href="/ranking"
                className="group flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition"
              >
                <Globe className="w-4 h-4 opacity-80 group-hover:opacity-100" />
                <span className="relative">
                  Дэлхийн чансаа
                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-white/70 group-hover:w-full transition-all" />
                </span>
              </Link>
              <Link
                href="/contact"
                className="group flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition"
              >
                <Phone className="w-4 h-4 opacity-80 group-hover:opacity-100" />
                <span className="relative">
                  Холбогдох
                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-white/70 group-hover:w-full transition-all" />
                </span>
              </Link>
            </div>

            {/* Auth group */}
            <div className="flex items-center gap-2 pl-2">
              {!me.user ? (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition"
                  >
                    Нэвтрэх
                  </Link>

                  <Link
                    href="/signup"
                    className="
                      px-4 py-2 rounded-full text-sm font-bold text-black
                      bg-white hover:bg-white/90 transition
                      shadow-[0_0_0_1px_rgba(255,255,255,0.25)]
                    "
                  >
                    Бүртгүүлэх
                  </Link>
                </>
              ) : (
                <button
                  onClick={logout}
                  className="
                    group flex items-center gap-2 px-4 py-2 rounded-full
                    bg-red-500/15 border border-red-400/30
                    hover:bg-red-500/25 hover:border-red-300/40 transition
                    text-sm font-semibold
                  "
                >
                  <LogOut className="w-4 h-4 opacity-80 group-hover:opacity-100" />
                  Гарах
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu (өөрчлөхгүй) */}
      {open && (
        <div className="flex flex-col mt-3 md:hidden">
          <div className="flex flex-col space-y-2 ">
            <Link
              href="/ranking"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1"
            >
              <Globe size={18} />
              Дэлхийн чансаа
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1"
            >
              <Phone size={18} />
              Холбогдох
            </Link>
          </div>

          <div className="border-t border-white/20 my-3" />

          {!me.user ? (
            <div className="flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-center py-2 rounded-md border border-white/20"
              >
                Нэвтрэх
              </Link>

              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="text-center py-2 rounded-md bg-white text-black font-bold"
              >
                Бүртгүүлэх
              </Link>
            </div>
          ) : (
            <button
              onClick={logout}
              className="text-center py-2 rounded-md bg-red-500/20 border border-red-400/40"
            >
              Гарах
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
