/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — 7-Day Rolling Freight Revenue vs. Operating Expenses Sparkline
 * Precision SVG trend visualization with interactive daily telemetry HUD
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { Rolling7DayFinancialTrend } from '../utils/accountingEngine';
import { formatPaiseToINR } from '../utils/accountingEngine';

interface RollingTrendSparklineProps {
  trend: Rolling7DayFinancialTrend;
  className?: string;
}

export const RollingTrendSparkline: React.FC<RollingTrendSparklineProps> = ({
  trend,
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(6); // Default to latest day (today)
  const [filterMode, setFilterMode] = useState<'ALL' | 'REVENUE' | 'EXPENSE'>('ALL');

  const { dailyPoints, maxDailyValuePaise } = trend;
  const activePoint = hoveredIdx !== null ? dailyPoints[hoveredIdx] : dailyPoints[6];

  // SVG dimensions & coordinate mapping
  const width = 640;
  const height = 180;
  const padX = 30;
  const padTop = 25;
  const padBottom = 35;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;

  // Give 15% headroom above the max value
  const scaleMax = maxDailyValuePaise > 0 ? maxDailyValuePaise * 1.15 : 1000000;

  const points = dailyPoints.map((pt, idx) => {
    const x = padX + (idx / (dailyPoints.length - 1)) * plotW;
    const yRev = padTop + plotH - (pt.revenuePaise / scaleMax) * plotH;
    const yExp = padTop + plotH - (pt.expensePaise / scaleMax) * plotH;
    return { ...pt, x, yRev, yExp };
  });

  // Generate smooth cubic bezier path for points
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const revenuePoints = points.map((p) => ({ x: p.x, y: p.yRev }));
  const expensePoints = points.map((p) => ({ x: p.x, y: p.yExp }));

  const revLinePath = generateSmoothPath(revenuePoints);
  const expLinePath = generateSmoothPath(expensePoints);

  const baselineY = padTop + plotH;
  const revAreaPath = `${revLinePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;
  const expAreaPath = `${expLinePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

  return (
    <div className={`bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm ${className}`}>
      {/* Top Header & 7-Day Performance Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              7-Day Rolling Trend
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {dailyPoints[0]?.dayLabel} – {dailyPoints[6]?.dayLabel}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white mt-1 flex items-center gap-2">
            Freight Revenue vs. Operating Expenses
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous rolling delta between booked Bilty freight and Motor Malik hire payouts.
          </p>
        </div>

        {/* Filter controls & 7-day Average Margin Pill */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterMode === 'ALL'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dual Trend
            </button>
            <button
              onClick={() => setFilterMode('REVENUE')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterMode === 'REVENUE'
                  ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/60'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setFilterMode('EXPENSE')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterMode === 'EXPENSE'
                  ? 'bg-amber-950 text-amber-300 font-semibold border border-amber-800/60'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              Expenses
            </button>
          </div>

          <div className="hidden sm:flex px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 items-center gap-1.5 text-xs text-emerald-300 font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">{trend.average7DayMarginPct}%</span>
            <span className="text-[10px] text-emerald-400/80">Avg Margin</span>
          </div>
        </div>
      </div>

      {/* 7-Day Cumulative Telemetry KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-slate-800/60">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">7-Day Billed Freight</span>
          <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 tabular-nums">
            {formatPaiseToINR(trend.total7DayRevenuePaise)}
          </span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">7-Day Hire Expenses</span>
          <span className="text-sm sm:text-base font-bold font-mono text-amber-400 tabular-nums">
            {formatPaiseToINR(trend.total7DayExpensePaise)}
          </span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">7-Day Net Profit</span>
          <span className="text-sm sm:text-base font-bold font-mono text-white tabular-nums">
            {formatPaiseToINR(trend.total7DayGrossMarginPaise)}
          </span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Weekly Momentum</span>
          <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 tabular-nums flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +{trend.revenueMomentumPct}%
          </span>
        </div>
      </div>

      {/* Interactive Active Day Inspector Callout */}
      {activePoint && (
        <div className="my-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-slate-200">
              {activePoint.date === '2026-11-02' ? 'Today (Active Operations)' : activePoint.dayName + ', ' + activePoint.dayLabel}:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono">
            <div>
              <span className="text-slate-400 text-[11px]">Revenue: </span>
              <span className="text-emerald-400 font-bold">{formatPaiseToINR(activePoint.revenuePaise)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Hire Expense: </span>
              <span className="text-amber-400 font-bold">{formatPaiseToINR(activePoint.expensePaise)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Daily Margin: </span>
              <span className={`font-bold ${activePoint.grossMarginPaise >= 0 ? 'text-white' : 'text-rose-400'}`}>
                {formatPaiseToINR(activePoint.grossMarginPaise)} ({activePoint.marginPct}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SVG Sparkline Graph Canvas */}
      <div className="relative w-full overflow-hidden mt-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 sm:h-52 select-none"
        >
          <defs>
            {/* Emerald Gradient for Freight Revenue Area */}
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Amber Gradient for Operating Expenses Area */}
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing Drop Shadows */}
            <filter id="glowRevenue" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.4" />
            </filter>
            <filter id="glowExpense" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Grid Horizontal Lines */}
          {[0.25, 0.5, 0.75, 1.0].map((frac, i) => {
            const y = padTop + plotH * (1 - frac);
            const val = formatPaiseToINR(Math.round(scaleMax * frac));
            return (
              <g key={i}>
                <line
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={width - padX}
                  y={y - 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val.split('.')[0]}
                </text>
              </g>
            );
          })}

          {/* Baseline Axis */}
          <line
            x1={padX}
            y1={baselineY}
            x2={width - padX}
            y2={baselineY}
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Area Fills */}
          {(filterMode === 'ALL' || filterMode === 'REVENUE') && (
            <path d={revAreaPath} fill="url(#revenueGrad)" />
          )}

          {(filterMode === 'ALL' || filterMode === 'EXPENSE') && (
            <path d={expAreaPath} fill="url(#expenseGrad)" />
          )}

          {/* Operating Expenses Line */}
          {(filterMode === 'ALL' || filterMode === 'EXPENSE') && (
            <path
              d={expLinePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowExpense)"
            />
          )}

          {/* Freight Revenue Line */}
          {(filterMode === 'ALL' || filterMode === 'REVENUE') && (
            <path
              d={revLinePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowRevenue)"
            />
          )}

          {/* Vertical Hover Guide Line & Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={pt.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
              >
                {/* Invisible hover trigger column */}
                <rect
                  x={pt.x - plotW / 12}
                  y={padTop}
                  width={plotW / 6}
                  height={plotH + padBottom}
                  fill="transparent"
                />

                {/* Vertical Cursor Guide when hovered */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={baselineY}
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Expense Dot */}
                {(filterMode === 'ALL' || filterMode === 'EXPENSE') && (
                  <circle
                    cx={pt.x}
                    cy={pt.yExp}
                    r={isHovered ? 5.5 : 3.5}
                    fill="#f59e0b"
                    stroke="#020617"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                )}

                {/* Revenue Dot */}
                {(filterMode === 'ALL' || filterMode === 'REVENUE') && (
                  <circle
                    cx={pt.x}
                    cy={pt.yRev}
                    r={isHovered ? 6 : 4}
                    fill="#10b981"
                    stroke="#020617"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                )}

                {/* X-Axis Date Labels */}
                <text
                  x={pt.x}
                  y={baselineY + 16}
                  textAnchor="middle"
                  fill={isHovered ? '#f8fafc' : '#94a3b8'}
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {pt.dayLabel}
                </text>
                <text
                  x={pt.x}
                  y={baselineY + 28}
                  textAnchor="middle"
                  fill={isHovered ? '#38bdf8' : '#64748b'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {pt.dayName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & 7-Day Day-by-Day Micro Pills */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
            <span className="text-slate-300 font-medium">Billed Freight Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
            <span className="text-slate-300 font-medium">Operating Hire Expenses</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Hover points to inspect daily transaction ledger</span>
        </div>
      </div>
    </div>
  );
};
