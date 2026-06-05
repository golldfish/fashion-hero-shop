import { NextRequest, NextResponse } from "next/server";
import { getSellerSession, getCommissionRate } from "@/lib/seller-session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const seller = await getSellerSession();
  if (!seller) return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });

  const commissionRate = getCommissionRate(seller.returnRate);
  if (commissionRate === -1) {
    return NextResponse.json({ error: "Promowanie zablokowane — RR powyżej 40%" }, { status: 403 });
  }

  const { id: productId } = await params;

  const product = await prisma.product.findFirst({
    where: { id: productId, sellerId: seller.id },
  });
  if (!product) return NextResponse.json({ error: "Produkt nie znaleziony" }, { status: 404 });

  const activeCount = await prisma.promotedProduct.count({
    where: { sellerId: seller.id, isActive: true },
  });
  if (activeCount >= 3) {
    return NextResponse.json({ error: "Maksymalnie 3 produkty mogą być promowane jednocześnie" }, { status: 400 });
  }

  await prisma.promotedProduct.upsert({
    where: { productId_sellerId: { productId, sellerId: seller.id } },
    create: { productId, sellerId: seller.id, isActive: true },
    update: { isActive: true },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const seller = await getSellerSession();
  if (!seller) return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });

  const { id: productId } = await params;

  await prisma.promotedProduct.updateMany({
    where: { productId, sellerId: seller.id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
