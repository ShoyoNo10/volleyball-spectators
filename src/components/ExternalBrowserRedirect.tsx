"use client";
import { useEffect } from "react";

export default function ExternalBrowserRedirect() {
  useEffect(() => {
    const ua = navigator.userAgent || "";

    const isInApp =
      ua.includes("FBAN") ||
      ua.includes("FBAV") ||
      ua.includes("Instagram") ||
      ua.includes("Messenger");

    if (!isInApp) return;

    const url = window.location.href;

    // iOS → Safari/Chrome руу
    if (/iPhone|iPad|iPod/.test(ua)) {
      window.location.href =
        "googlechrome://" + url.replace(/^https?:\/\//, "");
      return;
    }

    // Android → Chrome руу
    if (/Android/.test(ua)) {
      window.location.href =
        "intent://" +
        url.replace(/^https?:\/\//, "") +
        "#Intent;scheme=https;package=com.android.chrome;end";
    }
  }, []);

  return null;
}
