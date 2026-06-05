"use client";

import { useEffect, useState, useCallback } from "react";

interface AnalyticsData {
  period: number;
  totalUnits: number;
  currentRR: number;
  prevRR: number;
  rrDiff: number;
  trend: "up" | "down" | "stable";
  chartData: { date: string; units: number }[];
}

const PERIODS = [7, 30, 90] as const;

export function AnalyticsTab() {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (p: number) => {
    setLoading(true);
    const res = await fetch(`/api/seller/analytics?period=${p}`);
    setData(await res.json() as AnalyticsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  return (
    <div className="space-y-6">
      {/* Period switcher */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-warm-gray)] mr-1">Zakres:</span>
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={[
              "px-3 py-1.5 rounded-lg text-xs font-medium transition",
              period === p
                ? "bg-[var(--color-charcoal)] text-white"
                : "bg-white text-[var(--color-warm-gray)] hover:text-[var(--color-charcoal)]",
            ].join(" ")}
          >
            {p} dni
          </button>
        ))}
      </div>

      {loading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Sprzedane sztuki"
              value={data.totalUnits.toLocaleString("pl-PL")}
              sub={`ostatnie ${period} dni`}
              icon="📦"
            />
            <MetricCard
              label="Aktualny RR"
              value={`${data.currentRR}%`}
              sub={rrSubtitle(data)}
              icon={rrIcon(data.trend)}
              valueColor={rrValueColor(data.currentRR)}
            />
            <MetricCard
              label="Trend RR"
              value={trendLabel(data.trend)}
              sub={`poprzedni okres: ${data.prevRR}%`}
              icon={trendArrow(data.trend)}
              valueColor={trendColor(data.trend)}
            />
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-4">
              Sprzedane sztuki — wykres dzienny
            </h3>
            <MiniBarChart data={data.chartData} />
          </div>

          {/* RR info strip */}
          {data.trend === "up" && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
              <strong>Uwaga:</strong> Twój Return Rate rośnie (+{data.rrDiff}% vs poprzedni okres).
              Sprawdź opisy i zdjęcia produktów, które są najczęściej zwracane.
            </div>
          )}
          {data.trend === "down" && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
              <strong>Dobra robota!</strong> Return Rate spada ({data.rrDiff}% vs poprzedni okres).
              Tak trzymaj — niższy RR oznacza lepsze stawki prowizji przy promowaniu.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  valueColor = "text-[var(--color-charcoal)]",
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[var(--color-warm-gray)] uppercase tracking-widest">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
      <p className="text-xs text-[var(--color-warm-gray)] mt-1">{sub}</p>
    </div>
  );
}

function MiniBarChart({ data }: { data: { date: string; units: number }[] }) {
  const max = Math.max(...data.map((d) => d.units), 1);

  return (
    <div className="flex items-end gap-[2px] h-28 w-full overflow-hidden">
      {data.map((d) => {
        const heightPct = (d.units / max) * 100;
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.units} szt.`}
            className="flex-1 bg-[var(--color-charcoal)] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-default min-w-0"
            style={{ height: `${heightPct}%` }}
          />
        );
      })}
    </div>
  );
}

function rrSubtitle(data: AnalyticsData): string {
  if (Math.abs(data.rrDiff) < 0.1) return "bez zmian vs poprzedni okres";
  if (data.rrDiff > 0) return `+${data.rrDiff}% vs poprzedni okres`;
  return `${data.rrDiff}% vs poprzedni okres`;
}

function rrIcon(trend: AnalyticsData["trend"]): string {
  if (trend === "up") return "⚠️";
  if (trend === "down") return "✅";
  return "➡️";
}

function rrValueColor(rr: number): string {
  if (rr <= 15) return "text-green-600";
  if (rr <= 30) return "text-amber-500";
  if (rr <= 40) return "text-orange-500";
  return "text-red-500";
}

function trendLabel(trend: AnalyticsData["trend"]): string {
  if (trend === "up") return "Rosnący ↑";
  if (trend === "down") return "Spadkowy ↓";
  return "Stagnacja →";
}

function trendArrow(trend: AnalyticsData["trend"]): string {
  if (trend === "up") return "📈";
  if (trend === "down") return "📉";
  return "📊";
}

function trendColor(trend: AnalyticsData["trend"]): string {
  if (trend === "up") return "text-red-500";
  if (trend === "down") return "text-green-600";
  return "text-amber-500";
}
