"use client";

import * as React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import type { Bet } from "@/lib/types";
import { cumulativeProfit, stakePerDay } from "@/lib/analytics";
import { formatEuro, formatDate } from "@/lib/format";
import { useChartTheme, withAlpha } from "./chartTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function ProfitChart({ bets }: { bets: Bet[] }) {
  const theme = useChartTheme();
  const points = React.useMemo(() => cumulativeProfit(bets), [bets]);

  if (points.length === 0)
    return <EmptyChart label="Nog geen besliste bets om te tonen." />;

  const data: ChartData<"line"> = {
    labels: points.map((p) => formatDate(p.date)),
    datasets: [
      {
        label: "Netto resultaat",
        data: points.map((p) => p.value),
        borderColor: theme.primary,
        backgroundColor: withAlpha(theme.primary, 0.15),
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: theme.primary,
        borderWidth: 2.5,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => formatEuro(ctx.parsed.y ?? 0),
        },
      },
    },
    scales: {
      x: {
        ticks: { color: theme.text },
        grid: { color: withAlpha(theme.grid, 0.4) },
      },
      y: {
        ticks: {
          color: theme.text,
          callback: (v) => formatEuro(Number(v)),
        },
        grid: { color: withAlpha(theme.grid, 0.4) },
      },
    },
  };

  return (
    <div className="h-[280px]">
      <Line data={data} options={options} />
    </div>
  );
}

export function ResultPie({
  won,
  lost,
  open,
}: {
  won: number;
  lost: number;
  open: number;
}) {
  const theme = useChartTheme();
  if (won + lost + open === 0)
    return <EmptyChart label="Nog geen bets." />;

  const data: ChartData<"doughnut"> = {
    labels: ["Gewonnen", "Verloren", "Open"],
    datasets: [
      {
        data: [won, lost, open],
        backgroundColor: [
          withAlpha(theme.won, 0.85),
          withAlpha(theme.lost, 0.85),
          withAlpha(theme.open, 0.85),
        ],
        borderColor: ["transparent", "transparent", "transparent"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: theme.text, padding: 16, usePointStyle: true },
      },
    },
  };

  return (
    <div className="h-[280px]">
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function StakeBar({ bets }: { bets: Bet[] }) {
  const theme = useChartTheme();
  const points = React.useMemo(() => stakePerDay(bets), [bets]);

  if (points.length === 0)
    return <EmptyChart label="Nog geen ingezette bedragen met datum." />;

  const data: ChartData<"bar"> = {
    labels: points.map((p) => formatDate(p.date)),
    datasets: [
      {
        label: "Inzet",
        data: points.map((p) => p.value),
        backgroundColor: withAlpha(theme.primary, 0.7),
        hoverBackgroundColor: theme.primary,
        borderRadius: 6,
        maxBarThickness: 44,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => formatEuro(ctx.parsed.y ?? 0) } },
    },
    scales: {
      x: {
        ticks: { color: theme.text },
        grid: { display: false },
      },
      y: {
        ticks: { color: theme.text, callback: (v) => formatEuro(Number(v)) },
        grid: { color: withAlpha(theme.grid, 0.4) },
      },
    },
  };

  return (
    <div className="h-[280px]">
      <Bar data={data} options={options} />
    </div>
  );
}
