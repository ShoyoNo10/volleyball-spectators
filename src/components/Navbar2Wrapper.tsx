"use client";

import { usePathname } from "next/navigation";
import Navbar2 from "./Navbar2";

const HIDDEN_ROUTES = ["/live", "/packages"];

export default function Navbar2Wrapper() {
  const pathname = usePathname();

  const hide = HIDDEN_ROUTES.some(
    (route) =>
      pathname === route || pathname.startsWith(route + "/")
  );

  if (hide) return null;

  return <Navbar2 />;
}
