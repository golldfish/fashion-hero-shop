"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PromotionsTab } from "./promotions-tab";
import { AnalyticsTab } from "./analytics-tab";

interface SellerInfo {
  id: string;
  name: string;
  returnRate: number;
  commissionRate: number;
  canPromote: boolean;
}

interface SellerProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  images: string[];
  isPromoted: boolean;
}

interface ProductsResponse {
  products: SellerProduct[];
  activePromotionsCount: number;
  canAddMorePromotions: boolean;
}

type Tab = "promotions" | "analytics";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "promotions", label: "Promowanie", icon: "⭐" },
  { id: "analytics", label: "Analiza sprzedaży", icon: "📊" },
];

export default function SellerDashboardPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [productsData, setProductsData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("promotions");

  const fetchData = useCallback(async () => {
    const [meRes, productsRes] = await Promise.all([
      fetch("/api/seller/me"),
      fetch("/api/seller/products"),
    ]);

    if (!meRes.ok) {
      router.push("/seller/login");
      return;
    }

    setSeller(await meRes.json() as SellerInfo);
    setProductsData(await productsRes.json() as ProductsResponse);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  async function handleLogout() {
    await fetch("/api/seller/logout", { method: "POST" });
    router.push("/seller/login");
  }

  async function togglePromotion(product: SellerProduct) {
    setPromoting(product.id);
    const method = product.isPromoted ? "DELETE" : "POST";
    await fetch(`/api/seller/promote/${product.id}`, { method });
    await fetchData();
    setPromoting(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <p className="text-sm text-[var(--color-warm-gray)]">Ładowanie...</p>
      </div>
    );
  }

  if (!seller || !productsData) return null;

  const rrPercent = Math.round(seller.returnRate * 100);

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-warm-gray)] uppercase tracking-widest mb-0.5">
              FashionHero · Panel Sprzedawcy
            </p>
            <h1 className="text-lg font-semibold text-[var(--color-charcoal)]">
              {seller.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getRrBadgeClass(seller.returnRate)}`}>
              RR {rrPercent}%
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-[var(--color-warm-gray)] hover:text-[var(--color-charcoal)] transition"
            >
              Wyloguj
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="max-w-5xl mx-auto px-4 flex gap-0 border-t border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "flex items-center gap-2 px-5 py-3 text-sm font-medium transition border-b-2 -mb-[1px]",
                activeTab === tab.id
                  ? "border-[var(--color-charcoal)] text-[var(--color-charcoal)]"
                  : "border-transparent text-[var(--color-warm-gray)] hover:text-[var(--color-charcoal)]",
              ].join(" ")}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "promotions" && (
          <PromotionsTab
            seller={seller}
            productsData={productsData}
            promoting={promoting}
            onToggle={togglePromotion}
          />
        )}
        {activeTab === "analytics" && <AnalyticsTab />}
      </main>
    </div>
  );
}

function getRrBadgeClass(rr: number): string {
  if (rr <= 0.15) return "bg-green-100 text-green-700";
  if (rr <= 0.3) return "bg-amber-100 text-amber-700";
  if (rr <= 0.4) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}
