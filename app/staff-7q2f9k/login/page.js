"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/staff-7q2f9k/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/staff-7q2f9k");
    } else {
      const data = await res.json();
      setError(data.error || "មានបញ្ហា");
    }
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6">
      <form onSubmit={submit} className="facet-card bg-panel border border-line p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold mb-6">Admin Login</h1>
        <label className="block text-sm text-ash mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-panel2 border border-line focus:border-gem rounded px-4 py-3 outline-none mb-4"
        />
        {error && <p className="text-magenta text-sm mb-4">{error}</p>}
        <button
          disabled={loading}
          className="w-full facet-card bg-gem text-ink font-display font-bold py-3 disabled:opacity-50"
        >
          {loading ? "..." : "ចូល"}
        </button>
      </form>
    </main>
  );
}
