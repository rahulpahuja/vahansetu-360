/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Weekly Freight Revenue Bar Chart (Recharts)
 * Granular day-by-day billing cycle visualization for current operational week
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  BarChart3,
  CalendarDays,
  TrendingUp,
  Receipt,
  Layers,
} from 'lucide-react';
import { DailyRollingFinancialPoint } from '../utils/accountingEngine';
import { formatPaiseToINR } from '../utils/accountingEngine';

interface WeeklyFreightBarChartProps {
  dailyPoints: DailyRollingFinancialPoint[];
  totalWeekRevenuePaise: number;
  className?: string;
  onSelectDate?: (dateStr: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  avgDailyPaise: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  avgDailyPaise,
}) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const revPaise = data.revenuePaise;
    const diffPct = avgDailyPaise > 0
      ? (((revPaise - avgDailyPaise) / avgDailyPaise) * 100).toFixed(1)
      : '0.0';
    const isAboveAvg = revPaise >= avgDailyPaise;

    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-lg p-3 shadow-xl backdrop-blur-md text-xs min-w-[210px] space-y-1.5 font-sans">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
            <span>{data.fullDateLabel}</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {data.isToday ? 'Today' : data.dayName}
          </span>
        </div>

        <div className="pt-1 space-y-1">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-400 text-[11px]">Billed Freight:</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              {formatPaiseToINR(revPaise)}
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-slate-400 text-[11px]">Operating Hire:</span>
            <span className="text-amber-400 font-mono font-semibold">
              {formatPaiseToINR(data.expensePaise)}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-1 border-t border-slate-800">
            <span className="text-slate-400 text-[11px]">Daily Net Spread:</span>
            <span className="text-white font-mono font-bold">
              {formatPaiseToINR(data.grossMarginPaise)}
            </span>
          </div>
        </div>

        <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">Vs. 7-Day Avg:</span>
          <span className={`font-semibold ${isAboveAvg ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isAboveAvg ? `+${diffPct}%` : `${diffPct}%`}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const WeeklyFreightBarChart: React.FC<WeeklyFreightBarChartProps> = ({
  dailyPoints,
  totalWeekRevenuePaise,
  className = '',
  onSelectDate,
}) => {
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(6);

  const avgDailyPaise = Math.round(totalWeekRevenuePaise / Math.max(1, dailyPoints.length));

  // Find peak day
  let peakDay = dailyPoints[0];
  dailyPoints.forEach((p) => {
    if (p.revenuePaise > (peakDay?.revenuePaise || 0)) {
      peakDay = p;
    }
  });

  const chartData = dailyPoints.map((pt, idx) => {
    const isToday = pt.date === '2026-11-02';
    const isPeak = pt.date === peakDay?.date;
    const revenueRupees = Math.round(pt.revenuePaise / 100);
    const dayWithDate = `${pt.dayName} ${pt.dayLabel.split(' ')[0]}`;

    return {
      ...pt,
      idx,
      isToday,
      isPeak,
      revenueRupees,
      dayWithDate,
      fullDateLabel: `${pt.dayName}, ${pt.dayLabel} 2026`,
    };
  });

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl shadow-sm p-4 sm:p-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 uppercase tracking-wider">
              <BarChart3 className="w-3 h-3 text-emerald-400" />
              Recharts Billing Analytics
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Current Weekly Cycle ({dailyPoints[0]?.dayLabel} – {dailyPoints[6]?.dayLabel})
            </span>
          </div>
          <h3 className="text-base font-display font-bold text-white mt-1 flex items-center gap-2">
            Daily Total Freight Revenue
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Billed consignment volume breakdown showing billing frequency and weekend dispatch velocity.
          </p>
        </div>

        {/* Top Metric Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Peak Day</span>
            <span className="font-mono font-bold text-emerald-400">
              {peakDay?.dayName} ({formatPaiseToINR(peakDay?.revenuePaise || 0)})
            </span>
          </div>
          <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Daily Avg</span>
            <span className="font-mono font-bold text-slate-200">
              {formatPaiseToINR(avgDailyPaise)}
            </span>
          </div>
          <div className="bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/80 text-xs">
            <span className="text-emerald-400/80 block text-[10px] uppercase font-mono">Week Billed</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatPaiseToINR(totalWeekRevenuePaise)}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Canvas */}
      <div className="w-full h-56 sm:h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 16, left: 0, bottom: 5 }}
            onClick={(state) => {
              if (state && state.activeTooltipIndex !== undefined) {
                setSelectedBarIndex(state.activeTooltipIndex);
                if (onSelectDate && chartData[state.activeTooltipIndex]) {
                  onSelectDate(chartData[state.activeTooltipIndex].date);
                }
              }
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="dayWithDate"
              stroke="#64748b"
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            />
            <YAxis
              stroke="#64748b"
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(val: number) => `₹${Math.round(val / 1000)}k`}
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              width={55}
            />
            <Tooltip
              content={<CustomTooltip avgDailyPaise={avgDailyPaise} />}
              cursor={{ fill: 'rgba(51, 65, 85, 0.25)' }}
            />
            <Bar
              dataKey="revenueRupees"
              radius={[6, 6, 0, 0]}
              animationDuration={600}
            >
              {chartData.map((entry, index) => {
                const isSelected = selectedBarIndex === index;
                // Highlighting: peak day or today or hovered
                let fillColor = '#10b981'; // default emerald
                if (entry.isPeak) {
                  fillColor = '#34d399'; // brightest emerald for peak day
                } else if (entry.isToday) {
                  fillColor = '#059669'; // rich emerald for today
                }
                if (isSelected) {
                  fillColor = '#10b981';
                }

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fillColor}
                    fillOpacity={isSelected ? 1 : 0.85}
                    stroke={isSelected ? '#f8fafc' : undefined}
                    strokeWidth={isSelected ? 1.5 : 0}
                    className="cursor-pointer transition-all duration-150 hover:opacity-100"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Granular Billing Cycle Day Badges */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            Billing Cycle Granularity & Distribution
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Click any day to inspect ledger line
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {chartData.map((d, i) => {
            const isSelected = selectedBarIndex === i;
            const pctOfTotal = totalWeekRevenuePaise > 0
              ? ((d.revenuePaise / totalWeekRevenuePaise) * 100).toFixed(0)
              : '0';

            return (
              <div
                key={d.date}
                onClick={() => setSelectedBarIndex(i)}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/50 border-emerald-500/80 text-white shadow-sm ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={isSelected ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                    {d.dayName}
                  </span>
                  <span className="text-slate-400">{pctOfTotal}%</span>
                </div>
                <div className="text-xs font-mono font-bold mt-1 tabular-nums truncate">
                  {formatPaiseToINR(d.revenuePaise).split('.')[0]}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                  Margin: {d.marginPct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
