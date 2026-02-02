"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const HIDDEN_ROUTES = ["/admin"];

export default function FooterWrapper() {
  const pathname = usePathname();

  const hide = HIDDEN_ROUTES.some(
    (route) =>
      pathname === route || pathname.startsWith(route + "/")
  );

  if (hide) return null;

  return <Footer />;
}
