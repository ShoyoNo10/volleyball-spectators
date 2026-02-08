"use client";
import { useState } from "react";
import { getDeviceId } from "@/src/lib/device";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const deviceId = getDeviceId();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password, deviceId }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    location.href = "/";
  };

  return (
    <div className="p-6">
      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 block mb-2"
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 block mb-2"
      />

      <button onClick={login}>Login</button>
    </div>
  );
}
