import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { seller: true },
  });

  if (!product) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });

  return NextResponse.json({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    category: product.category,
    images: JSON.parse(product.images) as string[],
    sizes: JSON.parse(product.sizes) as (string | number)[],
    colors: JSON.parse(product.colors) as { name: string; hex: string }[],
    sellerName: product.seller.name,
    sellerId: product.seller.id,
  });
}
