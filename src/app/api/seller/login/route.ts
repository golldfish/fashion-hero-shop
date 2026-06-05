import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSellerSession } from "@/lib/seller-session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Brakujące dane" }, { status: 400 });
  }

  const account = await prisma.sellerAccount.findUnique({
    where: { email },
    include: { seller: true },
  });

  if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
    return NextResponse.json({ error: "Nieprawidłowy email lub hasło" }, { status: 401 });
  }

  await setSellerSession(account.seller.id);

  return NextResponse.json({ ok: true, seller: { id: account.seller.id, name: account.seller.name } });
}
