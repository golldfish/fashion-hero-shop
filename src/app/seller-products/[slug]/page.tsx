"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import type { Product, ProductColor } from "@/types";

interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sizes: (string | number)[];
  colors: { name: string; hex: string }[];
  sellerName: string;
  sellerId: string;
}

export default function SellerProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    fetch(`/api/seller-products/${slug}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json() as Promise<DbProduct>;
      })
      .then((data) => {
        if (data) { setProduct(data); setLoading(false); }
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedSize) return;

    const color = product.colors[selectedColorIdx] ?? { name: "Standardowy", hex: "#cccccc" };

    // Adapter: DbProduct → Product shape for CartProvider
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: "unisex",
      productCategory: "apparel",
      collections: [],
      price: product.price,
      colors: product.colors.map((c) => ({ name: c.name, hex: c.hex, image: product.images[0] ?? "" })),
      sizes: product.sizes.map((s) => (typeof s === "number" ? s : 0)),
      description: product.description,
      features: [],
      materials: "",
      care: "",
      images: product.images,
      type: "hoodie",
      material: "knit",
      rating: 0,
      reviewCount: 0,
      tags: [],
      sellerId: product.sellerId,
    };

    const cartColor: ProductColor = { name: color.name, hex: color.hex, image: product.images[0] ?? "" };
    const cartSize = typeof selectedSize === "number" ? selectedSize : 0;

    addItem(cartProduct, cartColor, cartSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [product, selectedColorIdx, selectedSize, addItem]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <p className="text-sm text-[var(--color-warm-gray)]">Ładowanie...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex flex-col items-center justify-center gap-4">
        <p className="text-[var(--color-charcoal)] font-medium">Produkt nie istnieje</p>
        <Link href="/" className="text-sm text-[var(--color-warm-gray)] underline">Wróć na stronę główną</Link>
      </div>
    );
  }

  const selectedColor = product.colors[selectedColorIdx];

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 md:gap-12">

        {/* ── Image Gallery ── */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
            {product.images[activeImage] ? (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">{categoryEmoji(product.category)}</span>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 rounded overflow-hidden border-2 transition ${activeImage === i ? "border-[var(--color-charcoal)]" : "border-transparent"}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col gap-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[var(--color-warm-gray)]">
            <Link href="/" className="hover:text-[var(--color-charcoal)] transition">Sklep</Link>
            <span>/</span>
            <span className="text-[var(--color-charcoal)]">{product.name}</span>
          </nav>

          {/* Title + seller */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[var(--color-warm-gray)] mb-1">
              {product.sellerName}
            </p>
            <h1 className="text-2xl font-semibold text-[var(--color-charcoal)] leading-tight">
              {product.name}
            </h1>
            <p className="text-xl font-medium mt-2 text-[var(--color-charcoal)]">
              {product.price} zł
            </p>
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-2">
                Kolor: <span className="text-[var(--color-charcoal)]">{selectedColor?.name ?? "—"}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColorIdx(i)}
                    title={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition ${selectedColorIdx === i ? "border-[var(--color-charcoal)] scale-110" : "border-transparent hover:border-gray-300"}`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-2">
                Rozmiar
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={String(size)}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-10 px-3 rounded border text-sm font-medium transition ${
                      selectedSize === size
                        ? "bg-[var(--color-charcoal)] text-white border-[var(--color-charcoal)]"
                        : "border-gray-300 text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-xs text-[var(--color-warm-gray)] mt-1">Wybierz rozmiar</p>
              )}
            </div>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.sizes.length > 0 && !selectedSize}
            className={`w-full py-4 rounded-lg text-sm font-semibold uppercase tracking-widest transition ${
              added
                ? "bg-green-600 text-white"
                : product.sizes.length > 0 && !selectedSize
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[var(--color-charcoal)] text-white hover:bg-black"
            }`}
          >
            {added ? "✓ Dodano do koszyka" : "Dodaj do koszyka"}
          </button>

          {/* Description */}
          <div className="border-t border-gray-100 pt-5">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-3">
              Opis produktu
            </h2>
            <p className="text-sm text-[var(--color-charcoal)] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Category badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[var(--color-cream)] text-[var(--color-warm-gray)] px-3 py-1 rounded-full capitalize">
              {CATEGORY_LABELS[product.category] ?? product.category}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  shoes: "Buty", heels: "Szpilki", tops: "Bluzki", dresses: "Sukienki",
};

function categoryEmoji(cat: string) {
  return { shoes: "👟", heels: "👠", tops: "👕", dresses: "👗" }[cat] ?? "🛍️";
}
