import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const promoted = await prisma.promotedProduct.findMany({
    where: { isActive: true },
    select: { productId: true },
  });

  const promotedIds = promoted.map((p) => p.productId);
  return NextResponse.json({ promotedIds });
}
