"use client";
import { useEffect, useState } from "react";

export default function ExternalBrowserRedirect() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";

    const isInApp =
      ua.includes("FBAN") ||
      ua.includes("FBAV") ||
      ua.includes("Instagram") ||
      ua.includes("Messenger");

    if (isInApp) setShow(true);
  }, []);

  if (!show) return null;

  const openBrowser = () => {
    const url = window.location.href;

    // iOS
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      window.location.href = "https://" + url.replace(/^https?:\/\//, "");
    }

    // Android
    else {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-black text-white p-4 rounded-xl shadow-lg text-center">
      <div className="text-sm mb-2">
        Сайтыг Safari эсвэл Chrome дээр нээвэл илүү сайн ажиллана
      </div>

      <button
        onClick={openBrowser}
        className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold"
      >
        Browser дээр нээх
      </button>
    </div>
  );
}
