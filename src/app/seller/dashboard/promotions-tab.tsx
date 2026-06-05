"use client";

import Image from "next/image";

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

interface PromotionsTabProps {
  seller: SellerInfo;
  productsData: ProductsResponse;
  promoting: string | null;
  onToggle: (product: SellerProduct) => void;
}

export function PromotionsTab({ seller, productsData, promoting, onToggle }: PromotionsTabProps) {
  const rrPercent = Math.round(seller.returnRate * 100);

  return (
    <div className="space-y-6">
      {/* Promotion stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs text-[var(--color-warm-gray)] uppercase tracking-widest mb-2">Stawka prowizji</p>
          <p className={`text-3xl font-semibold ${seller.canPromote ? "text-green-600" : "text-red-500"}`}>
            {seller.canPromote ? `${seller.commissionRate}%` : "—"}
          </p>
          <p className="text-xs text-[var(--color-warm-gray)] mt-1">
            {seller.canPromote ? "od każdej sprzedanej rzeczy" : "promowanie zablokowane"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs text-[var(--color-warm-gray)] uppercase tracking-widest mb-2">Aktywne promocje</p>
          <p className={`text-3xl font-semibold ${productsData.canAddMorePromotions ? "text-[var(--color-charcoal)]" : "text-amber-600"}`}>
            {productsData.activePromotionsCount} / 3
          </p>
          <p className="text-xs text-[var(--color-warm-gray)] mt-1">
            {productsData.canAddMorePromotions ? "możesz dodać więcej" : "osiągnięto limit"}
          </p>
        </div>
      </div>

      {/* Blocked warning */}
      {!seller.canPromote && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
          <strong>Promowanie zablokowane.</strong> Twój Return Rate wynosi {rrPercent}% i przekracza próg 40%.
          Popraw opisy i zdjęcia produktów, aby obniżyć wskaźnik zwrotów.
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {productsData.products.map((product) => (
          <ProductDashboardCard
            key={product.id}
            product={product}
            seller={seller}
            canAddMore={productsData.canAddMorePromotions}
            isLoading={promoting === product.id}
            onToggle={() => onToggle(product)}
          />
        ))}
      </div>
    </div>
  );
}

function ProductDashboardCard({
  product,
  seller,
  canAddMore,
  isLoading,
  onToggle,
}: {
  product: SellerProduct;
  seller: SellerInfo;
  canAddMore: boolean;
  isLoading: boolean;
  onToggle: () => void;
}) {
  const imageSrc = product.images[0] ?? "";
  const hasImage = imageSrc.startsWith("/images/");
  const canPromoteThis = seller.canPromote && (product.isPromoted || canAddMore);

  const buttonLabel = () => {
    if (!seller.canPromote) return "Zmniejsz swój stosunek zwrotów";
    if (product.isPromoted) return `Promowany (${seller.commissionRate}% prowizji)`;
    if (!canAddMore) return "Limit 3 promocji osiągnięty";
    return `Promuj za ${seller.commissionRate}% prowizji`;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <div className="relative aspect-[4/3] bg-gray-50">
        {product.isPromoted && (
          <span className="absolute top-3 left-3 z-10 text-[10px] font-semibold uppercase tracking-wider bg-[var(--color-charcoal)] text-white px-2 py-1 rounded-sm">
            Promowany
          </span>
        )}
        {hasImage ? (
          <Image src={imageSrc} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-3xl">{categoryEmoji(product.category)}</span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-[var(--color-charcoal)] leading-tight">{product.name}</h3>
          <p className="text-xs text-[var(--color-warm-gray)] mt-0.5 capitalize">
            {product.category} · {product.price} zł
          </p>
        </div>
        <button
          onClick={onToggle}
          disabled={!canPromoteThis || isLoading}
          className={[
            "w-full py-2.5 px-4 rounded-lg text-xs font-medium transition",
            canPromoteThis
              ? "bg-[var(--color-charcoal)] text-white hover:bg-black"
              : "bg-gray-100 text-gray-400 cursor-not-allowed",
          ].join(" ")}
        >
          {isLoading ? "..." : buttonLabel()}
        </button>
      </div>
    </div>
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
