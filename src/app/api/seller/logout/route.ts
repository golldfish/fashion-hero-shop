import { NextResponse } from "next/server";
import { clearSellerSession } from "@/lib/seller-session";

export async function POST() {
  await clearSellerSession();
  return NextResponse.json({ ok: true });
}
