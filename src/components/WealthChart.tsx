"use client";

import { formatCurrencyCompact, formatCurrency } from "@/lib/format";
import { Currency } from "@/lib/types";
import { ProjectionResult } from "@/lib/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  result: ProjectionResult;
  currency: Currency;
  /** Eingezahltes Kapital vs. Rendite zusätzlich zeigen. */
  showSplit?: boolean;
  height?: number;
}

export function WealthChart({ result, currency, showSplit = true, height = 320 }: Props) {
  const data = result.years.map((y) => ({
    age: y.age,
    nominal: Math.round(y.endWealth),
    real: Math.round(y.realEndWealth),
    eingezahlt: Math.round(y.cumulativeContributions),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="gNominal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3479f6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3479f6" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gEingezahlt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
        <XAxis
          dataKey="age"
          tick={{ fontSize: 11, fill: "#8591a9" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e8ee" }}
          tickFormatter={(v) => `${v}`}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#8591a9" }}
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(v) => formatCurrencyCompact(v, currency)}
        />
        <Tooltip
          formatter={(value: number, name) => [formatCurrency(value, currency), labelFor(name as string)]}
          labelFormatter={(label) => `Alter ${label}`}
          cursor={{ stroke: "#3479f6", strokeWidth: 1.5, strokeDasharray: "4 4" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e5e8ee",
            fontSize: 12,
            boxShadow: "0 8px 24px rgba(16,24,40,0.12)",
          }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => labelFor(value)}
        />
        <Area
          type="monotone"
          dataKey="nominal"
          stroke="#3479f6"
          strokeWidth={2.5}
          fill="url(#gNominal)"
          name="nominal"
          isAnimationActive
          animationDuration={1400}
          animationEasing="ease-out"
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
        />
        {showSplit && (
          <Area
            type="monotone"
            dataKey="eingezahlt"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="url(#gEingezahlt)"
            name="eingezahlt"
            isAnimationActive
            animationDuration={1400}
            animationBegin={250}
            animationEasing="ease-out"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
        )}
        <Area
          type="monotone"
          dataKey="real"
          stroke="#10b981"
          strokeWidth={2}
          fill="none"
          name="real"
          isAnimationActive
          animationDuration={1400}
          animationBegin={450}
          animationEasing="ease-out"
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function labelFor(key: string): string {
  switch (key) {
    case "nominal":
      return "Vermögen (nominal)";
    case "real":
      return "Kaufkraft (real)";
    case "eingezahlt":
      return "Eingezahltes Kapital";
    default:
      return key;
  }
}
