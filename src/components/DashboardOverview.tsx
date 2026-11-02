/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Executive Operations & 100k Throughput Dashboard
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  ArrowRight,
  Database,
  Radio,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Scale,
  DollarSign,
  PieChart,
  Percent,
  Truck,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Receipt,
  PlusCircle,
} from 'lucide-react';
import {
  Driver,
  JournalEntry,
  LorryReceipt,
  Party,
  Trip,
  Vehicle,
} from '../types/logistics';
import { calculateFleetCapacityMetrics } from '../utils/capacityEngine';
import {
  formatPaiseToINR,
  calculateTripProfitabilityMetrics,
  calculate7DayRollingFinancialTrend,
} from '../utils/accountingEngine';
import { RollingTrendSparkline } from './RollingTrendSparkline';
import { WeeklyFreightBarChart } from './WeeklyFreightBarChart';

interface DashboardOverviewProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  lorryReceipts: LorryReceipt[];
  parties: Party[];
  journalEntries: JournalEntry[];
  onNavigateTab: (tab: any) => void;
  onOpenTrackingModal: (token: string) => void;
  onOpenTripDetails: (trip: Trip) => void;
  onCreateLR?: () => void;
  onDispatchTrip?: () => void;
  onPostJournal?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  trips,
  vehicles,
  lorryReceipts,
  parties,
  journalEntries,
  onNavigateTab,
  onOpenTrackingModal,
  onOpenTripDetails,
  onCreateLR,
  onDispatchTrip,
  onPostJournal,
}) => {
  const [showProfitDetails, setShowProfitDetails] = useState(false);
  const capacity = calculateFleetCapacityMetrics(100000);
  const profitability = calculateTripProfitabilityMetrics(trips, lorryReceipts);
  const rollingTrend = calculate7DayRollingFinancialTrend(journalEntries, trips, lorryReceipts, '2026-11-02');

  // Financial aggregates calculated from double-entry accounting records
  const totalAgreedFreightPaise = trips.reduce(
    (sum, t) => sum + t.totalAgreedFreightPaise,
    0
  );
  const totalAdvanceReceivedPaise = lorryReceipts.reduce(
    (sum, lr) => sum + lr.advanceReceivedPaise,
    0
  );
  const totalReceivablePaise = lorryReceipts.reduce(
    (sum, lr) => sum + lr.balanceReceivablePaise,
    0
  );
  const totalMotorOwnerPayablePaise = trips.reduce(
    (sum, t) => sum + t.balancePayableToOwnerPaise,
    0
  );

  const activeTrip = trips[0]; // MP09SR4241 Indore to Nashik
  const activeVehicle = vehicles.find((v) => v.id === activeTrip?.vehicleId);
  const vehicleOwnerParty = parties.find(
    (p) => p.id === activeTrip?.vehicleOwnerPartyId
  );
  const brokerParty = parties.find(
    (p) => p.id === activeTrip?.primaryBrokerPartyId
  );

  return (
    <div className="space-y-6">
      {/* 100k Daily Transit Architecture Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Scalability Architecture Target
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Sustains 100,000 Transits/Day
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Enterprise Logistics & Telematics Operating Cockpit
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Engineered for broker-centric operations, non-exclusive party roles, multi-stop bilty/LR generation, and integer-precision double-entry financials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('telematics')}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Live Telematics Stream
            </button>
            <button
              onClick={() => onNavigateTab('accounting')}
              className="px-3.5 py-2 text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Audit Double-Entry Ledger
            </button>
            <button
              onClick={() => onNavigateTab('audit')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Immutable Audit Vault
            </button>
          </div>
        </div>

        {/* Distributed Capacity Throughput Metrics Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Peak Ingestion</span>
            <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
              {capacity.peakGpsPingsPerSec.toLocaleString()} pings/s
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Moving Fleet</span>
            <span className="text-sm font-bold font-mono text-slate-200 tabular-nums">
              {capacity.peakConcurrentMovingVehicles.toLocaleString()} trucks
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Kafka Partitions</span>
            <span className="text-sm font-bold font-mono text-slate-200 tabular-nums">
              {capacity.kafkaPartitionCount} topics
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Daily GPS Ingestion</span>
            <span className="text-sm font-bold font-mono text-slate-200 tabular-nums">
              ~{(capacity.dailyGpsPingsTotal / 1000000).toFixed(0)}M points
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Storage Growth</span>
            <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
              {capacity.dailyStorageCompressedGb} GB/day
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Ingestion Network</span>
            <span className="text-sm font-bold font-mono text-amber-400 tabular-nums">
              {capacity.ingestionBandwidthMbps} Mbps
            </span>
          </div>
        </div>
      </div>

      {/* Financial & Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Freight */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Gross Freight Booked</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Active Trips
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {formatPaiseToINR(totalAgreedFreightPaise)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Across {trips.length} active multi-stop transit
          </p>
        </div>

        {/* Card 2: Advance Collected */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Advance Collected</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              80% In Bank
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {formatPaiseToINR(totalAdvanceReceivedPaise)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            RTGS collected against issued bilty
          </p>
        </div>

        {/* Card 3: Outstanding Receivables */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Outstanding Receivable</span>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Balance Due
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {formatPaiseToINR(totalReceivablePaise)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Payable by consignor upon delivery
          </p>
        </div>

        {/* Card 4: Vehicle Owner Payable */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Motor Owner Payable</span>
            <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Ram Roadlines
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">
              {formatPaiseToINR(totalMotorOwnerPayablePaise)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Net balance after ₹25,000 diesel advance
          </p>
        </div>
      </div>

      {/* Real-Time Profitability & Brokerage Margin Cockpit Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Real-Time Profitability Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {profitability.tripCount} Active Trips · {profitability.lrCount} Bilty Consignments
              </span>
            </div>
            <h2 className="text-lg font-display font-bold text-white mt-1">
              Net Freight Margin & Truck Hire Spread
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live calculation of total freight revenue billed via Lorry Receipts minus total hire expenses payable to Motor Maliks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg border flex items-center gap-2.5 ${
              profitability.grossProfitPaise >= 0 
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' 
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}>
              {profitability.grossProfitPaise >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-400" />
              )}
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  Gross Profit Margin
                </div>
                <div className="text-base font-bold font-mono tabular-nums">
                  {profitability.grossMarginPct > 0 ? '+' : ''}{profitability.grossMarginPct}%
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowProfitDetails(!showProfitDetails)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {showProfitDetails ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                  Hide Breakdown
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                  Trip Breakdown
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3 Core Mathematical Pillars */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1: Total Freight Revenue from Lorry Receipts */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                LR Freight Revenue
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                Billed to Consignors
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {formatPaiseToINR(profitability.totalFreightRevenuePaise)}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Pure Base Freight:</span>
                <span className="font-mono text-slate-300">{formatPaiseToINR(profitability.totalPureFreightPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Loading & Statistical:</span>
                <span className="font-mono text-slate-300">
                  {formatPaiseToINR(profitability.totalFreightRevenuePaise - profitability.totalPureFreightPaise)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/80">
                <span className="text-emerald-400">Advance Collected:</span>
                <span className="font-mono text-emerald-400 font-semibold">{formatPaiseToINR(profitability.totalAdvanceReceivedPaise)}</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Total Hire Expenses from Current Trips */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                Trip Hire Expenses
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                Payable to Motor Malik
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {formatPaiseToINR(profitability.totalHireExpensePaise)}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Advance Paid to Owner:</span>
                <span className="font-mono text-slate-300">{formatPaiseToINR(profitability.totalAdvancePaidToOwnersPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Balance Due at POD:</span>
                <span className="font-mono text-slate-300">{formatPaiseToINR(profitability.totalBalancePayableToOwnersPaise)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/80">
                <span>Broker Commission:</span>
                <span className="font-mono text-slate-300">{formatPaiseToINR(profitability.totalBrokerCommissionPaise)}</span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Net Difference & Retained Profit */}
          <div className={`border rounded-lg p-4 relative overflow-hidden ${
            profitability.grossProfitPaise >= 0
              ? 'bg-emerald-950/20 border-emerald-800/60'
              : 'bg-rose-950/20 border-rose-800/60'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                Gross Operating Profit
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                Revenue − Hire
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {formatPaiseToINR(profitability.grossProfitPaise)}
              </span>
              <span className={`text-xs font-mono font-bold ${
                profitability.grossProfitPaise >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                ({profitability.grossMarginPct}%)
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Net Retained Margin:</span>
                <span className="font-mono text-white font-semibold">{formatPaiseToINR(profitability.netOperatingProfitPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Advance Cash Cushion:</span>
                <span className="font-mono text-emerald-400 font-semibold">{formatPaiseToINR(profitability.advanceCashSpreadPaise)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/80">
                <span>Balance Spread:</span>
                <span className={`font-mono font-semibold ${profitability.balanceSpreadPaise >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {formatPaiseToINR(profitability.balanceSpreadPaise)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Revenue vs Hire Progress Bar */}
        <div className="px-5 pb-5">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
                <span className="text-slate-300 font-medium">Motor Malik Hire Cost:</span>
                <span className="font-mono text-amber-400 tabular-nums">
                  {profitability.totalFreightRevenuePaise > 0 
                    ? ((profitability.totalHireExpensePaise / profitability.totalFreightRevenuePaise) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
                <span className="text-slate-300 font-medium">Net Gross Margin:</span>
                <span className="font-mono text-emerald-400 tabular-nums">
                  {profitability.grossMarginPct}%
                </span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-amber-500/90 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, profitability.totalFreightRevenuePaise > 0 ? (profitability.totalHireExpensePaise / profitability.totalFreightRevenuePaise) * 100 : 0))}%` }}
                title="Truck Hire Cost Share"
              ></div>
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, profitability.grossMarginPct))}%` }}
                title="Retained Margin Share"
              ></div>
            </div>
          </div>
        </div>

        {/* Visual Sparkline Trend Chart: 7-Day Rolling Freight Revenue vs. Operating Expenses */}
        <div className="px-5 pb-5">
          <RollingTrendSparkline trend={rollingTrend} />
        </div>

        {/* Expandable Per-Trip Profitability Breakdown Table */}
        {showProfitDetails && (
          <div className="border-t border-slate-800 bg-slate-950/80 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                Trip-by-Trip Profitability Ledger & Spread
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {profitability.profitableTripsCount} in Profit · {profitability.deficitTripsCount} in Deficit
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="px-3 py-2 rounded-l">Trip Number & Route</th>
                    <th className="px-3 py-2">Consignments</th>
                    <th className="px-3 py-2 text-right">LR Freight Revenue</th>
                    <th className="px-3 py-2 text-right">Truck Hire Cost</th>
                    <th className="px-3 py-2 text-right">Gross Profit</th>
                    <th className="px-3 py-2 text-right">Margin %</th>
                    <th className="px-3 py-2 text-center rounded-r">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {profitability.tripBreakdowns.map((t) => (
                    <tr key={t.tripId} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="font-mono font-semibold text-white">{t.tripNumber}</div>
                        <div className="text-[11px] text-slate-400">{t.originCity} ➔ {t.destinationCity}</div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-300">
                        {t.lrCount} bilty issued
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold text-emerald-400 tabular-nums">
                        {formatPaiseToINR(t.totalFreightRevenuePaise)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-amber-400 tabular-nums">
                        {formatPaiseToINR(t.totalHireExpensePaise)}
                      </td>
                      <td className={`px-3 py-2.5 text-right font-mono font-bold tabular-nums ${
                        t.grossProfitPaise >= 0 ? 'text-white' : 'text-rose-400'
                      }`}>
                        {formatPaiseToINR(t.grossProfitPaise)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold tabular-nums">
                        <span className={t.grossMarginPct >= 10 ? 'text-emerald-400' : t.grossMarginPct > 0 ? 'text-amber-400' : 'text-rose-400'}>
                          {t.grossMarginPct}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          t.marginStatus === 'EXCELLENT'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : t.marginStatus === 'HEALTHY'
                            ? 'bg-teal-950 text-teal-300 border border-teal-800'
                            : t.marginStatus === 'MODERATE'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {t.marginStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Featured Master Trip Spotlight: MP09SR4241 Indore to Nashik */}
      {activeTrip && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-display font-bold text-base text-white">
                  Trip {activeTrip.tripNumber}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {activeTrip.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeTrip.originCity} ➔ {activeTrip.destinationCity}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Arranged through Broker: <strong className="text-slate-300">{brokerParty?.legalName}</strong> · Vehicle Owner: <strong className="text-slate-300">{vehicleOwnerParty?.legalName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenTrackingModal(activeTrip.trackingToken)}
                className="px-3 py-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                Customer Tracking Link
              </button>
              <button
                onClick={() => onOpenTripDetails(activeTrip)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                Inspect Dispatch
              </button>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Vehicle & Driver Technical Profile */}
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Assigned Vehicle & Hardware
              </h2>
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Registration No:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    {activeVehicle?.registrationNo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Capacity & Dimensions:</span>
                  <span className="text-xs font-medium text-slate-200">
                    {activeVehicle?.capacityMt} MT · 20 × 8 × 8.5 ft
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Vehicle Category:</span>
                  <span className="text-xs font-medium text-slate-200">
                    {activeVehicle?.category} (Closed Body)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">GPS & FASTag:</span>
                  <span className="text-xs font-mono text-slate-300">
                    IMEI: {activeVehicle?.gpsDeviceImei}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Assigned Driver:</span>
                  <span className="text-xs font-medium text-slate-200">
                    Mohan Singh Yadav (+91 98260 99881)
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Multi-Stop Consignments Progress */}
            <div className="space-y-3 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Multi-Stop Delivery Lifecycle (3 Drops)
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  Total Cargo: 600 Cartons (12,000 kg)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {activeTrip.stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className={`p-3 rounded-lg border ${
                      stop.status === 'COMPLETED'
                        ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                        : stop.status === 'REACHED'
                        ? 'bg-amber-950/20 border-amber-800/60 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider">
                        Stop {idx + 1}: {stop.stopType}
                      </span>
                      <span className={`text-[10px] font-bold ${
                        stop.status === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {stop.status}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {stop.city}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {stop.locationName}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                      <span>{stop.packagesCount} Cartons</span>
                      <span>{stop.lrNumbers?.[0] || 'Origin'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Settlement Breakdown */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Agreed Shipper Freight: </span>
                  <span className="font-mono font-bold text-white">
                    {formatPaiseToINR(activeTrip.totalAgreedFreightPaise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Advance Paid by Shipper: </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatPaiseToINR(totalAdvanceReceivedPaise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Shipper Balance Due: </span>
                  <span className="font-mono font-bold text-amber-400">
                    {formatPaiseToINR(totalReceivablePaise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Brokerage Fee: </span>
                  <span className="font-mono font-bold text-slate-300">
                    {formatPaiseToINR(activeTrip.brokerCommissionPaise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Truck Owner Payable: </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatPaiseToINR(activeTrip.balancePayableToOwnerPaise)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Matrix to All 4 Core Operational Domains */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module 1: Dispatch */}
        <div
          onClick={() => onNavigateTab('dispatch')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-white">Dispatch & Trips</h2>
          <p className="mt-1 text-xs text-slate-400">
            Multi-stop trip planning, broker freight agreements, and driver scheduling.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 font-mono">
            {trips.length} active transits logged
          </div>
        </div>

        {/* Module 2: Bilty */}
        <div
          onClick={() => onNavigateTab('bilty')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-white">LR / Bilty Documents</h2>
          <p className="mt-1 text-xs text-slate-400">
            Printable Indian consignments, package weight math, digital POD uploads.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 font-mono">
            {lorryReceipts.length} lorry receipts generated
          </div>
        </div>

        {/* Module 3: Accounting */}
        <div
          onClick={() => onNavigateTab('accounting')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-950 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-white">Double-Entry Financials</h2>
          <p className="mt-1 text-xs text-slate-400">
            Party-wise sub-ledgers, TDS 194C, balanced journal vouchers, and P&L.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-amber-400 font-mono">
            {journalEntries.length} immutable journal entries
          </div>
        </div>

        {/* Module 4: Telematics */}
        <div
          onClick={() => onNavigateTab('telematics')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-white">Telematics & AIS-140</h2>
          <p className="mt-1 text-xs text-slate-400">
            Highway route replay, XOR checksum decoder, driver beacon emulator.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 font-mono">
            Live NH-52 replay active
          </div>
        </div>
      </div>
    </div>
  );
};
