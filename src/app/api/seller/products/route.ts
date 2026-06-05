import { NextResponse } from "next/server";
import { getSellerSession } from "@/lib/seller-session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const seller = await getSellerSession();
  if (!seller) {
    return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: {
      promotions: {
        where: { isActive: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activePromotionsCount = products.filter((p) => p.promotions.length > 0).length;

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      category: p.category,
      images: JSON.parse(p.images) as string[],
      isPromoted: p.promotions.length > 0,
    })),
    activePromotionsCount,
    canAddMorePromotions: activePromotionsCount < 3,
  });
}
