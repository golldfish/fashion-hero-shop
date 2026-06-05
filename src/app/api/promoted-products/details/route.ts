import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const promotions = await prisma.promotedProduct.findMany({
    where: { isActive: true },
    include: {
      product: true,
      seller: true,
    },
  });

  const products = promotions.map(({ product, seller }) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    category: product.category,
    images: JSON.parse(product.images) as string[],
    sellerName: seller.name,
  }));

  return NextResponse.json({ products });
}
