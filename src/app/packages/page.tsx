"use client";
import { getDeviceId } from "@/src/lib/device";

async function buy(months: number) {
  const deviceId = getDeviceId();

  const res = await fetch("/api/qpay/create", {
    method: "POST",
    body: JSON.stringify({ deviceId, months }),
  });

  const data = await res.json();

  // 🔥 ЭНЭ ХАМГИЙН ЧУХАЛ
  window.location.href = data.url;
}

export default function Page() {
  return (
    <div>
      <button onClick={() => buy(1)}>1 сар</button>
      <button onClick={() => buy(6)}>6 сар</button>
      <button onClick={() => buy(12)}>1 жил</button>
    </div>
  );
}
