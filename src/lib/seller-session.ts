import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE = "seller_session";

export async function getSellerSession() {
  const cookieStore = await cookies();
  const sellerId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sellerId) return null;

  const seller = await prisma.seller.findUnique({
    where: { id: sellerId },
    include: { account: true },
  });
  return seller;
}

export async function setSellerSession(sellerId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sellerId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dni
  });
}

export async function clearSellerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function getCommissionRate(returnRate: number): number {
  if (returnRate <= 0.15) return 3;
  if (returnRate <= 0.3) return 5;
  if (returnRate <= 0.4) return 8;
  return -1; // zablokowane
}
