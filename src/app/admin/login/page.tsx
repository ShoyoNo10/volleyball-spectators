"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // Түр admin account
    if (username === "admin" && password === "1234") {
      localStorage.setItem("adminAuth", "true");
      router.push("/admin/dashboard");
    } else {
      alert("Буруу нэр эсвэл нууц үг байна");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-vnl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[90%] max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">
          Admin Login
        </h1>

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-3 rounded mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-vnl text-white py-3 rounded-lg"
        >
          Login
        </button>
      </div>
    </div>
  );
}
