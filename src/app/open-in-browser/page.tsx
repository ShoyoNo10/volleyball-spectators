import { Suspense } from "react";
import OpenInBrowserClient from "./OpenInBrowserClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <OpenInBrowserClient />
    </Suspense>
  );
}