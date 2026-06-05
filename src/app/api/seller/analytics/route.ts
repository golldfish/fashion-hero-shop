import { NextRequest, NextResponse } from "next/server";
import { getSellerSession } from "@/lib/seller-session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const seller = await getSellerSession();
  if (!seller) return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = Math.min(90, Math.max(7, Number(searchParams.get("period") ?? 30)));

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - period);
  currentStart.setHours(0, 0, 0, 0);

  const prevStart = new Date(currentStart);
  prevStart.setDate(currentStart.getDate() - period);

  const [currentRecords, prevRecords] = await Promise.all([
    prisma.salesRecord.findMany({
      where: { sellerId: seller.id, date: { gte: currentStart, lte: now } },
      orderBy: { date: "asc" },
    }),
    prisma.salesRecord.findMany({
      where: { sellerId: seller.id, date: { gte: prevStart, lt: currentStart } },
      orderBy: { date: "asc" },
    }),
  ]);

  // Metryki bieżącego okresu
  const totalUnits = currentRecords.reduce((s, r) => s + r.unitsSold, 0);
  const totalReturns = currentRecords.reduce((s, r) => s + r.returns, 0);
  const currentRR = totalUnits > 0 ? totalReturns / totalUnits : 0;

  // Metryki poprzedniego okresu
  const prevUnits = prevRecords.reduce((s, r) => s + r.unitsSold, 0);
  const prevReturns = prevRecords.reduce((s, r) => s + r.returns, 0);
  const prevRR = prevUnits > 0 ? prevReturns / prevUnits : 0;

  // Trend RR (wyższy RR = zły znak)
  const rrDiff = currentRR - prevRR;
  let trend: "up" | "down" | "stable";
  if (Math.abs(rrDiff) < 0.02) trend = "stable";
  else if (rrDiff > 0) trend = "up";   // RR rośnie → zły trend
  else trend = "down";                  // RR spada → dobry trend

  // Dane do wykresu — grupowane po dniach
  const chartData = currentRecords.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    units: r.unitsSold,
  }));

  return NextResponse.json({
    period,
    totalUnits,
    currentRR: Math.round(currentRR * 1000) / 10, // np. 25.3
    prevRR: Math.round(prevRR * 1000) / 10,
    rrDiff: Math.round(rrDiff * 1000) / 10,
    trend,
    chartData,
  });
}
