"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/seller/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/seller/dashboard");
    } else {
      const data = await res.json() as { error: string };
      setError(data.error ?? "Błąd logowania");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 md:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[var(--color-charcoal)] tracking-tight">
            Panel Sprzedawcy
          </h1>
          <p className="text-sm text-[var(--color-warm-gray)] mt-1">FashionHero</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-charcoal)] transition"
              placeholder="twoj@email.pl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-charcoal)] transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--color-charcoal)] text-white text-sm font-medium rounded-lg hover:bg-black transition disabled:opacity-50"
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-[var(--color-warm-gray)]">
          Nie masz konta? Skontaktuj się z administratorem.
        </p>
      </div>
    </div>
  );
}
