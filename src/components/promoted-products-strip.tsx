"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface PromotedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  images: string[];
  sellerName: string;
}

export function PromotedProductsStrip() {
  const [products, setProducts] = useState<PromotedProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/promoted-products/details")
      .then((r) => r.json())
      .then((data: { products: PromotedProduct[] }) => {
        setProducts(data.products);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || products.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[1.5px] bg-[var(--color-charcoal)] text-white px-2.5 py-1 rounded-sm">
          Promowane
        </span>
        <p className="text-xs text-[var(--color-warm-gray)]">
          Produkty wybrane przez sprzedawców
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <PromotedCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-6 border-b border-black/10" />
    </section>
  );
}

function PromotedCard({ product }: { product: PromotedProduct }) {
  const imageSrc = product.images[0] ?? "";
  const hasImage = imageSrc.startsWith("/images/");

  return (
    <Link href={`/seller-products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-gray-50 mb-3">
        <span className="absolute top-2 left-2 z-10 text-[9px] font-bold uppercase tracking-wider bg-[var(--color-charcoal)] text-white px-2 py-0.5 rounded-sm">
          Promowany
        </span>

        {hasImage ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--color-cream)]">
            <span className="text-4xl">{categoryEmoji(product.category)}</span>
          </div>
        )}
      </div>

      <h3 className="text-[12px] font-medium uppercase tracking-[0.5px] mb-0.5 leading-tight group-hover:underline">
        {product.name}
      </h3>
      <p className="text-[11px] text-[var(--color-warm-gray)] mb-1">
        Sprzedawca:{" "}
        <span className="text-[var(--color-charcoal)]/60">{product.sellerName}</span>
      </p>
      <p className="text-[14px] font-medium">{product.price} zł</p>
    </Link>
  );
}

function categoryEmoji(category: string): string {
  switch (category) {
    case "shoes": return "👟";
    case "heels": return "👠";
    case "tops": return "👕";
    case "dresses": return "👗";
    default: return "🛍️";
  }
}
