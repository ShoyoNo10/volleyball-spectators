"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert("Бүртгэл амжилттай");
    router.push("/login");
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

      <button onClick={signup}>Sign up</button>
    </div>
  );
}
