import { NextResponse } from "next/server";
import { getSellerSession, getCommissionRate } from "@/lib/seller-session";

export async function GET() {
  const seller = await getSellerSession();
  if (!seller) {
    return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
  }

  const commissionRate = getCommissionRate(seller.returnRate);

  return NextResponse.json({
    id: seller.id,
    name: seller.name,
    slug: seller.slug,
    returnRate: seller.returnRate,
    commissionRate,
    canPromote: commissionRate !== -1,
  });
}
