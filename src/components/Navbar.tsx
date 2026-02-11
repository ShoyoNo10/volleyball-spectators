"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Gem, User2, Globe, Phone } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { getDeviceId } from "@/src/lib/device";

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
        <h1 className="font-bold text-lg md:text-xl shrink-0">VOLLEY LIVE</h1>

        {/* RIGHT AREA */}
        <div className="flex items-center gap-2 ml-auto">
          {/* ✅ Username / Login button — GADNA TALD (☰-ийн хажууд) */}
          {loadingMe ? (
            <div className="w-20 h-9 rounded-full bg-white/10 animate-pulse" />
          ) : me.user ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/10 max-w-40">
              <User2 className="w-4 h-4 opacity-80 shrink-0" />
              <span className="text-xs font-semibold truncate">{me.user}</span>
              {me.isPro && <Gem className="w-4 h-4 text-cyan-300 shrink-0" />}
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

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6 items-center ml-3">
            <Link href="/contact">
              <Phone />
              Холбогдох
            </Link>
            <Link href="/ranking">Дэлхийн чансаа</Link>

            {/* Desktop auth block */}
            <div className="ml-6 flex gap-2 items-center">
              {!me.user ? (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-1 rounded-md border border-white/20 hover:bg-white/10"
                  >
                    Нэвтрэх
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-1 rounded-md bg-white text-black font-bold"
                  >
                    Бүртгүүлэх
                  </Link>
                </>
              ) : (
                <button
                  onClick={logout}
                  className="px-3 py-1 rounded-md bg-red-500/20 border border-red-400/40 hover:bg-red-500/30 text-sm"
                >
                  Гарах
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col mt-3 md:hidden">
          <div className="flex flex-col space-y-2">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              <Phone size={18} />
              Холбогдох
            </Link>

            <Link
              href="/ranking"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              <Globe size={18} />
              Дэлхийн чансаа
            </Link>
          </div>

          <div className="border-t border-white/20 my-3" />

          {/* ✅ Mobile menu дотор username давхар харуулахгүй */}
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
