"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

interface SellerInfo {
  name: string;
  returnRate: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  shoes: "Buty",
  heels: "Szpilki",
  tops: "Bluzki",
  dresses: "Sukienki",
};

function categoryEmoji(category: string): string {
  const map: Record<string, string> = { shoes: "👟", heels: "👠", tops: "👕", dresses: "👗" };
  return map[category] ?? "🛍️";
}

export default function SellerProductsPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [meRes, productsRes] = await Promise.all([
      fetch("/api/seller/me"),
      fetch("/api/seller/products"),
    ]);

    if (!meRes.ok) {
      router.push("/login");
      return;
    }

    setSeller(await meRes.json() as SellerInfo);
    const data = await productsRes.json() as ProductsResponse;
    setProducts(data.products);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <p className="text-sm text-[var(--color-warm-gray)]">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--color-warm-gray)] mb-6">
          <Link href="/seller/dashboard" className="hover:text-[var(--color-charcoal)] transition">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-[var(--color-charcoal)]">Moje produkty</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">Moje produkty</h1>
            <p className="text-sm text-[var(--color-warm-gray)] mt-1">
              {seller?.name} · {products.length} produktów
            </p>
          </div>
          <Link
            href="/seller/dashboard"
            className="text-xs text-[var(--color-warm-gray)] border border-gray-200 px-3 py-2 rounded-lg hover:border-[var(--color-charcoal)] hover:text-[var(--color-charcoal)] transition"
          >
            Przejdź do promowania →
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--color-warm-gray)] text-sm mb-4">Nie masz jeszcze żadnych produktów.</p>
            <Link
              href="/seller/dashboard"
              className="text-xs border border-[var(--color-charcoal)] px-4 py-2 rounded hover:bg-[var(--color-charcoal)] hover:text-white transition"
            >
              Wróć do dashboardu
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: SellerProduct }) {
  const imageSrc = product.images[0] ?? "";
  const hasImage = imageSrc.startsWith("/images/");

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm group">
      <div className="relative aspect-square bg-gray-50">
        {product.isPromoted && (
          <span className="absolute top-2 left-2 z-10 text-[9px] font-bold uppercase tracking-wider bg-[var(--color-charcoal)] text-white px-1.5 py-0.5 rounded-sm">
            Promowany
          </span>
        )}
        {hasImage ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--color-cream)]">
            <span className="text-4xl">{categoryEmoji(product.category)}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-xs font-medium text-[var(--color-charcoal)] leading-tight truncate">
          {product.name}
        </h3>
        <p className="text-[11px] text-[var(--color-warm-gray)] mt-0.5">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </p>
        <p className="text-xs font-semibold text-[var(--color-charcoal)] mt-1.5">
          {product.price} zł
        </p>
      </div>
    </div>
  );
}
