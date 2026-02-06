"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "@/src/lib/device";
import { useRouter } from "next/navigation";

export default function RequireAccess({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ok, setOk] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const deviceId = getDeviceId();

      const res = await fetch("/api/access", {
        method: "POST",
        body: JSON.stringify({ deviceId }),
      });

      const data = await res.json();
      setOk(data.access);

      if (!data.access) router.push("/packages");
    };

    check();
  }, []);

  if (ok === null) return null;
  return <>{children}</>;
}
