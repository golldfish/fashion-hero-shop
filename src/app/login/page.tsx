"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

type Role = "buyer" | "seller";

export default function LoginPage() {
  const router = useRouter();
  const { login: buyerLogin, logout: buyerLogout } = useAuth();

  const [role, setRole] = useState<Role>("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (role === "buyer") {
      // Wyloguj ewentualną sesję sellera
      await fetch("/api/seller/logout", { method: "POST" });
      await buyerLogin(email, password);
      router.push("/");
    } else {
      // Wyloguj ewentualną sesję kupującego
      buyerLogout();
      const res = await fetch("/api/seller/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/seller/dashboard");
      } else {
        const data = await res.json() as { error: string };
        setError(data.error ?? "Nieprawidłowy email lub hasło");
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold italic tracking-tight text-[var(--color-charcoal)]">
            FashionHero
          </Link>
          <p className="text-sm text-[var(--color-warm-gray)] mt-1">Zaloguj się do swojego konta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Role selector */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
            {(["buyer", "seller"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(""); }}
                className={[
                  "flex-1 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2",
                  role === r
                    ? "bg-[var(--color-charcoal)] text-white"
                    : "text-[var(--color-warm-gray)] hover:text-[var(--color-charcoal)]",
                ].join(" ")}
              >
                <span>{r === "buyer" ? "🛍️" : "🏪"}</span>
                {r === "buyer" ? "Kupujący" : "Sprzedawca"}
              </button>
            ))}
          </div>

          {/* Context hint */}
          <p className="text-xs text-[var(--color-warm-gray)] text-center mb-6 min-h-[1rem]">
            {role === "buyer"
              ? "Przeglądaj, kupuj i zapisuj ulubione produkty"
              : "Zarządzaj swoimi produktami i promuj je w sklepie"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder={role === "buyer" ? "twoj@email.pl" : "sklep@fashionhero.pl"}
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
                required={role === "seller"}
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
              className="w-full py-3 bg-[var(--color-charcoal)] text-white text-sm font-medium rounded-lg hover:bg-black transition disabled:opacity-50 mt-2"
            >
              {loading ? "Logowanie..." : "Zaloguj się"}
            </button>
          </form>

          {role === "buyer" && (
            <p className="text-center text-xs text-[var(--color-warm-gray)] mt-5">
              Nie masz konta?{" "}
              <Link href="/account/register" className="text-[var(--color-charcoal)] underline underline-offset-2">
                Zarejestruj się
              </Link>
            </p>
          )}
          {role === "seller" && (
            <p className="text-center text-xs text-[var(--color-warm-gray)] mt-5">
              Nie masz konta sprzedawcy? Skontaktuj się z administratorem.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
